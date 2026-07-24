-- Add email column to memberships for display and admin actions
ALTER TABLE public.memberships ADD COLUMN email text;

-- Update create_family_with_setup to accept and store email
CREATE OR REPLACE FUNCTION public.create_family_with_setup(
  p_family_name text,
  p_user_id uuid,
  p_character_name text,
  p_role_class text DEFAULT 'Adventurer'::text,
  p_avatar_emoji text DEFAULT '🧙'::text,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_family_id     uuid;
  v_membership_id uuid;
  v_character_id  uuid;
  v_link_id       uuid;
  v_now           timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'User ID mismatch';
  END IF;

  IF char_length(p_family_name) < 1 OR char_length(p_family_name) > 100 THEN
    RAISE EXCEPTION 'Family name must be between 1 and 100 characters';
  END IF;
  IF char_length(p_character_name) < 1 OR char_length(p_character_name) > 50 THEN
    RAISE EXCEPTION 'Character name must be between 1 and 50 characters';
  END IF;

  INSERT INTO families (name, created_by, created_at)
  VALUES (p_family_name, p_user_id, v_now)
  RETURNING id INTO v_family_id;

  INSERT INTO memberships (family_id, user_id, role, email, created_at)
  VALUES (v_family_id, p_user_id, 'parent', p_email, v_now)
  RETURNING id INTO v_membership_id;

  INSERT INTO characters (family_id, name, role_class, avatar_emoji, is_kid, gold, created_at)
  VALUES (v_family_id, p_character_name, p_role_class, p_avatar_emoji, false, 0, v_now)
  RETURNING id INTO v_character_id;

  INSERT INTO user_character_links (family_id, user_id, character_id, created_at)
  VALUES (v_family_id, p_user_id, v_character_id, v_now)
  RETURNING id INTO v_link_id;

  PERFORM seed_family_skills(v_family_id);

  RETURN jsonb_build_object(
    'family', jsonb_build_object(
      'id', v_family_id,
      'name', p_family_name,
      'created_by', p_user_id,
      'created_at', v_now
    ),
    'membership', jsonb_build_object(
      'id', v_membership_id,
      'family_id', v_family_id,
      'user_id', p_user_id,
      'role', 'parent',
      'created_at', v_now
    ),
    'character', jsonb_build_object(
      'id', v_character_id,
      'family_id', v_family_id,
      'name', p_character_name,
      'role_class', p_role_class,
      'avatar_emoji', p_avatar_emoji,
      'is_kid', false,
      'gold', 0,
      'created_at', v_now
    )
  );
END;
$function$;