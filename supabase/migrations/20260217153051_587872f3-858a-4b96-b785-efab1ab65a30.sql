
-- Enable pgcrypto for PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table to store device-level PINs for kid characters
CREATE TABLE public.kid_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(character_id)
);

ALTER TABLE public.kid_pins ENABLE ROW LEVEL SECURITY;

-- Only parents can manage PINs
CREATE POLICY "Parents can manage kid pins"
  ON public.kid_pins FOR ALL
  USING (is_family_parent(family_id))
  WITH CHECK (is_family_parent(family_id));

-- Function to verify a kid PIN (security definer so it bypasses RLS)
CREATE OR REPLACE FUNCTION public.verify_kid_pin(p_character_id uuid, p_pin text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM kid_pins
    WHERE character_id = p_character_id
      AND pin_hash = crypt(p_pin, pin_hash)
  );
END;
$$;

-- Function to set a kid PIN (only parents)
CREATE OR REPLACE FUNCTION public.set_kid_pin(p_family_id uuid, p_character_id uuid, p_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_family_parent(p_family_id) THEN
    RAISE EXCEPTION 'Only parents can set PINs';
  END IF;
  
  INSERT INTO kid_pins (family_id, character_id, pin_hash)
  VALUES (p_family_id, p_character_id, crypt(p_pin, gen_salt('bf')))
  ON CONFLICT (character_id)
  DO UPDATE SET pin_hash = crypt(p_pin, gen_salt('bf'));
END;
$$;
