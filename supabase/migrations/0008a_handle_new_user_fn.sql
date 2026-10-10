-- Applied live while diagnosing a migration timeout. Superseded by
-- ensure_profile() in 0008 and never attached to a trigger; access is
-- revoked in 0010. Kept so local and live schemas match.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Member'), 100)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
