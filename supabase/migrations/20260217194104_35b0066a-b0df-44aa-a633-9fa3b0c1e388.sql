
-- ================================================
-- 1) Rename domain_definitions → path_definitions
-- ================================================

-- Create path_definitions table
CREATE TABLE IF NOT EXISTS public.path_definitions (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📚',
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.path_definitions ENABLE ROW LEVEL SECURITY;

-- Anyone can read paths
CREATE POLICY "Anyone can read paths"
ON public.path_definitions
FOR SELECT
USING (true);

-- Seed the Seven Paths with updated descriptions and icons
INSERT INTO path_definitions (id, name, description, icon, sort_order)
VALUES
  ('curiosity', 'Path of Curiosity', 'Explore, ask questions, and keep learning with wonder.', '🔎', 1),
  ('craft', 'Path of Craft', 'Build skills through practice, creating, and mastery.', '🛠️', 2),
  ('contribution', 'Path of Contribution', 'Strengthen the guild by helping, stewarding, and taking responsibility.', '🤝', 3),
  ('connection', 'Path of Connection', 'Grow closeness through presence, kindness, and celebration.', '🫶', 4),
  ('care', 'Path of Care', 'Support body and nervous system wellbeing with steady self-care.', '🌿', 5),
  ('wealth', 'Path of Wealth', 'Build stability through smart stewardship of money and resources.', '💰', 6),
  ('adventure', 'Path of Adventure', 'Turn life into stories through experiences, play, and exploration.', '🗺️', 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Add path_id column to skill_definitions
ALTER TABLE public.skill_definitions
ADD COLUMN IF NOT EXISTS path_id text;

-- Migrate existing domain_id data to path_id
UPDATE public.skill_definitions
SET path_id = domain_id
WHERE path_id IS NULL AND domain_id IS NOT NULL;

-- Add FK constraint
ALTER TABLE public.skill_definitions
ADD CONSTRAINT skill_definitions_path_id_fkey
FOREIGN KEY (path_id) REFERENCES path_definitions(id);

-- ================================================
-- 2) Add email column to family_invites for email invites
-- ================================================
ALTER TABLE public.family_invites
ADD COLUMN IF NOT EXISTS email text;
