
-- ===========================================
-- FIX 1: Drop unused public_campaigns view
-- ===========================================
DROP VIEW IF EXISTS public.public_campaigns;

-- ===========================================
-- FIX 2: Protect email addresses in profiles
-- ===========================================

-- Create safe_profiles view that excludes email
-- Uses definer semantics (no security_invoker) so it can bypass base table RLS
-- Row-level filtering is enforced via WHERE clause
CREATE VIEW public.safe_profiles AS
SELECT id, user_id, name, avatar_url, subscription_plan, created_at, updated_at
FROM public.profiles
WHERE user_id = auth.uid() OR public.is_same_campaign_member(user_id);

-- Only authenticated users can access safe_profiles
REVOKE ALL ON public.safe_profiles FROM anon;
REVOKE ALL ON public.safe_profiles FROM public;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Lock down base profiles table: only own profile
DROP POLICY IF EXISTS "Users can view profiles of campaign members" ON public.profiles;
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());
