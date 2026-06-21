# Kalunez Streaming Setup

Kalunez supports two live streaming providers:

| Provider | Best for | Latency | Setup |
|----------|----------|---------|-------|
| **LiveKit** | Browser webcam/mic | ~1–3 sec | One-click Go Live |
| **Mux** | OBS Studio / RTMP | ~5–10 sec | RTMP credentials |

---

## Option 1: LiveKit (Recommended)

LiveKit enables artists to go live directly from the browser with WebRTC.

### 1. Create a LiveKit Cloud account

1. Go to [https://cloud.livekit.io](https://cloud.livekit.io)
2. Create a project (free tier: 50 GB/month)
3. Copy your **API Key**, **API Secret**, and **WebSocket URL**

### 2. Configure Base44 secrets

In Base44 Dashboard → your app → **Secrets**, add:

```
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=your-secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 3. Configure frontend (optional)

Add to `.env.local`:

```
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 4. Deploy backend functions

Deploy these functions to Base44 (via GitHub sync or Base44 editor):

- `getLiveKitToken` — generates publisher/viewer tokens
- `getLiveKitRoomInfo` — returns viewer count

### 5. Test

1. Sign in to Kalunez
2. Go to **Go Live** → select **Browser (LiveKit)**
3. Allow camera/mic → **Go Live Now**
4. Open `/stream/{id}` in another browser/tab to watch

---

## Option 2: Mux (OBS / RTMP)

Mux is ideal for professional streamers using OBS Studio, Streamlabs, or hardware encoders.

### 1. Create a Mux account

1. Go to [https://mux.com](https://mux.com)
2. Create an account (free trial available)
3. Go to **Settings → Access Tokens**
4. Create a token with **Mux Video** read + write permissions

### 2. Configure Base44 secrets

```
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
```

### 3. Enable Mux in frontend

Add to `.env.local`:

```
VITE_MUX_ENABLED=true
```

### 4. Deploy backend function

- `createMuxLiveStream` — creates RTMP ingest + HLS playback

### 5. Test with OBS

1. Go to **Go Live** → select **OBS / RTMP (Mux)**
2. Click **Go Live Now** → copy Server URL and Stream Key
3. In OBS: **Settings → Stream → Custom**
   - Server: `rtmps://global-live.mux.com:443/app`
   - Stream Key: (paste from Kalunez)
4. Click **Start Streaming** in OBS
5. Viewers watch at `/stream/{id}` via Mux HLS player

---

## Architecture

```
Artist (Browser)                    Viewers
      │                                │
      ▼                                ▼
  GoLive.jsx                    StreamDetail.jsx
      │                                │
      ├─ LiveKit ──► WebRTC ──────────► LiveKitViewer
      │                                │
      └─ Mux ──► RTMP/OBS ──► Mux CDN ─► MuxStreamPlayer
```

### Backend functions

| Function | Purpose |
|----------|---------|
| `getLiveKitToken` | JWT tokens for publisher/viewer roles |
| `getLiveKitRoomInfo` | Participant count for viewer stats |
| `createMuxLiveStream` | Create Mux live stream + RTMP credentials |

### Database fields (LiveStream entity)

| Field | Description |
|-------|-------------|
| `provider` | `livekit` or `mux` |
| `room_name` | LiveKit room ID |
| `mux_playback_id` | Mux HLS playback ID |
| `mux_live_stream_id` | Mux resource ID |
| `stream_url` | HLS URL (Mux) |

---

## Cost estimates

| Provider | Free tier | Paid |
|----------|-----------|------|
| LiveKit Cloud | 50 GB/month | ~$0.006/GB after |
| Mux | Trial credits | ~$0.015/min streamed |

For acquisition demos, the free tiers are sufficient for testing.

---

## Troubleshooting

**"LiveKit not configured"** — Add secrets to Base44 and redeploy functions.

**"Failed to connect to LiveKit"** — Check `LIVEKIT_URL` uses `wss://` not `https://`.

**Mux stream shows "Waiting for broadcast"** — OBS must be actively streaming to the RTMP URL.

**No video for viewers** — Ensure the artist clicked "Go Live Now" before viewers join.
