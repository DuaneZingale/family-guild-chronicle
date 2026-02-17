
-- Drop old constraints
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_role_check;
ALTER TABLE family_invites DROP CONSTRAINT IF EXISTS family_invites_role_check;

-- Add expanded constraints
ALTER TABLE memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN ('parent', 'co-parent', 'kid', 'guest'));

ALTER TABLE family_invites ADD CONSTRAINT family_invites_role_check
  CHECK (role IN ('parent', 'co-parent', 'kid', 'guest'));

-- Update is_family_parent to include co-parents
CREATE OR REPLACE FUNCTION public.is_family_parent(p_family_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
      AND role IN ('parent', 'co-parent')
  );
$$;
