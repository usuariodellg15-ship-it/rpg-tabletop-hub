-- Fix the security definer view warning by recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_campaigns;

-- Recreate view with SECURITY INVOKER (default, explicit for clarity)
CREATE VIEW public.public_campaigns 
WITH (security_invoker = true)
AS
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

-- Add server-side input validation triggers for campaigns and homebrews

-- Create validation function for campaigns
CREATE OR REPLACE FUNCTION public.validate_campaign_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length
  IF length(NEW.name) < 1 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Campaign name must be between 1 and 100 characters';
  END IF;
  
  -- Validate description length if provided
  IF NEW.description IS NOT NULL AND length(NEW.description) > 2000 THEN
    RAISE EXCEPTION 'Campaign description must be 2000 characters or less';
  END IF;
  
  -- Validate invite_code format if provided
  IF NEW.invite_code IS NOT NULL AND NOT NEW.invite_code ~ '^[A-Z0-9]{4,10}$' THEN
    RAISE EXCEPTION 'Invalid invite code format';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for campaign validation
DROP TRIGGER IF EXISTS validate_campaign_trigger ON public.campaigns;
CREATE TRIGGER validate_campaign_trigger
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_campaign_input();

-- Create validation function for homebrews
CREATE OR REPLACE FUNCTION public.validate_homebrew_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name length
  IF length(NEW.name) < 1 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Homebrew name must be between 1 and 100 characters';
  END IF;
  
  -- Validate description length if provided
  IF NEW.description IS NOT NULL AND length(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Homebrew description must be 5000 characters or less';
  END IF;
  
  -- Validate rarity if provided
  IF NEW.rarity IS NOT NULL AND NEW.rarity NOT IN ('comum', 'incomum', 'raro', 'muito_raro', 'lendario', 'artefato') THEN
    RAISE EXCEPTION 'Invalid rarity value';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for homebrew validation
DROP TRIGGER IF EXISTS validate_homebrew_trigger ON public.homebrews;
CREATE TRIGGER validate_homebrew_trigger
  BEFORE INSERT OR UPDATE ON public.homebrews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_homebrew_input();

-- Create admin role check function for server-side authorization
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;