
-- 1. Add class_id and specialization_id to characters
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.system_classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS specialization_id uuid REFERENCES public.system_specializations(id) ON DELETE SET NULL;

-- 2. Create character_abilities table
CREATE TABLE IF NOT EXISTS public.character_abilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  ability_id uuid REFERENCES public.system_abilities(id) ON DELETE SET NULL,
  homebrew_id uuid REFERENCES public.homebrews(id) ON DELETE SET NULL,
  custom_name text,
  custom_description text,
  level_acquired integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.character_abilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own character abilities"
ON public.character_abilities FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.characters c
  WHERE c.id = character_abilities.character_id
  AND (c.user_id = auth.uid() OR public.is_campaign_gm(c.campaign_id))
));

CREATE POLICY "Campaign members can view character abilities"
ON public.character_abilities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.characters c
  WHERE c.id = character_abilities.character_id
  AND public.is_campaign_member(c.campaign_id)
));

-- 3. Create character_custom_rolls table
CREATE TABLE IF NOT EXISTS public.character_custom_rolls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name text NOT NULL,
  formula text NOT NULL,
  roll_type text NOT NULL DEFAULT 'test',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.character_custom_rolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom rolls"
ON public.character_custom_rolls FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.characters c
  WHERE c.id = character_custom_rolls.character_id
  AND c.user_id = auth.uid()
));

CREATE POLICY "Campaign members can view custom rolls"
ON public.character_custom_rolls FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.characters c
  WHERE c.id = character_custom_rolls.character_id
  AND public.is_campaign_member(c.campaign_id)
));
