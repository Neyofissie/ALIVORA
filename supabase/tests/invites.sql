-- Invitations and membership rules (PRD §6.2). Run after auth_stub.sql and all migrations.
\set ON_ERROR_STOP on
\set QUIET on

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-0000-0000-00000000000a', 'owner@example.com', '{"display_name": "Olivia"}'),
  ('10000000-0000-0000-0000-00000000000b', 'partner@example.com', '{"display_name": "Pat"}'),
  ('10000000-0000-0000-0000-00000000000c', 'third@example.com', '{}'),
  ('10000000-0000-0000-0000-00000000000d', 'stranger@example.com', '{}');

-- Small assertion helper: run SQL as a user and expect a specific error code in the message.
create or replace function pg_temp.expect_error(p_user uuid, p_sql text, p_code text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_user::text, true);
  begin
    execute p_sql;
  exception when others then
    if sqlerrm like '%' || p_code || '%' then return; end if;
    raise exception 'FAIL: expected %, got % (%)', p_code, sqlerrm, p_sql;
  end;
  raise exception 'FAIL: expected % but statement succeeded (%)', p_code, p_sql;
end $$;
grant execute on function pg_temp.expect_error(uuid, text, text) to authenticated;

-- Profiles are created on first use, from sign-up metadata or the email prefix.
set role authenticated;
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000c';
select ensure_profile() \g /dev/null
select ensure_profile('Ignored on second call') \g /dev/null
reset role;
do $$ begin
  if (select display_name from profiles where id = '10000000-0000-0000-0000-00000000000c') <> 'third' then
    raise exception 'FAIL: profile name should fall back to email prefix'; end if;
end $$;

set role authenticated;
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
select create_household('The Olsens', 'Europe/London', '19:00', array['nigerian', 'scottish']) as hh \gset
select set_config('test.hh', :'hh', false) \g /dev/null

do $$ begin
  if (select count(*) from household_cuisine_preferences) <> 2 then raise exception 'FAIL: cuisines not saved'; end if;
  if (select plan_id from subscriptions) <> 'free' then raise exception 'FAIL: free subscription not created'; end if;
end $$;
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', $q$select create_household('Second', 'Europe/London', '19:00', '{}')$q$, 'ALREADY_IN_HOUSEHOLD');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000d', $q$select create_household('Bad tz', 'Mars/Olympus', '19:00', '{}')$q$, 'INVALID_TIMEZONE');

-- Owner invites the partner; the raw token is returned once and only its hash is stored.
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
select token as tok from create_invitation(:'hh', ' Partner@Example.com ') \gset
select set_config('test.tok', :'tok', false) \g /dev/null
do $$ begin
  if length(current_setting('test.tok')) <> 64 then raise exception 'FAIL: token should be 32 random bytes hex'; end if;
  if exists (select 1 from household_invites where token_hash = current_setting('test.tok')) then
    raise exception 'FAIL: raw token stored'; end if;
  if (select email from household_invites) <> 'partner@example.com' then raise exception 'FAIL: email not normalised'; end if;
end $$;

-- Duplicate invite and plan limit (free plan: 2 adults = owner + 1 pending).
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$select create_invitation(%L, 'partner@example.com')$q$, current_setting('test.hh')), 'ALREADY_INVITED');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$select create_invitation(%L, 'third@example.com')$q$, current_setting('test.hh')), 'HOUSEHOLD_FULL');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$select create_invitation(%L, 'owner@example.com')$q$, current_setting('test.hh')), 'ALREADY_MEMBER');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$select create_invitation(%L, 'x@example.com', 'owner')$q$, current_setting('test.hh')), 'INVALID_ROLE');
-- Outsiders cannot invite, and cannot write invites directly.
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000d', format($q$select create_invitation(%L, 'y@example.com')$q$, current_setting('test.hh')), 'FORBIDDEN');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$insert into household_invites (household_id, email, token_hash, invited_by) values (%L, 'z@example.com', 'x', auth.uid())$q$, current_setting('test.hh')), 'permission denied');

-- Preview is available to the token holder, even signed out.
reset role; set role anon;
do $$ begin
  if (select household_name || '/' || invited_by_name || '/' || status from get_invitation(current_setting('test.tok'))) <> 'The Olsens/Olivia/pending' then
    raise exception 'FAIL: invitation preview'; end if;
end $$;
reset role; set role authenticated;

-- Wrong account cannot accept; the invited account can, exactly once.
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000d', format($q$select accept_invitation(%L)$q$, current_setting('test.tok')), 'INVITE_EMAIL_MISMATCH');
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000b';
select accept_invitation(:'tok') \g /dev/null
do $$ begin
  if household_role_of(current_setting('test.hh')::uuid) <> 'member' then raise exception 'FAIL: partner not a member'; end if;
end $$;
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000b', format($q$select accept_invitation(%L)$q$, current_setting('test.tok')), 'INVITE_USED');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000b', $q$select accept_invitation('not-a-token')$q$, 'INVITE_NOT_FOUND');

-- Members cannot remove others or invite; nobody can remove the owner.
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000b', format($q$select remove_member(%L, '10000000-0000-0000-0000-00000000000a')$q$, current_setting('test.hh')), 'FORBIDDEN');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000b', format($q$select create_invitation(%L, 'q@example.com')$q$, current_setting('test.hh')), 'FORBIDDEN');
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000a', format($q$select remove_member(%L, '10000000-0000-0000-0000-00000000000a')$q$, current_setting('test.hh')), 'CANNOT_REMOVE_OWNER');
-- Members cannot change their own role.
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000b';
update household_members set role = 'owner' where user_id = auth.uid();
do $$ begin
  if household_role_of(current_setting('test.hh')::uuid) <> 'member' then raise exception 'FAIL: member escalated own role'; end if;
end $$;

-- Owner removes the partner: access ends immediately.
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
select remove_member(:'hh', '10000000-0000-0000-0000-00000000000b') \g /dev/null
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000b';
do $$ begin
  if exists (select 1 from households) then raise exception 'FAIL: removed member still sees household'; end if;
end $$;

-- Expired and revoked invites cannot be used.
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
select token as tok2 from create_invitation(:'hh', 'third@example.com') \gset
reset role;
update household_invites set expires_at = now() - interval '1 minute' where email = 'third@example.com';
set role authenticated;
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000c', format($q$select accept_invitation(%L)$q$, :'tok2'), 'INVITE_EXPIRED');
-- An expired invite can be replaced by a fresh one, which can then be revoked.
set request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
select id as inv3, token as tok3 from create_invitation(:'hh', 'third@example.com') \gset
select revoke_invitation(:'inv3') \g /dev/null
select pg_temp.expect_error('10000000-0000-0000-0000-00000000000c', format($q$select accept_invitation(%L)$q$, :'tok3'), 'INVITE_REVOKED');

reset role;
select 'Invite tests passed' as result;
