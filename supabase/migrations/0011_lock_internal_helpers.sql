-- Internal helpers are only called from inside other SECURITY DEFINER
-- functions. Supabase grants EXECUTE to `authenticated` directly on new
-- functions, so revoking from PUBLIC (0010) was not enough: without this,
-- a signed-in user could call e.g. active_adult_count() on any household.
revoke execute on function public.active_adult_count(uuid) from authenticated;
revoke execute on function public.household_adult_limit(uuid) from authenticated;
revoke execute on function public.current_user_email() from authenticated;
revoke execute on function public.require_role(uuid, household_role[]) from authenticated;
