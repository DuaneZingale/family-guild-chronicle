

# Guild Hall Redesign + Character Profiles + Auth Planning

## Overview
Redesign the Guild Hall layout with a prominent guild banner, compact member cards in a responsive row, a leaderboard, clickable character profiles, and character editing. Also lay groundwork for future Supabase auth.

---

## 1. Guild Banner (Top of Guild Hall)

Replace the current stacked character list with a large "Guild Card" at the top showing:
- Guild emoji (castle) + "Family Guild" name in large fantasy font
- Combined guild-level stats: total XP across all members, guild gold pool, active campaign count
- A warm parchment-panel banner spanning full width

## 2. Member Cards (Responsive Row)

Below the guild banner, show individual members as compact square-ish cards in a responsive grid:
- 4 columns on desktop, 2 on mobile
- Each card: avatar emoji (large), name, level, XP progress bar, gold
- Clickable -- navigates to `/character/:id`

## 3. Leaderboard Section

Add a "Hall of Fame" leaderboard section on the Guild Hall page:
- Ranks members by total XP (descending)
- Shows rank number, avatar, name, level, and XP
- Simple table/list with rank medals (gold/silver/bronze emoji for top 3)

## 4. Character Profile Page (`/character/:id`)

New page showing everything about one character:
- Full character card (avatar, name, class, level, gold, XP bar)
- **Their Quests Today**: filtered quest instances for this character
- **Their Routines**: quest templates assigned to them
- **Their Campaigns**: campaign steps assigned to them
- **Their Skills**: all skills with this character's XP progress
- Edit button opens character edit dialog

## 5. Character Create/Edit

A dialog/form accessible from:
- Character profile page (edit button)
- Guild Hall (add member button, parent-only)

Fields: name, roleClass, avatarEmoji (picker from a preset list), isKid toggle

New reducer actions: `ADD_CHARACTER`, `UPDATE_CHARACTER`, `DELETE_CHARACTER`

## 6. Reusable Guild Banner Component

Create a `GuildBanner` component that can be reused across pages (Guild Hall, and potentially others). It always shows the guild identity at the top.

## 7. Auth Planning (Structural Only)

No Supabase is connected yet, so this is code-structure prep only:
- Add a `TODO` comment block in a new file `src/lib/auth-plan.ts` documenting the planned auth architecture:
  - Parents get full access (admin-like)
  - Kids get restricted "Kid Mode" access
  - Each character maps to a Supabase auth user
  - Character.id will become a FK to a profiles table
- No actual auth code yet -- just the roadmap file

---

## Technical Details

### New Files
- `src/pages/CharacterProfile.tsx` -- character detail page
- `src/components/game/GuildBanner.tsx` -- reusable guild banner
- `src/components/game/Leaderboard.tsx` -- leaderboard component
- `src/components/game/CharacterEditDialog.tsx` -- create/edit character form
- `src/lib/auth-plan.ts` -- auth architecture notes (TODO doc)

### Modified Files
- `src/App.tsx` -- add `/character/:id` route
- `src/pages/GuildHall.tsx` -- replace layout with banner + member grid + leaderboard + today's quests
- `src/components/game/CharacterCard.tsx` -- add a new `"tile"` variant for the compact square cards
- `src/context/GameContext.tsx` -- add `ADD_CHARACTER`, `UPDATE_CHARACTER`, `DELETE_CHARACTER` actions
- `src/types/game.ts` -- no schema changes needed (Character type already has all fields)
- `src/components/layout/Navigation.tsx` -- no changes needed

### Route Structure
- `/` -- Guild Hall (banner, members row, leaderboard, today's quests)
- `/character/:id` -- Character profile with their quests, routines, campaigns, skills

