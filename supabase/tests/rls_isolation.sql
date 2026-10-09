-- RLS: users must not read, create, update or delete another household's records (PRD §9.7).
-- Run after auth_stub.sql and all migrations. Raises an exception on failure.
\set ON_ERROR_STOP on

insert into auth.users values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
insert into profiles (id, display_name) values
  ('00000000-0000-0000-0000-00000000000a', 'Alice'), ('00000000-0000-0000-0000-00000000000b', 'Bob');

-- Each user creates a household through the transactional function.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select create_household('Household A', 'Europe/London') as ha \gset
insert into events (household_id, title, starts_at, ends_at, timezone, created_by)
  values (:'ha', 'A secret', now(), now() + interval '1 hour', 'Europe/London', auth.uid());

set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select create_household('Household B', 'Europe/London') as hb \gset

do $$
declare n int;
begin
  -- Bob sees only his own household and none of Alice's events.
  select count(*) into n from households;
  if n <> 1 then raise exception 'FAIL: expected 1 visible household, saw %', n; end if;
  select count(*) into n from events;
  if n <> 0 then raise exception 'FAIL: cross-household event read (%)', n; end if;

  -- Bob cannot update or delete Alice's events (silently affects 0 rows).
  update events set title = 'pwned';
  delete from events;

end $$;

\set QUIET on
select set_config('test.ha', :'ha', false) \g /dev/null
do $$ begin
  insert into events (household_id, title, starts_at, ends_at, timezone, created_by)
    values (current_setting('test.ha')::uuid, 'injected', now(), now(), 'UTC', auth.uid());
  raise exception 'FAIL: cross-household insert allowed';
exception when insufficient_privilege then null; -- expected: RLS violation
end $$;

-- Users cannot grant themselves membership or elevate their role.
do $$ begin
  insert into household_members (household_id, user_id, role)
    values (current_setting('test.ha')::uuid, auth.uid(), 'owner');
  raise exception 'FAIL: self-membership insert allowed';
exception when insufficient_privilege then null;
end $$;

-- End time before start time is rejected by a check constraint.
do $$ begin
  insert into events (household_id, title, starts_at, ends_at, timezone, created_by)
    select id, 'bad', now(), now() - interval '1 hour', 'UTC', auth.uid() from households limit 1;
  raise exception 'FAIL: end before start allowed';
exception when check_violation then null;
end $$;

-- Alice's data is untouched.
reset role;
do $$ begin
  if (select title from events where title like 'A%') <> 'A secret' then raise exception 'FAIL: Alice event modified'; end if;
end $$;

select 'RLS isolation tests passed' as result;
