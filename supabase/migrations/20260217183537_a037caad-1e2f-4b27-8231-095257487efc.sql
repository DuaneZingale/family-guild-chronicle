-- Allow parents to update membership roles within their family
CREATE POLICY "Parents can update memberships"
ON public.memberships
FOR UPDATE
USING (is_family_parent(family_id))
WITH CHECK (is_family_parent(family_id));