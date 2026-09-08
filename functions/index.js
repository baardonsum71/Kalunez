const admin = require('firebase-admin');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

const LIVEKIT_API_KEY = defineSecret('LIVEKIT_API_KEY');
const LIVEKIT_API_SECRET = defineSecret('LIVEKIT_API_SECRET');
const LIVEKIT_URL = defineSecret('LIVEKIT_URL');
const MUX_TOKEN_ID = defineSecret('MUX_TOKEN_ID');
const MUX_TOKEN_SECRET = defineSecret('MUX_TOKEN_SECRET');
const STRIPE_API_KEY = defineSecret('STRIPE_API_KEY');
const APP_URL = defineSecret('APP_URL');
const REVENUECAT_WEBHOOK_AUTH = defineSecret('REVENUECAT_WEBHOOK_AUTH');

function requireAuth(request) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required');
  }
  return {
    uid: request.auth.uid,
    email: request.auth.token.email || '',
    name: request.auth.token.name || request.auth.token.email || '',
  };
}

async function getProfile(uid) {
  const snap = await db.collection('profiles').doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function findOne(collection, field, value) {
  const snap = await db.collection(collection).where(field, '==', value).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

function tsToIso(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value.toDate) return value.toDate().toISOString();
  return null;
}

const PRODUCT_TIER_MAP = {
  pro_monthly: 'pro',
  pro_monthly_subscription: 'pro',
  premium_monthly: 'premium',
  premium_monthly_subscription: 'premium',
  premium_podcast_monthly: 'premium_podcast',
  premium_yearly: 'premium',
  premium_podcast_yearly: 'premium_podcast',
};

// --- LiveKit ---

exports.getLiveKitToken = onCall(
  { secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL], region: 'us-central1' },
  async (request) => {
    const user = requireAuth(request);
    const { roomName, role = 'viewer', streamId } = request.data || {};
    if (!roomName) throw new HttpsError('invalid-argument', 'Missing roomName');

    const apiKey = LIVEKIT_API_KEY.value();
    const apiSecret = LIVEKIT_API_SECRET.value();
    const livekitUrl = LIVEKIT_URL.value();
    if (!apiKey || !apiSecret || !livekitUrl) {
      throw new HttpsError('unavailable', 'LiveKit not configured');
    }

    if (role === 'publisher' && streamId) {
      const stream = await db.collection('live_streams').doc(String(streamId)).get();
      if (!stream.exists || stream.data()?.room_name !== roomName) {
        throw new HttpsError('not-found', 'Stream not found');
      }
    }

    const identity = user.email || user.uid;
    const isPublisher = role === 'publisher';
    const at = new AccessToken(apiKey, apiSecret, {
      identity: isPublisher ? `host-${identity}` : `viewer-${identity}-${Date.now()}`,
      name: user.name || identity,
      ttl: isPublisher ? '6h' : '2h',
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isPublisher,
      canSubscribe: true,
      canPublishData: true,
    });

    return {
      token: await at.toJwt(),
      url: livekitUrl,
      roomName,
      role,
    };
  }
);

exports.getLiveKitRoomInfo = onCall(
  { secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL], region: 'us-central1' },
  async (request) => {
    requireAuth(request);
    const { roomName } = request.data || {};
    if (!roomName) throw new HttpsError('invalid-argument', 'Missing roomName');

    const apiKey = LIVEKIT_API_KEY.value();
    const apiSecret = LIVEKIT_API_SECRET.value();
    const livekitUrl = LIVEKIT_URL.value();
    if (!apiKey || !apiSecret || !livekitUrl) {
      throw new HttpsError('unavailable', 'LiveKit not configured');
    }

    const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
    let viewerCount = 0;
    try {
      const participants = await client.listParticipants(roomName);
      viewerCount = participants.filter((p) => !String(p.identity || '').startsWith('host-')).length;
    } catch {
      viewerCount = 0;
    }
    return { roomName, viewerCount };
  }
);

// --- Mux ---

exports.createMuxLiveStream = onCall(
  { secrets: [MUX_TOKEN_ID, MUX_TOKEN_SECRET], region: 'us-central1' },
  async (request) => {
    requireAuth(request);
    const { title, streamId } = request.data || {};
    const tokenId = MUX_TOKEN_ID.value();
    const tokenSecret = MUX_TOKEN_SECRET.value();
    if (!tokenId || !tokenSecret) {
      throw new HttpsError('unavailable', 'Mux not configured');
    }

    const auth = Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64');
    const muxRes = await fetch('https://api.mux.com/video/v1/live-streams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        playback_policy: ['public'],
        new_asset_settings: { playback_policy: ['public'] },
        passthrough: streamId || title || '',
        reduced_latency: true,
      }),
    });

    if (!muxRes.ok) {
      const err = await muxRes.text();
      throw new HttpsError('internal', `Mux API error: ${err}`);
    }

    const { data: liveStream } = await muxRes.json();
    const playbackId = liveStream.playback_ids?.[0]?.id;
    return {
      muxLiveStreamId: liveStream.id,
      muxPlaybackId: playbackId,
      streamKey: liveStream.stream_key,
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      hlsUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null,
    };
  }
);

