-- Alivora V1.0 — accounts, households and invitations (PRD §6.1, §6.2), part 3 of 3.
-- Privileged operations run as checked SECURITY DEFINER functions, so the
-- app never needs a service-role key. Errors use stable codes in the message
-- (e.g. INVITE_EXPIRED) that the client maps to friendly copy.

-- Membership ----------------------------------------------------------------

create or replace function public.remove_member(p_household uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_target household_role;
begin
  perform require_role(p_household, array['owner', 'admin']::household_role[]);
  select role into v_target from household_members where household_id = p_household and user_id = p_user and status = 'active';
  if v_target is null then raise exception 'MEMBER_NOT_FOUND'; end if;
  if v_target = 'owner' then raise exception 'CANNOT_REMOVE_OWNER'; end if;
  if v_target = 'admin' and household_role_of(p_household) <> 'owner' then raise exception 'FORBIDDEN' using errcode = '42501'; end if;

  -- Access ends immediately; their responsibilities return to the household.
  update household_members set status = 'inactive' where household_id = p_household and user_id = p_user and status = 'active';
  update tasks set assignee_id = null where household_id = p_household and assignee_id = p_user;
  delete from event_participants where household_id = p_household and member_user_id = p_user;
end;
$$;

create or replace function public.leave_household(p_household uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform require_role(p_household, array['admin', 'member']::household_role[]);
  update household_members set status = 'inactive' where household_id = p_household and user_id = auth.uid() and status = 'active';
  update tasks set assignee_id = null where household_id = p_household and assignee_id = auth.uid();
end;
$$;

-- Invites are written only through the functions above. Owners/admins keep
-- read access through the 0007 policy; direct writes are refused outright.
revoke insert, update, delete on public.household_invites from anon, authenticated;

-- Evaluate auth.uid() once per statement (Supabase performance advisor).
alter policy profiles_self on public.profiles
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Superseded entry points: create_household(text, text) from 0001, and
-- handle_new_user() from 0008a (profiles now come from ensure_profile()).
revoke all on function public.create_household(text, text) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Execute rights: signed-in users only (get_invitation is also open to signed-out visitors).
do $$
declare f text;
begin
  foreach f in array array[
    'create_household(text, text, time, text[])', 'set_household_cuisines(uuid, text[])',
    'create_invitation(uuid, text, household_role)', 'accept_invitation(text)', 'revoke_invitation(uuid)',
    'remove_member(uuid, uuid)', 'leave_household(uuid)', 'get_invitation(text)',
    'current_user_email()', 'household_adult_limit(uuid)', 'active_adult_count(uuid)',
    'require_role(uuid, household_role[])', 'ensure_profile(text)',
    'is_household_member(uuid)', 'household_role_of(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
  end loop;
  foreach f in array array[
    'ensure_profile(text)',
    'create_household(text, text, time, text[])', 'set_household_cuisines(uuid, text[])',
    'create_invitation(uuid, text, household_role)', 'accept_invitation(text)', 'revoke_invitation(uuid)',
    'remove_member(uuid, uuid)', 'leave_household(uuid)', 'get_invitation(text)',
    'is_household_member(uuid)', 'household_role_of(uuid)'
  ] loop
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
grant execute on function public.get_invitation(text) to anon;
