-- Alivora V1.0 — identity and households (PRD §9.1)
create extension if not exists pgcrypto;

create type household_role as enum ('owner', 'admin', 'member');
create type membership_status as enum ('active', 'inactive');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name varchar(100) not null,
  avatar_path text,
  locale varchar(20) not null default 'en-GB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  owner_id uuid not null references public.profiles (id),
  timezone text not null default 'Europe/London',
  briefing_local_time time not null default '19:00',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role household_role not null,
  status membership_status not null default 'active',
  joined_at timestamptz not null default now()
);
-- Unique active membership per household/user pair.
create unique index household_members_active_unique
  on public.household_members (household_id, user_id) where status = 'active';
create index household_members_user_idx on public.household_members (user_id) where status = 'active';

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  email text not null check (email = lower(email)),
  role household_role not null default 'member' check (role <> 'owner'),
  token_hash text not null unique, -- SHA-256 of a cryptographically random token; raw token never stored
  invited_by uuid not null references public.profiles (id),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index household_invites_household_idx on public.household_invites (household_id);

create table public.dependent_profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  display_name varchar(100) not null,
  avatar_path text,
  colour varchar(9),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dependent_profiles_household_idx on public.dependent_profiles (household_id);

-- Creates the household and owner membership in one transaction (HUB acceptance criteria).
create or replace function public.create_household(p_name text, p_timezone text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  insert into households (name, owner_id, timezone) values (p_name, auth.uid(), p_timezone)
  returning id into v_household;
  insert into household_members (household_id, user_id, role) values (v_household, auth.uid(), 'owner');
  return v_household;
end;
$$;
revoke all on function public.create_household(text, text) from public;
grant execute on function public.create_household(text, text) to authenticated;
