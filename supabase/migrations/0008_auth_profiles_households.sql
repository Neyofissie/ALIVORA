-- Alivora V1.0 — accounts, households and invitations (PRD §6.1, §6.2), part 1 of 3.
-- Privileged operations run as checked SECURITY DEFINER functions, so the
-- app never needs a service-role key. Errors use stable codes in the message
-- (e.g. INVITE_EXPIRED) that the client maps to friendly copy.

-- Profiles are created on first use rather than by a trigger on auth.users,
-- so these migrations never alter Supabase's managed auth schema.
create or replace function public.ensure_profile(p_display_name text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED' using errcode = '28000'; end if;
  insert into profiles (id, display_name)
  select u.id, left(coalesce(
           nullif(trim(p_display_name), ''),
           nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
           split_part(u.email, '@', 1),
           'Member'), 100)
    from auth.users u where u.id = auth.uid()
  on conflict (id) do nothing;
end;
$$;

-- Helpers -------------------------------------------------------------------

create or replace function public.current_user_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(email) from auth.users where id = auth.uid();
$$;

create or replace function public.household_adult_limit(p_household uuid)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (e.value #>> '{}')::int
       from subscriptions s join entitlements e on e.plan_id = s.plan_id and e.key = 'adult_limit'
      where s.household_id = p_household),
    2);
$$;

create or replace function public.active_adult_count(p_household uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from household_members where household_id = p_household and status = 'active';
$$;

create or replace function public.require_role(p_household uuid, p_roles household_role[])
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED' using errcode = '28000'; end if;
  if household_role_of(p_household) is null or not (household_role_of(p_household) = any (p_roles)) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
end;
$$;

-- Households ----------------------------------------------------------------

-- Supersedes create_household(text, text) from 0001, whose access is revoked in 0010.
-- Callers always pass all four arguments so the two signatures never clash.
create or replace function public.create_household(
  p_name text,
  p_timezone text,
  p_briefing_time time default '19:00',
  p_cuisines text[] default '{}'
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_household uuid;
  v_name text := trim(p_name);
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED' using errcode = '28000'; end if;
  perform ensure_profile();
  if v_name is null or length(v_name) = 0 or length(v_name) > 120 then raise exception 'INVALID_NAME'; end if;
  if not exists (select 1 from pg_timezone_names where name = p_timezone) then raise exception 'INVALID_TIMEZONE'; end if;
  -- V1.0: one active household per person (multiple households is P1).
  if exists (select 1 from household_members where user_id = auth.uid() and status = 'active') then
    raise exception 'ALREADY_IN_HOUSEHOLD';
  end if;

  insert into households (name, owner_id, timezone, briefing_local_time)
  values (v_name, auth.uid(), p_timezone, p_briefing_time)
  returning id into v_household;
  insert into household_members (household_id, user_id, role) values (v_household, auth.uid(), 'owner');
  insert into subscriptions (household_id, plan_id, status) values (v_household, 'free', 'free');
  insert into household_cuisine_preferences (household_id, cuisine_id)
    select v_household, id from cuisines where slug = any (coalesce(p_cuisines, '{}'));
  return v_household;
end;
$$;

create or replace function public.set_household_cuisines(p_household uuid, p_cuisines text[])
returns void language plpgsql security definer set search_path = public as $$
begin
  perform require_role(p_household, array['owner', 'admin']::household_role[]);
  delete from household_cuisine_preferences where household_id = p_household;
  insert into household_cuisine_preferences (household_id, cuisine_id)
    select p_household, id from cuisines where slug = any (coalesce(p_cuisines, '{}'));
end;
$$;

