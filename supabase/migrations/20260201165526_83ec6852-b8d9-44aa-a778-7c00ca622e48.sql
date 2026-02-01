
-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.public_campaigns;

CREATE VIEW public.public_campaigns 
WITH (security_invoker = true)
AS
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
