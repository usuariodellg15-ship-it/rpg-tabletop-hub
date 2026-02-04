-- System Classes table (native classes per game system)
CREATE TABLE public.system_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system public.system_type NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(system, name)
);

-- System Specializations table (subclasses linked to classes)
CREATE TABLE public.system_specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.system_classes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, name)
);

-- System Abilities table (abilities for classes and specializations)
CREATE TABLE public.system_abilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.system_classes(id) ON DELETE CASCADE,
  specialization_id uuid REFERENCES public.system_specializations(id) ON DELETE CASCADE,
  name text NOT NULL,
  level_required integer NOT NULL DEFAULT 1,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Ability must belong to either a class or a specialization (not both, not neither)
  CONSTRAINT ability_belongs_to_one CHECK (
    (class_id IS NOT NULL AND specialization_id IS NULL) OR
    (class_id IS NULL AND specialization_id IS NOT NULL)
  )
);

-- Campaign Allowed Items table (GM controls which items players can add)
CREATE TABLE public.campaign_allowed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('system', 'homebrew')),
  item_id text NOT NULL, -- Can be system item ID or homebrew UUID
  enabled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, item_type, item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.system_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_allowed_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system content (read-only for authenticated users)
CREATE POLICY "Anyone authenticated can view system classes"
ON public.system_classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can view system specializations"
ON public.system_specializations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone authenticated can view system abilities"
ON public.system_abilities FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for campaign_allowed_items
CREATE POLICY "Campaign members can view allowed items"
ON public.campaign_allowed_items FOR SELECT
USING (is_campaign_member(campaign_id));

CREATE POLICY "GMs can manage allowed items"
ON public.campaign_allowed_items FOR ALL
USING (is_campaign_gm(campaign_id));

-- Indexes for performance
CREATE INDEX idx_system_classes_system ON public.system_classes(system);
CREATE INDEX idx_system_specializations_class ON public.system_specializations(class_id);
CREATE INDEX idx_system_abilities_class ON public.system_abilities(class_id);
CREATE INDEX idx_system_abilities_spec ON public.system_abilities(specialization_id);
CREATE INDEX idx_system_abilities_level ON public.system_abilities(level_required);
CREATE INDEX idx_campaign_allowed_items_campaign ON public.campaign_allowed_items(campaign_id);