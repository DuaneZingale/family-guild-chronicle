
-- Allow parents to delete invites (cancel invite)
CREATE POLICY "Parents can delete invites"
ON public.family_invites
FOR DELETE
TO authenticated
USING (is_family_parent(family_id));

-- Allow parents to delete memberships (revoke member) but not themselves
CREATE POLICY "Parents can revoke other members"
ON public.memberships
FOR DELETE
TO authenticated
USING (
  is_family_parent(family_id)
  AND user_id != auth.uid()
);