// --- Stripe Connect ---

exports.createConnectAccount = onCall(
  { secrets: [STRIPE_API_KEY, APP_URL], region: 'us-central1' },
  async (request) => {
    const user = requireAuth(request);
    const { artistName, country = 'NO' } = request.data || {};
    if (!artistName?.trim()) throw new HttpsError('invalid-argument', 'Missing artistName');

    const stripe = new Stripe(STRIPE_API_KEY.value());
    const trimmedName = artistName.trim();
    const appUrl = APP_URL.value() || 'https://www.kalunez.com';

    let artistAccount = await findOne('artist_accounts', 'user_email', user.email);
    let connectAccountId = artistAccount?.stripe_connect_account_id;

    if (!connectAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { user_email: user.email, artist_name: trimmedName },
      });
      connectAccountId = account.id;

      if (artistAccount) {
        await db.collection('artist_accounts').doc(artistAccount.id).update({
          artist_name: trimmedName,
          stripe_connect_account_id: connectAccountId,
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        const ref = await db.collection('artist_accounts').add({
          user_email: user.email,
          artist_name: trimmedName,
          stripe_connect_account_id: connectAccountId,
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
          total_earnings_cents: 0,
          pending_earnings_cents: 0,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        artistAccount = { id: ref.id };
      }

      await db.collection('profiles').doc(user.uid).set(
        { artist_name: trimmedName, updated_at: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${appUrl}/artist-dashboard?connect=refresh`,
      return_url: `${appUrl}/artist-dashboard?connect=success`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url, accountId: connectAccountId, artistName: trimmedName };
  }
);

exports.getArtistAccount = onCall(
  { secrets: [STRIPE_API_KEY], region: 'us-central1' },
  async (request) => {
    const user = requireAuth(request);
    const { type = 'status' } = request.data || {};
    const stripe = new Stripe(STRIPE_API_KEY.value());
    const artistAccount = await findOne('artist_accounts', 'user_email', user.email);

    if (type === 'dashboard' && artistAccount?.stripe_connect_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(artistAccount.stripe_connect_account_id);
      return { url: loginLink.url };
    }

    if (!artistAccount?.stripe_connect_account_id) {
      return { connected: false, account: null };
    }

    const stripeAccount = await stripe.accounts.retrieve(artistAccount.stripe_connect_account_id);
    const updated = {
      charges_enabled: stripeAccount.charges_enabled ?? false,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
      details_submitted: stripeAccount.details_submitted ?? false,
    };
    await db.collection('artist_accounts').doc(artistAccount.id).update({
      ...updated,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const tipsSnap = await db.collection('tips')
      .where('artist_email', '==', user.email)
      .where('status', '==', 'completed')
      .limit(500)
      .get();
    const totalEarnings = tipsSnap.docs.reduce((sum, d) => {
      const t = d.data();
      return sum + ((t.amount_cents || 0) - (t.platform_fee_cents || 0));
    }, 0);

    return {
      connected: true,
      account: { ...artistAccount, ...updated, total_earnings_cents: totalEarnings },
    };
  }
);

exports.payoutArtistEarnings = onCall(
  { secrets: [STRIPE_API_KEY], region: 'us-central1' },
  async (request) => {
    const user = requireAuth(request);
    const profile = await getProfile(user.uid);
    const { artistEmail } = request.data || {};
    const targetEmail = profile?.role === 'admin' && artistEmail ? artistEmail : user.email;

    const account = await findOne('artist_accounts', 'user_email', targetEmail);
    if (!account?.stripe_connect_account_id) {
      throw new HttpsError('failed-precondition', 'No payout account on file');
    }
    if (!account.charges_enabled || !account.payouts_enabled) {
      throw new HttpsError('failed-precondition', 'Stripe Connect onboarding incomplete');
    }
    if (!account.pending_earnings_cents || account.pending_earnings_cents <= 0) {
      throw new HttpsError('failed-precondition', 'Nothing to pay out');
    }

    const stripe = new Stripe(STRIPE_API_KEY.value());
    const amount = account.pending_earnings_cents;
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: account.stripe_connect_account_id,
      metadata: { artist_email: targetEmail },
    });

    await db.collection('artist_accounts').doc(account.id).update({
      pending_earnings_cents: 0,
      total_earnings_cents: (account.total_earnings_cents || 0) + amount,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { transferId: transfer.id, amountCents: amount };
  }
);

// --- Analytics ---

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(iso) {
  return iso ? String(iso).slice(0, 10) : null;
}

exports.getArtistAnalytics = onCall({ region: 'us-central1' }, async (request) => {
  const user = requireAuth(request);
  const days = Number(request.data?.days || 30);

  const [tracksSnap, streamsSnap, tipsSnap, eventsSnap] = await Promise.all([
    db.collection('tracks').where('created_by', '==', user.email).limit(100).get(),
    db.collection('live_streams').where('created_by', '==', user.email).limit(100).get(),
    db.collection('tips').where('artist_email', '==', user.email).where('status', '==', 'completed').limit(200).get(),
    db.collection('analytics_events').where('user_email', '==', user.email).limit(500).get(),
  ]);

  const tracks = tracksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const streams = streamsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const tips = tipsSnap.docs.map((d) => ({ id: d.id, ...d.data(), created_at: tsToIso(d.data().created_at) }));
  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data(), created_at: tsToIso(d.data().created_at) }));

  const cutoff = daysAgo(days);
  const recentEvents = events.filter((e) => e.created_at && new Date(e.created_at) >= cutoff);
  const playsByDay = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d.toISOString());
    if (key) playsByDay[key] = 0;
  }
  for (const e of recentEvents) {
    if (e.event_name === 'track_played') {
      const key = toDateKey(e.created_at);
      if (key && playsByDay[key] !== undefined) playsByDay[key] += 1;
    }
  }

  return {
    overview: {
      totalTracks: tracks.length,
      totalPlays: tracks.reduce((s, t) => s + (t.plays || 0), 0),
      totalLikes: tracks.reduce((s, t) => s + (t.likes || 0), 0),
      totalStreams: streams.length,
      liveStreams: streams.filter((s) => s.is_live).length,
      totalTips: tips.length,
      tipEarningsCents: tips.reduce((s, t) => s + ((t.amount_cents || 0) - (t.platform_fee_cents || 0)), 0),
      profileViews: recentEvents.filter((e) => e.event_name === 'artist_profile_viewed').length,
    },
    playsByDay: Object.entries(playsByDay).map(([date, plays]) => ({ date, plays })),
    topTracks: [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5)
      .map((t) => ({ id: t.id, title: t.title, plays: t.plays || 0, likes: t.likes || 0 })),
    recentTips: tips.slice(0, 5).map((t) => ({
      amountCents: t.amount_cents,
      netCents: (t.amount_cents || 0) - (t.platform_fee_cents || 0),
      date: t.created_at,
    })),
  };
});

exports.getPlatformAnalytics = onCall({ region: 'us-central1' }, async (request) => {
  const user = requireAuth(request);
  const profile = await getProfile(user.uid);
  if (profile?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  const [tracksSnap, streamsSnap, tipsSnap, subsSnap, eventsSnap] = await Promise.all([
    db.collection('tracks').limit(500).get(),
    db.collection('live_streams').limit(500).get(),
    db.collection('tips').where('status', '==', 'completed').limit(500).get(),
    db.collection('subscriptions').where('status', '==', 'active').limit(500).get(),
    db.collection('analytics_events').limit(2000).get(),
  ]);

  const tracks = tracksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const streams = streamsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const tips = tipsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const subscriptions = subsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const events30d = eventsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    created_at: tsToIso(d.data().created_at),
  }));

  const cutoff7 = daysAgo(7);
  const cutoff30 = daysAgo(30);
  const events7d = events30d.filter((e) => e.created_at && new Date(e.created_at) >= cutoff7);
  const eventsIn30 = events30d.filter((e) => e.created_at && new Date(e.created_at) >= cutoff30);

  return {
    overview: {
      totalTracks: tracks.length,
      totalPlays: tracks.reduce((s, t) => s + (t.plays || 0), 0),
      totalStreams: streams.length,
      liveStreamsNow: streams.filter((s) => s.is_live).length,
      totalArtists: new Set(tracks.map((t) => t.artist).filter(Boolean)).size,
      totalTips: tips.length,
      tipRevenueCents: tips.reduce((s, t) => s + (t.amount_cents || 0), 0),
      activeSubscriptions: subscriptions.length,
      uniqueUsers7d: new Set(events7d.map((e) => e.user_email || e.anonymous_id).filter(Boolean)).size,
      uniqueUsers30d: new Set(eventsIn30.map((e) => e.user_email || e.anonymous_id).filter(Boolean)).size,
      pageViews7d: events7d.filter((e) => e.event_name === 'page_view').length,
    },
    topTracks: [...tracks]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 10)
      .map((t) => ({ id: t.id, title: t.title, artist: t.artist, plays: t.plays || 0, likes: t.likes || 0 })),
    generatedAt: new Date().toISOString(),
  };
});

// --- RevenueCat webhook (HTTP) ---

exports.handleRevenueCatWebhook = onRequest(
  { secrets: [REVENUECAT_WEBHOOK_AUTH], region: 'us-central1' },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
      }
      const expectedAuth = REVENUECAT_WEBHOOK_AUTH.value();
      const receivedAuth = req.get('Authorization');
      if (expectedAuth && receivedAuth !== expectedAuth) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      const event = req.body?.event;
      if (!event) {
        res.status(400).json({ error: 'Missing event' });
        return;
      }

      const productId = event.product_id || '';
      const tipPrefixes = ['kalunez_tip_', 'tip_credit_'];
      const isTip = tipPrefixes.some((p) => productId.startsWith(p));
      const isTicket = productId.startsWith('event_ticket');

      if (isTip && event.type === 'NON_RENEWING_PURCHASE') {
        const tipperEmail = event.app_user_id?.includes('@') ? event.app_user_id : undefined;
        const artistName = event.subscriber_attributes?.artistName?.value;
        const amountCents = Math.round((event.price_in_purchased_currency || event.price || 0) * 100);
        if (artistName && amountCents) {
          const artistAccount = await findOne('artist_accounts', 'artist_name', artistName);
          const platformFeeCents = Math.round(amountCents * 0.1);
          await db.collection('tips').add({
            tipper_email: tipperEmail || 'anonymous',
            artist_name: artistName,
            artist_email: artistAccount?.user_email || null,
            amount_cents: amountCents,
            platform_fee_cents: platformFeeCents,
            revenuecat_transaction_id: event.id || event.transaction_id,
            status: 'completed',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
          });
          if (artistAccount) {
            await db.collection('artist_accounts').doc(artistAccount.id).update({
              pending_earnings_cents: (artistAccount.pending_earnings_cents || 0) + (amountCents - platformFeeCents),
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      } else if (isTicket && event.type === 'NON_RENEWING_PURCHASE') {
        const userEmail = event.app_user_id?.includes('@')
          ? event.app_user_id
          : event.subscriber_attributes?.$email?.value;
        const eventId = event.subscriber_attributes?.eventId?.value;
        const amountCents = Math.round((event.price_in_purchased_currency || event.price || 0) * 100);
        if (userEmail && eventId) {
          const existing = await db.collection('tickets')
            .where('event_id', '==', eventId)
            .where('user_email', '==', userEmail)
            .limit(1)
            .get();
          if (existing.empty) {
            await db.collection('tickets').add({
              event_id: eventId,
              user_email: userEmail,
              amount_cents: amountCents || 0,
              ticket_product_id: productId,
              revenuecat_transaction_id: event.id || event.transaction_id,
              created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      } else if (
        ['INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'EXPIRATION', 'UNCANCELLATION', 'PRODUCT_CHANGE']
          .includes(event.type)
      ) {
        const userEmail = event.app_user_id?.includes('@')
          ? event.app_user_id
          : event.subscriber_attributes?.$email?.value;
        if (userEmail) {
          const tier = PRODUCT_TIER_MAP[productId] || 'pro';
          const isActive = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'].includes(event.type);
          const isEnding = ['CANCELLATION', 'EXPIRATION'].includes(event.type);
          const existing = await findOne('subscriptions', 'user_email', userEmail);
          const data = {
            user_email: userEmail,
            tier,
            status: isEnding ? (event.type === 'EXPIRATION' ? 'expired' : 'canceled') : 'active',
            revenuecat_app_user_id: event.app_user_id,
            revenuecat_product_id: productId,
            current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
            cancel_at_period_end: event.type === 'CANCELLATION',
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (existing) {
            await db.collection('subscriptions').doc(existing.id).update(data);
          } else {
            await db.collection('subscriptions').add({
              ...data,
              created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          const profile = await findOne('profiles', 'email', userEmail);
          if (profile) {
            await db.collection('profiles').doc(profile.id).update({
              subscription_tier: isActive ? tier : 'free',
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      }

      res.json({ received: true });
    } catch (err) {
      res.status(500).json({ error: err.message || String(err) });
    }
  }
);
