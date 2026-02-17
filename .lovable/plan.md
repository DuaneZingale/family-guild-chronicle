

# Fix Invite System and Streamline Member Management

## Problems Found

1. **Immediate bug**: The database has CHECK constraints on both `family_invites` and `memberships` tables that only allow roles `'parent'` and `'kid'`. When you try to create an invite with role `'co-parent'` or `'guest'`, Postgres rejects it. This is why you see "violates check constraint family_invites_role_check".

2. **Guild Hall "Add Member" button** still uses the old local-only GameContext, not the real Supabase system. It needs to be replaced.

3. **No clear flow for the three member scenarios**:
   - Adding a kid on a shared device (no email needed, just a PIN)
   - Inviting a spouse/co-parent to join on their own device (invite code)
   - Adding a kid who will later get their own device

## Plan

### Step 1 -- Fix Database Constraints

Run a migration to drop the old CHECK constraints and replace them with expanded ones:

```text
memberships.role:    parent, co-parent, kid, guest
family_invites.role: parent, co-parent, kid, guest
```

This immediately fixes the "violates check constraint" error.

### Step 2 -- Update `is_family_parent()` to include co-parents

The existing `is_family_parent` function only checks `role = 'parent'`. It needs to also match `'co-parent'` so co-parents can manage the guild.

### Step 3 -- Replace Guild Hall "Add Member" with two clear actions

Remove the old `CharacterEditDialog` button and replace it with two options:

- **"Add Kid Character"** -- Creates a character on this device (shared device scenario). Opens a simple dialog: enter name, pick emoji. The kid gets a character but no Supabase auth account. Parent can set a PIN for them later.
- **"Invite Member"** -- Links to Guild Settings invites tab. For spouse/co-parent/older kid who will use their own device and email.

### Step 4 -- Create "Add Kid Character" dialog

A new dialog component that:
1. Takes a character name and avatar emoji
2. Creates the character in Supabase (with `is_kid = true`)
3. Optionally sets a 4-digit PIN right away
4. Does NOT create a Supabase auth user (the kid logs in via PIN on the shared device)
5. If the kid later gets their own device, a parent can generate an invite code to link them

### Step 5 -- Clean up Guild Settings invite role options

The role dropdown already lists all four roles. After the constraint fix, it will just work.

## Technical Details

**Migration SQL:**
```text
-- Drop old constraints
ALTER TABLE memberships DROP CONSTRAINT memberships_role_check;
ALTER TABLE family_invites DROP CONSTRAINT family_invites_role_check;

-- Add expanded constraints
ALTER TABLE memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN ('parent', 'co-parent', 'kid', 'guest'));

ALTER TABLE family_invites ADD CONSTRAINT family_invites_role_check
  CHECK (role IN ('parent', 'co-parent', 'kid', 'guest'));
```

**Updated `is_family_parent` function:**
```text
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
```

**Files to modify:**
- `src/pages/GuildHall.tsx` -- Replace "Add Member" with "Add Kid" and "Invite Member" buttons
- New component: `src/components/game/AddKidDialog.tsx` -- Dialog to create a kid character + optional PIN
- `src/pages/GuildSettings.tsx` -- Minor cleanup (no major changes needed once constraints are fixed)

**Member access scenarios after changes:**

```text
Scenario                     Flow
--------------------------   -------------------------------------------
Kid on shared device         Parent clicks "Add Kid" -> enters name ->
                             optionally sets PIN -> kid uses PIN login

Spouse on own device         Parent goes to Guild Settings -> Invites ->
                             generates code with "Co-Leader" role ->
                             spouse goes to /join, enters code

Kid gets own device later    Parent generates invite code with "Kid" role
                             -> kid signs up on new device using code
```

