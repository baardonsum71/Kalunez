-- Kalunez — initial Supabase schema
-- Replaces Base44 entities (base44/entities/*.jsonc) with Postgres tables + RLS.

create extension if not exists pgcrypto;

-- ============================================================
-- Helper: updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- profiles (replaces User entity)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'premium', 'premium_podcast')),
  role text not null default 'user' check (role in ('admin', 'user')),
  profile_picture_url text,
  artist_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- tracks
-- ============================================================
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  genre text check (genre in ('Pop','Rock','Hip Hop','Electronic','Jazz','R&B','Classical','Country','Reggae','Other')),
  duration numeric,
  audio_url text,
  cover_url text,
  plays integer not null default 0,
  likes integer not null default 0,
  description text,
  is_featured boolean not null default false,
  rights_attested_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tracks_genre on tracks(genre);
create index if not exists idx_tracks_is_featured on tracks(is_featured);
create index if not exists idx_tracks_created_by on tracks(created_by);
create trigger tracks_set_updated_at before update on tracks for each row execute function set_updated_at();

-- ============================================================
-- live_streams
-- ============================================================
create table if not exists live_streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  category text check (category in ('Music','Electronic','Hip Hop','Rock','Jazz')),
  stream_type text check (stream_type in ('Audio Only','Video')),
  description text,
  thumbnail_url text,
  viewer_count integer not null default 0,
  reaction_count integer not null default 0,
  is_live boolean not null default true,
  stream_url text,
  provider text not null default 'livekit' check (provider in ('livekit','mux')),
  room_name text,
  mux_playback_id text,
  mux_live_stream_id text,
  ended_at timestamptz,
  duration_seconds numeric,
  rights_attested_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_live_streams_is_live on live_streams(is_live);
create index if not exists idx_live_streams_created_by on live_streams(created_by);
create trigger live_streams_set_updated_at before update on live_streams for each row execute function set_updated_at();

-- ============================================================
-- follows
-- ============================================================
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_email text not null,
  artist_name text not null,
  created_at timestamptz not null default now(),
  unique (follower_email, artist_name)
);
create index if not exists idx_follows_follower_email on follows(follower_email);
create index if not exists idx_follows_artist_name on follows(artist_name);

-- ============================================================
-- notifications
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  type text not null check (type in ('track_upload','live_stream')),
  artist_name text not null,
  content_id text not null,
  content_title text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_email on notifications(user_email);

-- ============================================================
-- chat_messages
-- ============================================================
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  stream_id text not null,
  sender_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_messages_stream_id on chat_messages(stream_id);

-- ============================================================
-- messages
-- ============================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  sender_email text not null,
  sender_name text not null,
  recipient_email text not null,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_thread_id on messages(thread_id);
create index if not exists idx_messages_sender_email on messages(sender_email);
create index if not exists idx_messages_recipient_email on messages(recipient_email);

-- ============================================================
-- playlists
-- ============================================================
create table if not exists playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  track_ids text[] not null default '{}',
  is_public boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_playlists_created_by on playlists(created_by);
create trigger playlists_set_updated_at before update on playlists for each row execute function set_updated_at();

-- ============================================================
-- comments
-- ============================================================
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  content_id text not null,
  content_type text not null check (content_type in ('track','vod')),
  author_name text not null,
  author_email text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_content_id on comments(content_id);

-- ============================================================
-- activities
-- ============================================================
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name text not null,
  action_type text not null check (action_type in ('like','playlist_add','listen')),
  track_id text not null,
  track_title text not null,
  artist_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_activities_created_at on activities(created_at desc);

-- ============================================================
-- analytics_events
-- ============================================================
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_email text,
  anonymous_id text,
  session_id text,
  page_path text,
  entity_type text,
  entity_id text,
  value numeric,
  properties_json text,
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_events_event_name on analytics_events(event_name);
create index if not exists idx_analytics_events_created_at on analytics_events(created_at desc);
create index if not exists idx_analytics_events_user_email on analytics_events(user_email);

-- ============================================================
-- tips (RevenueCat-driven, no Stripe checkout fields)
-- ============================================================
create table if not exists tips (
  id uuid primary key default gen_random_uuid(),
  tipper_email text not null,
  artist_name text not null,
  artist_email text,
  amount_cents integer not null,
  currency text not null default 'usd',
  platform_fee_cents integer not null default 0,
  revenuecat_transaction_id text,
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  message text,
  created_at timestamptz not null default now()
);
create index if not exists idx_tips_artist_email on tips(artist_email);
create index if not exists idx_tips_tipper_email on tips(tipper_email);

-- ============================================================
-- subscriptions (RevenueCat-driven, no Stripe fields)
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  tier text not null check (tier in ('free','pro','premium','premium_podcast')),
  revenuecat_app_user_id text,
  revenuecat_product_id text,
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing','expired')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_user_email on subscriptions(user_email);
create trigger subscriptions_set_updated_at before update on subscriptions for each row execute function set_updated_at();

-- ============================================================
-- track_drafts
-- ============================================================
create table if not exists track_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_email text not null,
  audio_url text,
  collaborator_emails text[] not null default '{}',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_track_drafts_artist_email on track_drafts(artist_email);
create trigger track_drafts_set_updated_at before update on track_drafts for each row execute function set_updated_at();

-- ============================================================
-- collab_feedback
-- ============================================================
create table if not exists collab_feedback (
  id uuid primary key default gen_random_uuid(),
  track_draft_id uuid references track_drafts(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  timestamp_seconds numeric not null,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_collab_feedback_track_draft_id on collab_feedback(track_draft_id);

-- ============================================================
-- artist_accounts (Stripe Connect = payout rail only, see docs/PAYMENTS.md)
-- ============================================================
create table if not exists artist_accounts (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  artist_name text not null,
  stripe_connect_account_id text,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  total_earnings_cents integer not null default 0,
  pending_earnings_cents integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_artist_accounts_artist_name on artist_accounts(artist_name);
create trigger artist_accounts_set_updated_at before update on artist_accounts for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table tracks enable row level security;
alter table live_streams enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;
alter table chat_messages enable row level security;
alter table messages enable row level security;
alter table playlists enable row level security;
alter table comments enable row level security;
alter table activities enable row level security;
alter table analytics_events enable row level security;
alter table tips enable row level security;
alter table subscriptions enable row level security;
alter table track_drafts enable row level security;
alter table collab_feedback enable row level security;
alter table artist_accounts enable row level security;

-- profiles: public read (artist profile pages), own-row write
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- tracks: public read, owner write
create policy "tracks_select_all" on tracks for select using (true);
create policy "tracks_insert_own" on tracks for insert with check (created_by = auth.jwt()->>'email');
create policy "tracks_update_own" on tracks for update using (created_by = auth.jwt()->>'email');
create policy "tracks_delete_own" on tracks for delete using (created_by = auth.jwt()->>'email');

-- live_streams: public read, owner write
create policy "live_streams_select_all" on live_streams for select using (true);
create policy "live_streams_insert_own" on live_streams for insert with check (created_by = auth.jwt()->>'email');
create policy "live_streams_update_own" on live_streams for update using (created_by = auth.jwt()->>'email');

-- follows: public read, own write
create policy "follows_select_all" on follows for select using (true);
create policy "follows_insert_own" on follows for insert with check (follower_email = auth.jwt()->>'email');
create policy "follows_delete_own" on follows for delete using (follower_email = auth.jwt()->>'email');

-- notifications: own row only
create policy "notifications_select_own" on notifications for select using (user_email = auth.jwt()->>'email');
create policy "notifications_update_own" on notifications for update using (user_email = auth.jwt()->>'email');
create policy "notifications_delete_own" on notifications for delete using (user_email = auth.jwt()->>'email');
create policy "notifications_insert_service" on notifications for insert with check (auth.role() = 'service_role');

-- chat_messages: public read, authenticated insert
create policy "chat_messages_select_all" on chat_messages for select using (true);
create policy "chat_messages_insert_auth" on chat_messages for insert with check (auth.role() in ('authenticated','service_role'));

-- messages: participants only
create policy "messages_select_participant" on messages for select
  using (sender_email = auth.jwt()->>'email' or recipient_email = auth.jwt()->>'email');
create policy "messages_insert_own" on messages for insert
  with check (sender_email = auth.jwt()->>'email');
create policy "messages_update_participant" on messages for update
  using (sender_email = auth.jwt()->>'email' or recipient_email = auth.jwt()->>'email');

-- playlists: public read if is_public, owner full access
create policy "playlists_select_public_or_own" on playlists for select
  using (is_public = true or created_by = auth.jwt()->>'email');
create policy "playlists_insert_own" on playlists for insert with check (created_by = auth.jwt()->>'email');
create policy "playlists_update_own" on playlists for update using (created_by = auth.jwt()->>'email');
create policy "playlists_delete_own" on playlists for delete using (created_by = auth.jwt()->>'email');

-- comments: public read, authenticated insert
create policy "comments_select_all" on comments for select using (true);
create policy "comments_insert_auth" on comments for insert with check (author_email = auth.jwt()->>'email');

-- activities: public read (activity feed), own insert
create policy "activities_select_all" on activities for select using (true);
create policy "activities_insert_own" on activities for insert with check (user_email = auth.jwt()->>'email');

-- analytics_events: anyone can insert (anonymous tracking), only service_role can read
create policy "analytics_events_insert_all" on analytics_events for insert with check (true);
create policy "analytics_events_select_service" on analytics_events for select using (auth.role() = 'service_role');

-- tips: tipper or artist can read, only service_role writes (RevenueCat webhook)
create policy "tips_select_related" on tips for select
  using (tipper_email = auth.jwt()->>'email' or artist_email = auth.jwt()->>'email');
create policy "tips_write_service" on tips for insert with check (auth.role() = 'service_role');
create policy "tips_update_service" on tips for update using (auth.role() = 'service_role');

-- subscriptions: own row read, only service_role writes (RevenueCat webhook)
create policy "subscriptions_select_own" on subscriptions for select using (user_email = auth.jwt()->>'email');
create policy "subscriptions_write_service" on subscriptions for insert with check (auth.role() = 'service_role');
create policy "subscriptions_update_service" on subscriptions for update using (auth.role() = 'service_role');

-- track_drafts: artist or collaborator only
create policy "track_drafts_select_related" on track_drafts for select
  using (artist_email = auth.jwt()->>'email' or (auth.jwt()->>'email') = any(collaborator_emails));
create policy "track_drafts_insert_own" on track_drafts for insert with check (artist_email = auth.jwt()->>'email');
create policy "track_drafts_update_related" on track_drafts for update
  using (artist_email = auth.jwt()->>'email' or (auth.jwt()->>'email') = any(collaborator_emails));

-- collab_feedback: related to accessible draft only
create policy "collab_feedback_select_related" on collab_feedback for select
  using (
    exists (
      select 1 from track_drafts d
      where d.id = collab_feedback.track_draft_id
        and (d.artist_email = auth.jwt()->>'email' or (auth.jwt()->>'email') = any(d.collaborator_emails))
    )
  );
create policy "collab_feedback_insert_related" on collab_feedback for insert
  with check (
    author_email = auth.jwt()->>'email'
    and exists (
      select 1 from track_drafts d
      where d.id = collab_feedback.track_draft_id
        and (d.artist_email = auth.jwt()->>'email' or (auth.jwt()->>'email') = any(d.collaborator_emails))
    )
  );

-- artist_accounts: own row only (functions use service_role and bypass RLS)
create policy "artist_accounts_select_own" on artist_accounts for select using (user_email = auth.jwt()->>'email');

-- ============================================================
-- Realtime publication (for chat_messages, messages, activities)
-- ============================================================
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table activities;

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "storage_public_read_audio" on storage.objects for select using (bucket_id = 'audio');
create policy "storage_public_read_covers" on storage.objects for select using (bucket_id = 'covers');
create policy "storage_public_read_avatars" on storage.objects for select using (bucket_id = 'avatars');

create policy "storage_auth_insert_audio" on storage.objects for insert
  with check (bucket_id = 'audio' and auth.role() = 'authenticated');
create policy "storage_auth_insert_covers" on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');
create policy "storage_auth_insert_avatars" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
