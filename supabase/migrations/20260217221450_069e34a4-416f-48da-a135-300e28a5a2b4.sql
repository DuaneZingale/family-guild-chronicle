
-- Create journeys table
CREATE TABLE public.journeys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  path_id text REFERENCES public.path_definitions(id),
  owner_character_id uuid REFERENCES public.characters(id),
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create journey_items table (links quests/campaigns to a journey)
CREATE TABLE public.journey_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  item_type text NOT NULL, -- 'quest' or 'campaign'
  item_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_items ENABLE ROW LEVEL SECURITY;

-- Journeys RLS policies
CREATE POLICY "Members can view journeys"
  ON public.journeys FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Parents can create journeys"
  ON public.journeys FOR INSERT
  WITH CHECK (is_family_parent(family_id));

CREATE POLICY "Parents can update journeys"
  ON public.journeys FOR UPDATE
  USING (is_family_parent(family_id));

-- Journey items RLS — use the journey's family_id
CREATE POLICY "Members can view journey items"
  ON public.journey_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_items.journey_id
      AND is_family_member(j.family_id)
  ));

CREATE POLICY "Parents can create journey items"
  ON public.journey_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_items.journey_id
      AND is_family_parent(j.family_id)
  ));

CREATE POLICY "Parents can delete journey items"
  ON public.journey_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_items.journey_id
      AND is_family_parent(j.family_id)
  ));

-- Index for performance
CREATE INDEX idx_journey_items_journey_id ON public.journey_items(journey_id);
CREATE INDEX idx_journeys_family_id ON public.journeys(family_id);
