- Ticketed / scheduled live events (extends live_streams)
-- Free Go Live continues to create is_live=true streams with status='live'.
-- Create Event creates status='scheduled' rows; optional is_paid + price_cents.

alter table live_streams
  add column if not exists starts_at timestamptz,
  add column if not exists is_paid boolean not null default false,
  add column if not exists price_cents integer not null default 0,
  add column if not exists ticket_product_id text,
  add column if not exists status text not null default 'live'
    check (status in ('scheduled', 'live', 'ended'));

-- Backfill existing rows
update live_streams
set sta-tus = case when is_live then 'live' else 'ended' end
where status = 'live' and is_live = false;

create index if not exists idx_live_streams_status on live_streams(status);
create index if not exists idx_live_streams_starts_at on live_streams(starts_at);

-- ============================================================
-- tickets (one per user per paid event)
-- ============================================================
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references live_streams(id) on delete cascade,
  user_email text not null,
  amount_cents integer not null default 0,
  ticket_product_id text,
  revenuecat_transaction_id text,
  created_at timestamptz not null default now(),
  unique (event_id, user_email)
);
create index if not exists idx_tickets_event_id on tickets(event_id);
create index if not exists idx_tickets_user_email on tickets(user_email);

alter table tickets enable row level security;

-- Anyone authenticated can see their own tickets; event owners can see ticket count via service/own
create policy "tickets_select_own" on tickets for select
  using (user_email = auth.jwt()->>'email');
create policy "tickets_insert_own" on tickets for insert
  with check (user_email = auth.jwt()->>'email');
-- Service role (webhooks) bypasses RLS
