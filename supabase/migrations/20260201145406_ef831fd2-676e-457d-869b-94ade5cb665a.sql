-- Create enum types
CREATE TYPE public.membership_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.user_role AS ENUM ('gm', 'player', 'admin');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'premium');
CREATE TYPE public.system_type AS ENUM ('5e', 'olho_da_morte', 'horror');
CREATE TYPE public.homebrew_type AS ENUM ('item', 'creature', 'spell', 'class', 'race');
CREATE TYPE public.mission_status AS ENUM ('active', 'completed');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (for permissions)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  system system_type NOT NULL DEFAULT '5e',
  gm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE,
  max_players INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaign memberships (join requests and approvals)
CREATE TABLE public.campaign_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status membership_status NOT NULL DEFAULT 'pending',
  role user_role NOT NULL DEFAULT 'player',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (campaign_id, user_id)
);

-- Characters table
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  class TEXT,
  level INTEGER DEFAULT 1,
  hp_current INTEGER DEFAULT 10,
  hp_max INTEGER DEFAULT 10,
  ac INTEGER DEFAULT 10,
  attributes JSONB DEFAULT '{"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}',
  skills JSONB DEFAULT '{}',
  notes TEXT,
  weight_current NUMERIC DEFAULT 0,
  weight_max NUMERIC DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dice rolls log
CREATE TABLE public.dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  formula TEXT NOT NULL,
  result INTEGER NOT NULL,
  details TEXT,
  roll_type TEXT DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Combat stat events (for GM dashboard analytics)
CREATE TABLE public.combat_stat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('DAMAGE_DEALT', 'DAMAGE_TAKEN', 'HEALING_DONE')),
  amount INTEGER NOT NULL,
  related_roll_id UUID REFERENCES public.dice_rolls(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Combat encounters
CREATE TABLE public.combat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  round_number INTEGER DEFAULT 1,
  current_turn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Encounter entries (initiative order)
CREATE TABLE public.encounter_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES public.combat_encounters(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  creature_id TEXT,
  custom_name TEXT,
  initiative INTEGER NOT NULL DEFAULT 0,
  hp_current INTEGER,
  hp_max INTEGER,
  is_player BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Homebrews
CREATE TABLE public.homebrews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type homebrew_type NOT NULL DEFAULT 'item',
  system system_type NOT NULL DEFAULT '5e',
  rarity TEXT,
  data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaign homebrews (enabled per campaign)
CREATE TABLE public.campaign_homebrews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  homebrew_id UUID REFERENCES public.homebrews(id) ON DELETE CASCADE NOT NULL,
  enabled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, homebrew_id)
);

-- Character inventory
CREATE TABLE public.character_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT,
  homebrew_id UUID REFERENCES public.homebrews(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  weight NUMERIC DEFAULT 0,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Missions (GM)
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives JSONB DEFAULT '[]',
  rewards TEXT,
  status mission_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- GM notes
CREATE TABLE public.gm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timeline events
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  event_type TEXT DEFAULT 'event',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dice_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_stat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homebrews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_homebrews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Security definer functions for role checks
CREATE OR REPLACE FUNCTION public.is_campaign_gm(campaign_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_uuid AND gm_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_member(campaign_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_memberships
    WHERE campaign_id = campaign_uuid 
    AND user_id = auth.uid() 
    AND status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = campaign_uuid AND gm_id = auth.uid()
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "GMs can create campaigns" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (gm_id = auth.uid());
CREATE POLICY "GMs can update own campaigns" ON public.campaigns FOR UPDATE TO authenticated USING (gm_id = auth.uid());
CREATE POLICY "GMs can delete own campaigns" ON public.campaigns FOR DELETE TO authenticated USING (gm_id = auth.uid());

-- Memberships policies
CREATE POLICY "Members can view campaign memberships" ON public.campaign_memberships FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR public.is_campaign_gm(campaign_id));
CREATE POLICY "Users can request to join" ON public.campaign_memberships FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "GMs can manage memberships" ON public.campaign_memberships FOR UPDATE TO authenticated 
  USING (public.is_campaign_gm(campaign_id));
CREATE POLICY "GMs can remove members" ON public.campaign_memberships FOR DELETE TO authenticated 
  USING (public.is_campaign_gm(campaign_id) OR user_id = auth.uid());

-- Characters policies
CREATE POLICY "Campaign members can view characters" ON public.characters FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "Users can create own characters" ON public.characters FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND public.is_campaign_member(campaign_id));
CREATE POLICY "Users can update own characters or GMs can update any" ON public.characters FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() OR public.is_campaign_gm(campaign_id));
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE TO authenticated 
  USING (user_id = auth.uid() OR public.is_campaign_gm(campaign_id));

-- Dice rolls policies
CREATE POLICY "Campaign members can view rolls" ON public.dice_rolls FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "Campaign members can create rolls" ON public.dice_rolls FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND public.is_campaign_member(campaign_id));

-- Combat stat events policies
CREATE POLICY "Campaign members can view stats" ON public.combat_stat_events FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "GMs can manage combat stats" ON public.combat_stat_events FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- Combat encounters policies
CREATE POLICY "Campaign members can view encounters" ON public.combat_encounters FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "GMs can manage encounters" ON public.combat_encounters FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- Encounter entries policies
CREATE POLICY "Members can view encounter entries" ON public.encounter_entries FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.combat_encounters e WHERE e.id = encounter_id AND public.is_campaign_member(e.campaign_id)));
CREATE POLICY "GMs can manage encounter entries" ON public.encounter_entries FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.combat_encounters e WHERE e.id = encounter_id AND public.is_campaign_gm(e.campaign_id)));

-- Homebrews policies
CREATE POLICY "Anyone can view public homebrews" ON public.homebrews FOR SELECT TO authenticated 
  USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Users can create homebrews" ON public.homebrews FOR INSERT TO authenticated 
  WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own homebrews" ON public.homebrews FOR UPDATE TO authenticated 
  USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete own homebrews" ON public.homebrews FOR DELETE TO authenticated 
  USING (creator_id = auth.uid());

-- Campaign homebrews policies
CREATE POLICY "Campaign members can view enabled homebrews" ON public.campaign_homebrews FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "GMs can manage campaign homebrews" ON public.campaign_homebrews FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- Inventory policies
CREATE POLICY "Users can view own inventory" ON public.character_inventory FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.characters c WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_campaign_gm(c.campaign_id))));
CREATE POLICY "Users can manage own inventory" ON public.character_inventory FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.characters c WHERE c.id = character_id AND c.user_id = auth.uid()));

-- Missions policies
CREATE POLICY "Campaign members can view missions" ON public.missions FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "GMs can manage missions" ON public.missions FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- GM notes policies
CREATE POLICY "GMs can manage own notes" ON public.gm_notes FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- Timeline policies
CREATE POLICY "Campaign members can view timeline" ON public.timeline_events FOR SELECT TO authenticated 
  USING (public.is_campaign_member(campaign_id));
CREATE POLICY "GMs can manage timeline" ON public.timeline_events FOR ALL TO authenticated 
  USING (public.is_campaign_gm(campaign_id));

-- Create profile automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Give default player role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homebrews_updated_at BEFORE UPDATE ON public.homebrews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gm_notes_updated_at BEFORE UPDATE ON public.gm_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_combat_encounters_updated_at BEFORE UPDATE ON public.combat_encounters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for dice rolls
ALTER PUBLICATION supabase_realtime ADD TABLE public.dice_rolls;