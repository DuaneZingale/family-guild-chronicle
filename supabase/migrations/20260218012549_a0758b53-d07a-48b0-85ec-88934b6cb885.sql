
-- Phase 1: Unified quest system

-- 1. Create unified_quests table
CREATE TABLE public.unified_quests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES families(id),
  quest_type text NOT NULL DEFAULT 'side',  -- training, side, guild, campaign_step
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  
  -- Assignment (NULL = guild quest, anyone can complete)
  assigned_to_character_id uuid REFERENCES characters(id),
  character_skill_id uuid REFERENCES character_skills(id),
  
  -- Rewards
  xp_reward integer NOT NULL DEFAULT 10,
  gold_reward integer NOT NULL DEFAULT 0,
  
  -- Frequency (training quests)
  frequency_type text,  -- daily, weekly, monthly (NULL for non-training)
  ritual_block text,    -- morning, afternoon, evening (NULL for non-training)
  days_of_week integer[] NOT NULL DEFAULT '{}',
  times_per_day integer NOT NULL DEFAULT 1,
  interval_days integer,
  
  -- Streak tracking
  streak_count integer NOT NULL DEFAULT 0,
  last_completed_at timestamptz,
  
  -- Metadata
  importance text NOT NULL DEFAULT 'growth',  -- essential, growth, delight
  autonomy text NOT NULL DEFAULT 'prompt_ok', -- self_start, prompt_ok, parent_led
  due_start time,
  due_end time,
  notify_if_incomplete boolean NOT NULL DEFAULT false,
  
  -- Campaign linkage
  campaign_id uuid REFERENCES campaigns(id),
  step_order integer,
  
  -- Status
  active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'available',  -- available, locked, done (for campaign steps)
  
  -- Source tracking
  is_suggested boolean NOT NULL DEFAULT false,
  source_template_id uuid,  -- links back to suggested quest it was activated from
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create quest_logs table for completion history
CREATE TABLE public.quest_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES families(id),
  quest_id uuid NOT NULL REFERENCES unified_quests(id),
  character_id uuid NOT NULL REFERENCES characters(id),
  completed_at timestamptz NOT NULL DEFAULT now(),
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  slot integer NOT NULL DEFAULT 1,
  ritual_block text,  -- morning, afternoon, evening
  xp_earned integer NOT NULL DEFAULT 0,
  gold_earned integer NOT NULL DEFAULT 0,
  streak_at_completion integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT ''
);

-- 3. Enable RLS
ALTER TABLE public.unified_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for unified_quests
CREATE POLICY "Members can view quests"
  ON public.unified_quests FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Parents can create quests"
  ON public.unified_quests FOR INSERT
  WITH CHECK (is_family_parent(family_id));

CREATE POLICY "Parents can update quests"
  ON public.unified_quests FOR UPDATE
  USING (is_family_parent(family_id));

-- 5. RLS policies for quest_logs
CREATE POLICY "Members can view quest logs"
  ON public.quest_logs FOR SELECT
  USING (is_family_member(family_id));

CREATE POLICY "Members can insert quest logs"
  ON public.quest_logs FOR INSERT
  WITH CHECK (is_family_member(family_id));

-- 6. Indexes
CREATE INDEX idx_unified_quests_family ON unified_quests(family_id);
CREATE INDEX idx_unified_quests_type ON unified_quests(family_id, quest_type);
CREATE INDEX idx_unified_quests_ritual ON unified_quests(family_id, ritual_block) WHERE quest_type = 'training';
CREATE INDEX idx_unified_quests_campaign ON unified_quests(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_quest_logs_quest ON quest_logs(quest_id);
CREATE INDEX idx_quest_logs_character_date ON quest_logs(character_id, due_date);

-- 7. Unique constraint for quest_logs to prevent double-completion per slot
CREATE UNIQUE INDEX idx_quest_logs_unique_completion ON quest_logs(quest_id, due_date, slot);

-- 8. Migrate existing quest_templates data
INSERT INTO unified_quests (
  id, family_id, quest_type, name,
  assigned_to_character_id, character_skill_id,
  xp_reward, gold_reward,
  frequency_type, days_of_week, times_per_day, interval_days,
  importance, autonomy, due_start, due_end, notify_if_incomplete,
  active, created_at
)
SELECT
  id, family_id,
  CASE 
    WHEN type = 'recurring' THEN 'training'
    WHEN assigned_to_character_id IS NULL THEN 'guild'
    ELSE 'side'
  END,
  name,
  assigned_to_character_id, character_skill_id,
  xp_reward, gold_reward,
  CASE WHEN type = 'recurring' THEN COALESCE(recurrence_type, 'daily') ELSE NULL END,
  days_of_week, times_per_day, interval_days,
  importance, autonomy, due_start, due_end, notify_if_incomplete,
  active, created_at
FROM quest_templates;

-- 9. Migrate campaign_steps into unified_quests
INSERT INTO unified_quests (
  id, family_id, quest_type, name,
  assigned_to_character_id, character_skill_id,
  xp_reward, gold_reward,
  campaign_id, step_order, status,
  created_at
)
SELECT
  id, family_id, 'campaign_step', name,
  assigned_to_character_id, character_skill_id,
  xp_reward, gold_reward,
  campaign_id, step_order, status,
  now()
FROM campaign_steps;

-- 10. Migrate quest_instances into quest_logs (completed ones only)
INSERT INTO quest_logs (
  family_id, quest_id, character_id, completed_at, due_date, slot,
  xp_earned, gold_earned
)
SELECT
  qi.family_id, qi.template_id, qt.assigned_to_character_id,
  COALESCE(qi.completed_at, now()), qi.due_date, qi.slot,
  qt.xp_reward, qt.gold_reward
FROM quest_instances qi
JOIN quest_templates qt ON qt.id = qi.template_id
WHERE qi.status = 'done' AND qt.assigned_to_character_id IS NOT NULL;
