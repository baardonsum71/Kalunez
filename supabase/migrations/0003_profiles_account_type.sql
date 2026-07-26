-- Listener vs artist profiles + ensure signup always creates a profile row.

alter table profiles
  add column if not exists account_type text not null default 'listener'
    check (account_type in ('listener', 'artist')),
  add column if not exists bio text;

-- Recreate signup trigger (security definer so RLS cannot block inserts).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    case
      when new.raw_user_meta_data->>'account_type' = 'artist' then 'artist'
      else 'listener'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow authenticated users to create their own profile (client-side fallback).
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- Backfill missing profiles for any existing auth users.
insert into public.profiles (id, email, full_name, account_type)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  'listener'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
