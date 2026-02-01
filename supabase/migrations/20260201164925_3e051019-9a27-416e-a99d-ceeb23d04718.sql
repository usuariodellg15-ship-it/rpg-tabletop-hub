-- Allow authenticated users to discover campaigns via invite code and browse public campaigns
-- without granting direct SELECT on public.campaigns.

CREATE OR REPLACE FUNCTION public.get_campaign_by_invite_code(_code text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  system public.system_type,
  is_active boolean,
  max_players integer,
  created_at timestamptz,
  gm_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.description,
    c.system,
    c.is_active,
    c.max_players,
    c.created_at,
    c.gm_id
  FROM public.campaigns c
  WHERE auth.uid() IS NOT NULL
    AND c.invite_code = upper(trim(_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_campaign_by_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_campaign_by_invite_code(text) TO authenticated;


CREATE OR REPLACE FUNCTION public.get_public_campaigns()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  system public.system_type,
  is_active boolean,
  max_players integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.description,
    c.system,
    c.is_active,
    c.max_players,
    c.created_at
  FROM public.campaigns c
  WHERE auth.uid() IS NOT NULL
    AND c.is_active = true
  ORDER BY c.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_public_campaigns() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_campaigns() TO authenticated;
