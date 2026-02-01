-- Fix RLS policies for profiles and campaigns tables

-- 1. Drop the overly permissive profiles SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2. Create a helper function to check if user is in same campaign
CREATE OR REPLACE FUNCTION public.is_same_campaign_member(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if the current user and target user share any approved campaign membership
    SELECT 1 
    FROM public.campaign_memberships m1
    JOIN public.campaign_memberships m2 ON m1.campaign_id = m2.campaign_id
    WHERE m1.user_id = auth.uid() 
      AND m2.user_id = target_user_id
      AND m1.status = 'approved'
      AND m2.status = 'approved'
  ) OR EXISTS (
    -- Check if current user is GM of a campaign the target user is in
    SELECT 1
    FROM public.campaigns c
    JOIN public.campaign_memberships m ON c.id = m.campaign_id
    WHERE c.gm_id = auth.uid()
      AND m.user_id = target_user_id
      AND m.status = 'approved'
  ) OR EXISTS (
    -- Check if target user is GM of a campaign the current user is in
    SELECT 1
    FROM public.campaigns c
    JOIN public.campaign_memberships m ON c.id = m.campaign_id
    WHERE c.gm_id = target_user_id
      AND m.user_id = auth.uid()
      AND m.status = 'approved'
  )
$$;

-- 3. Create new restrictive profiles SELECT policy
CREATE POLICY "Users can view profiles of campaign members"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid() OR  -- Can always view own profile
  is_same_campaign_member(user_id)  -- Can view profiles of users in same campaigns
);

-- 4. Drop the overly permissive campaigns SELECT policy
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.campaigns;

-- 5. Create helper function to check if user has any campaign relationship
CREATE OR REPLACE FUNCTION public.has_campaign_access(campaign_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_uuid AND gm_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.campaign_memberships
    WHERE campaign_id = campaign_uuid 
      AND user_id = auth.uid()
  )
$$;

-- 6. Create new campaigns SELECT policy - only GM/members can see full details
CREATE POLICY "Campaign members and pending can view campaign"
ON public.campaigns
FOR SELECT
USING (
  gm_id = auth.uid() OR  -- GM can always see their campaigns
  has_campaign_access(id)  -- Members (approved or pending) can see
);

-- 7. Create a public campaign search view (without sensitive data like invite_code)
CREATE OR REPLACE VIEW public.public_campaigns AS
SELECT 
  id,
  name,
  description,
  system,
  max_players,
  is_active,
  created_at
FROM public.campaigns
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.public_campaigns TO anon, authenticated;