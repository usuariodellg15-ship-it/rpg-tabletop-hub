-- Ensure join code is unique (case-insensitive by storing uppercase in app + validation)
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_invite_code_unique
  ON public.campaigns (invite_code)
  WHERE invite_code IS NOT NULL;

-- Ensure one membership row per (campaign, user)
CREATE UNIQUE INDEX IF NOT EXISTS campaign_memberships_campaign_user_unique
  ON public.campaign_memberships (campaign_id, user_id);

-- Automatically ensure the GM is also an approved member (role=gm)
CREATE OR REPLACE FUNCTION public.ensure_campaign_gm_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.campaign_memberships (
    campaign_id,
    user_id,
    status,
    role,
    requested_at,
    responded_at
  )
  VALUES (
    NEW.id,
    NEW.gm_id,
    'approved',
    'gm',
    now(),
    now()
  )
  ON CONFLICT (campaign_id, user_id)
  DO UPDATE SET
    status = 'approved',
    role = 'gm',
    responded_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_campaign_gm_membership ON public.campaigns;
CREATE TRIGGER trg_ensure_campaign_gm_membership
AFTER INSERT ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.ensure_campaign_gm_membership();
