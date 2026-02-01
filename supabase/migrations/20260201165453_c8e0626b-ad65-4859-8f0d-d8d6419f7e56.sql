
-- Fix profiles table: Change SELECT policy to require authentication
-- Drop the existing policy and recreate with proper role restriction

DROP POLICY IF EXISTS "Users can view profiles of campaign members" ON public.profiles;

CREATE POLICY "Users can view profiles of campaign members" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING ((user_id = auth.uid()) OR is_same_campaign_member(user_id));

-- For public_campaigns view: Add RLS-like protection
-- Since it's a view, we can drop and recreate with auth check built in
DROP VIEW IF EXISTS public.public_campaigns;

CREATE VIEW public.public_campaigns AS
SELECT
  c.id,
  c.name,
  c.description,
  c.system,
  c.is_active,
  c.max_players,
  c.created_at
FROM public.campaigns c
WHERE c.is_active = true;

-- Revoke public access and grant only to authenticated users
REVOKE ALL ON public.public_campaigns FROM anon;
REVOKE ALL ON public.public_campaigns FROM public;
GRANT SELECT ON public.public_campaigns TO authenticated;
