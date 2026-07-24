
-- Fix search_path on existing functions
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM memberships WHERE family_id = p_family_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_family_parent(p_family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM memberships WHERE family_id = p_family_id AND user_id = auth.uid() AND role = 'parent');
$$;

CREATE OR REPLACE FUNCTION public.complete_quest(p_instance_id uuid, p_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template quest_templates%ROWTYPE;
  v_instance quest_instances%ROWTYPE;
BEGIN
  IF NOT is_family_member(p_family_id) THEN RAISE EXCEPTION 'Not a family member'; END IF;
  SELECT * INTO v_instance FROM quest_instances WHERE id = p_instance_id AND family_id = p_family_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quest instance not found'; END IF;
  IF v_instance.status != 'available' THEN RAISE EXCEPTION 'Quest not available'; END IF;
  SELECT * INTO v_template FROM quest_templates WHERE id = v_instance.template_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quest template not found'; END IF;
  UPDATE quest_instances SET status = 'done', completed_at = now() WHERE id = p_instance_id;
  IF v_template.assigned_to_character_id IS NOT NULL THEN
    INSERT INTO xp_events (family_id, character_id, character_skill_id, xp, gold, source, note)
    VALUES (p_family_id, v_template.assigned_to_character_id, v_template.character_skill_id, v_template.xp_reward, v_template.gold_reward, 'quest', 'Completed: ' || v_template.name);
    UPDATE characters SET gold = gold + v_template.gold_reward WHERE id = v_template.assigned_to_character_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_daily_quests(p_family_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_dow integer;
  v_slot integer;
BEGIN
  v_dow := EXTRACT(DOW FROM p_date)::integer;
  FOR v_template IN
    SELECT * FROM quest_templates
    WHERE family_id = p_family_id AND active = true AND type = 'recurring'
      AND (recurrence_type = 'daily' OR (recurrence_type = 'weekly' AND v_dow = ANY(days_of_week)))
  LOOP
    FOR v_slot IN 1..v_template.times_per_day LOOP
      INSERT INTO quest_instances (family_id, template_id, due_date, slot, status)
      VALUES (p_family_id, v_template.id, p_date, v_slot, 'available')
      ON CONFLICT (template_id, due_date, slot) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_family_skills(p_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO family_skill_library (family_id, skill_definition_id, status)
  SELECT p_family_id, id, 'suggested' FROM skill_definitions WHERE is_default = true
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_campaign_step(p_step_id uuid, p_family_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_step campaign_steps%ROWTYPE;
  v_next_step campaign_steps%ROWTYPE;
BEGIN
  IF NOT is_family_member(p_family_id) THEN RAISE EXCEPTION 'Not a family member'; END IF;
  SELECT * INTO v_step FROM campaign_steps WHERE id = p_step_id AND family_id = p_family_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Step not found'; END IF;
  IF v_step.status != 'available' THEN RAISE EXCEPTION 'Step not available'; END IF;
  UPDATE campaign_steps SET status = 'done' WHERE id = p_step_id;
  IF v_step.assigned_to_character_id IS NOT NULL THEN
    INSERT INTO xp_events (family_id, character_id, character_skill_id, xp, gold, source, note)
    VALUES (p_family_id, v_step.assigned_to_character_id, v_step.character_skill_id, v_step.xp_reward, v_step.gold_reward, 'campaign', 'Campaign step: ' || v_step.name);
    UPDATE characters SET gold = gold + v_step.gold_reward WHERE id = v_step.assigned_to_character_id;
  END IF;
  SELECT * INTO v_next_step FROM campaign_steps WHERE campaign_id = v_step.campaign_id AND step_order = v_step.step_order + 1;
  IF FOUND THEN
    UPDATE campaign_steps SET status = 'available' WHERE id = v_next_step.id;
  ELSE
    UPDATE campaigns SET status = 'complete' WHERE id = v_step.campaign_id;
  END IF;
END;
$$;
