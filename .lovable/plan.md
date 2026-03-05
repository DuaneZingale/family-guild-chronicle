

# Guild Settings: Admin Member Management

## What to build

Add invite management actions (resend, cancel) and member management actions (revoke, send magic link, reset password) to the Guild Settings page. All admin-only.

## Changes

### 1. Database: Allow deleting invites and memberships (for admins)

**Migration** -- add DELETE RLS policies:
- `family_invites`: parents can delete invites (cancel/revoke)
- `memberships`: parents can delete memberships (revoke member) -- with guard that you can't delete yourself

### 2. Edge Function: Update `send-invite-email` to support resend + magic link modes

Add a `mode` parameter to the existing edge function:
- `mode: "invite"` (default) -- current behavior, creates invite + sends magic link
- `mode: "resend"` -- re-sends magic link for an existing invite code (no new DB row)
- `mode: "magic-link"` -- sends a magic link to an existing member's email (for login help)
- `mode: "reset-password"` -- triggers Supabase's password reset email for a member

### 3. Invites Tab: Add Resend + Cancel buttons

Each invite row gets:
- **Resend** button -- calls edge function with `mode: "resend"` and the existing invite code
- **Cancel** button -- deletes the invite row from `family_invites` with a confirmation dialog

### 4. Members Tab: Add admin actions dropdown

For each non-self member, replace the simple role dropdown with a proper actions column:
- **Change Role** -- existing role selector (keep as-is)
- **Send Magic Link** -- calls edge function with `mode: "magic-link"` to help the member log in
- **Send Password Reset** -- calls edge function with `mode: "reset-password"`
- **Revoke Member** -- deletes membership row with confirmation dialog (AlertDialog)

Use a dropdown menu for these actions to keep the table clean.

### 5. Additional standard features included

- **Confirmation dialogs** for destructive actions (cancel invite, revoke member)
- **Guard against self-removal** -- owner cannot revoke themselves
- **Toast feedback** for all actions

## File changes

| File | Change |
|------|--------|
| `supabase/migrations/new.sql` | Add DELETE policies on `family_invites` and `memberships` for parents |
| `supabase/functions/send-invite-email/index.ts` | Add `mode` parameter handling for resend, magic-link, reset-password |
| `src/pages/GuildSettings.tsx` | Add resend/cancel on invites, add member actions dropdown with magic link / reset / revoke |

