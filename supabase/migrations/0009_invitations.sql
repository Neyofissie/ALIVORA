-- Alivora V1.0 — accounts, households and invitations (PRD §6.1, §6.2), part 2 of 3.
-- Privileged operations run as checked SECURITY DEFINER functions, so the
-- app never needs a service-role key. Errors use stable codes in the message
-- (e.g. INVITE_EXPIRED) that the client maps to friendly copy.

-- Invitations ---------------------------------------------------------------

create unique index if not exists household_invites_pending_unique
  on public.household_invites (household_id, lower(email))
  where accepted_at is null and revoked_at is null;

create or replace function public.create_invitation(p_household uuid, p_email text, p_role household_role default 'member')
returns table (id uuid, token text) language plpgsql security definer set search_path = public, extensions as $$
declare
  v_email text := lower(trim(p_email));
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_pending int;
begin
  perform require_role(p_household, array['owner', 'admin']::household_role[]);
  if p_role = 'owner' then raise exception 'INVALID_ROLE'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'INVALID_EMAIL'; end if;
  if exists (
    select 1 from household_members m join auth.users u on u.id = m.user_id
    where m.household_id = p_household and m.status = 'active' and lower(u.email) = v_email
  ) then raise exception 'ALREADY_MEMBER'; end if;

  -- Expired invites no longer hold a place; clear them so the email can be re-invited.
  update household_invites set revoked_at = now()
   where household_id = p_household and lower(email) = v_email
     and accepted_at is null and revoked_at is null and expires_at <= now();
  if exists (
    select 1 from household_invites
    where household_id = p_household and lower(email) = v_email and accepted_at is null and revoked_at is null
  ) then raise exception 'ALREADY_INVITED'; end if;

  select count(*) into v_pending from household_invites
   where household_id = p_household and accepted_at is null and revoked_at is null and expires_at > now();
  if active_adult_count(p_household) + v_pending >= household_adult_limit(p_household) then
    raise exception 'HOUSEHOLD_FULL';
  end if;

  return query
    insert into household_invites (household_id, email, role, token_hash, invited_by)
    values (p_household, v_email, p_role, encode(digest(v_token, 'sha256'), 'hex'), auth.uid())
    returning household_invites.id, v_token;
end;
$$;

-- What the invite page shows before someone joins. Only the token holder can call it usefully.
create or replace function public.get_invitation(p_token text)
returns table (household_name text, invited_by_name text, email text, status text)
language sql stable security definer set search_path = public, extensions as $$
  select h.name, p.display_name, i.email,
    case
      when i.revoked_at is not null then 'revoked'
      when i.accepted_at is not null then 'accepted'
      when i.expires_at <= now() then 'expired'
      else 'pending'
    end
  from household_invites i
  join households h on h.id = i.household_id
  join profiles p on p.id = i.invited_by
  where i.token_hash = encode(digest(p_token, 'sha256'), 'hex');
$$;

create or replace function public.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare
  v_invite household_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED' using errcode = '28000'; end if;
  perform ensure_profile();
  select * into v_invite from household_invites
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
   for update;
  if not found then raise exception 'INVITE_NOT_FOUND'; end if;
  if v_invite.revoked_at is not null then raise exception 'INVITE_REVOKED'; end if;
  if v_invite.accepted_at is not null then raise exception 'INVITE_USED'; end if;
  if v_invite.expires_at <= now() then raise exception 'INVITE_EXPIRED'; end if;
  if lower(v_invite.email) <> current_user_email() then raise exception 'INVITE_EMAIL_MISMATCH'; end if;
  if exists (select 1 from household_members where user_id = auth.uid() and status = 'active') then
    raise exception 'ALREADY_IN_HOUSEHOLD';
  end if;
  if active_adult_count(v_invite.household_id) >= household_adult_limit(v_invite.household_id) then
    raise exception 'HOUSEHOLD_FULL';
  end if;

  insert into household_members (household_id, user_id, role)
  values (v_invite.household_id, auth.uid(), v_invite.role);
  update household_invites set accepted_at = now() where id = v_invite.id;
  return v_invite.household_id;
end;
$$;

create or replace function public.revoke_invitation(p_invite uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_household uuid;
begin
  select household_id into v_household from household_invites where id = p_invite;
  if v_household is null then raise exception 'INVITE_NOT_FOUND'; end if;
  perform require_role(v_household, array['owner', 'admin']::household_role[]);
  update household_invites set revoked_at = now() where id = p_invite and accepted_at is null and revoked_at is null;
end;
$$;

