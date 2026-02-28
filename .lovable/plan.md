
# Refactor: RPG Skill Trees, Domain-to-Path Cleanup, Dark Mode, and Core Skills

## Overview
This is a comprehensive refactor touching database seed data, UI terminology, the Paths page visual overhaul, dark/light theme toggle, and quest creation alignment. No new tables are needed -- the existing `skill_definitions` and `path_definitions` tables already support everything.

---

## 1. Replace Core Skills in Database

**Current state:** 21 generic skills in `skill_definitions` (e.g., "Reading", "Morning Routine", "Outdoor Play").

**Action:** Delete existing skill_definitions rows and insert the 35 RPG-named skills (5 per path):

| Path | Skills |
|------|--------|
| Care | Vitality, Athletics, Restoration, Discipline, Composure |
| Curiosity | Insight, Inquiry, Perception, Lore, Expression |
| Craft | Creation, Artistry, Mastery, Performance, Engineering |
| Contribution | Service, Order, Reliability, Maintenance, Community |
| Connection | Speechcraft, Empathy, Compassion, Repair, Leadership |
| Wealth | Commerce, Provisioning, Strategy, Investment, Administration |
| Adventure | Exploration, Recreation, Courage, Adaptation, Discovery |

Each skill gets a short RPG-flavored description. `path_id` and `domain_id` both set to the path ID for backward compatibility.

**Risk:** Existing `unified_quests` and `character_skills` rows reference old `skill_definition` IDs via `character_skill_id`. Since there are very few quests in the DB currently, this is acceptable -- orphaned references will just show no skill tag. The `family_skill_library` seeding function will re-seed with the new defaults.

---

## 2. Update Seed Data (Local)

Update `src/data/seed.ts`:
- Replace all SKILLS entries with the 35 new RPG skills
- Update QUEST_TEMPLATES and SUGGESTED_QUEST_LIBRARY to reference new skill IDs
- Keep PATHS, CHARACTERS, CAMPAIGNS, REWARDS unchanged

---

## 3. Replace "Domain" Terminology Everywhere

Files to update:
- **`src/components/game/DomainBadge.tsx`** -- rename CSS class `domain-badge` references, keep component working
- **`src/index.css`** -- rename `.domain-badge` to `.path-badge` (keep both for compat)
- **`src/pages/DomainsSkills.tsx`** -- update `state.domains` references and UI copy
- **`src/pages/Campaigns.tsx`** -- replace `getDomain` calls with `getPath`
- **`src/lib/gameLogic.ts`** -- already has `getPath`, just clean up deprecated `getDomain` usage
- **`src/types/game.ts`** -- already migrated, just clean deprecated aliases
- **`src/data/seed.ts`** -- remove `DOMAINS` export alias

---

## 4. Paths Page Overhaul (Skyrim-Style Skill Trees)

Rebuild `src/pages/DomainsSkills.tsx` to be a dedicated "Skill Trees" screen:

**Layout per Path:**
- Large path icon + "The Path Of [Name]" heading + description
- Computed "Path Level" (sum of all skill XP under path, divided by level threshold)
- Grid of skill cards, each showing:
  - Skill name in fantasy font
  - Level number (1-50 scale, XP/100 per level)
  - XP progress bar with glow effect
  - "+X XP recently" label if gains exist this week
  - Path badge color coding

**Data source:** Fetch directly from Supabase (`xp_events` + `skill_definitions` + `path_definitions`) instead of legacy GameContext, since the Paths page should work with real DB data.

**Visual style:**
- Dark panel backgrounds even in light mode for that "skill tree" feel
- Subtle glow on progress bars
- Fantasy font headings throughout

---

## 5. Dark Mode / Light Mode Toggle

**Implementation:**
- Add `next-themes` ThemeProvider (already installed) wrapping the app in `src/main.tsx`
- Add a theme toggle button in the Navigation bar (sun/moon icon)
- Dark mode CSS variables are already defined in `src/index.css` under `.dark`
- Persist preference via `localStorage` (next-themes default behavior)

**Naming:**
- Light = "Parchment Realm" (current default)
- Dark = "Dark Realm" (Skyrim-inspired)

---

## 6. Quest Creation Form -- Already Correct

The current `QuickAddQuest.tsx` already implements the hierarchical flow:
1. Quest Type selection
2. Path selection (required)
3. Skill filtered by Path
4. Rewards

No changes needed here beyond ensuring the new skill IDs populate correctly after the DB migration.

---

## 7. Training Grounds + Ritual Tabs -- Already Implemented

`RitualTabs.tsx` and `MyCharacter.tsx` already have:
- Morning/Afternoon/Evening tabs
- Design Ritual mode
- Streak display
- Gain-based framing

No changes needed.

---

## 8. Hall of Fame -- Already Implemented

`HallOfFame.tsx` already has All-Time Legends and This Week's Momentum sections with gain-based framing.

No changes needed.

---

## 9. Quest Board / Suggested Library -- Preserved

The Quest Board page and suggested quest templates remain untouched. Skill references in the suggested library will be updated to point to new skill IDs.

---

## Technical Plan (File Changes)

### Database Migration
- DELETE all rows from `skill_definitions`
- INSERT 35 new RPG-named skills with correct `path_id` and `domain_id`
- Re-run `seed_family_skills` for existing families

### Files to Create
- None (all components exist)

### Files to Edit
1. **`src/data/seed.ts`** -- Replace SKILLS array with 35 RPG skills; update quest template skill references
2. **`src/pages/DomainsSkills.tsx`** -- Full rewrite to Supabase-powered Skill Trees view with XP bars, levels, and RPG styling
3. **`src/components/game/SkillCard.tsx`** -- Update to work with Supabase data instead of GameContext
4. **`src/index.css`** -- Add `.path-badge` alias; minor dark mode polish
5. **`src/main.tsx`** -- Wrap app with ThemeProvider
6. **`src/components/layout/Navigation.tsx`** -- Add theme toggle button (sun/moon)
7. **`src/pages/Campaigns.tsx`** -- Replace `getDomain` with `getPath`
8. **`src/components/game/DomainBadge.tsx`** -- Clean up naming (keep component working)

### Files Unchanged
- `QuickAddQuest.tsx` (already correct)
- `RitualTabs.tsx` (already correct)
- `HallOfFame.tsx` (already correct)
- `MyCharacter.tsx` (already correct)
- `CharacterQuestsPanel.tsx` (already correct)
- `GuildHall.tsx` (already correct)
