

# Quest System Overhaul: Tasks, Scheduling, and XP Flow Fix

## Problems Identified

1. **SkillCard has manual +5/+15 XP buttons** that bypass the quest system. XP should only come from completing routines, tasks, and campaigns -- not arbitrary manual adds. These buttons break the core game loop.

2. **No one-off tasks exist.** Everything is treated as a recurring routine. You can't create a single task like "Build Becky's desk" without it becoming a daily/weekly thing.

3. **Quests/Campaigns need clearer distinction.** Campaigns are multi-step projects (build a desk, Disney trip). Tasks are individual completable items. A campaign should break down into tasks.

4. **Dialog scroll bug.** The QuickAddRoutine dialog overflows on mobile without proper scrolling.

5. **Scheduling is too limited.** Currently only "daily" or "weekly (pick days)" -- no way to do "Mon/Wed/Fri at 7am and 7pm" (specific days + times per day combined). The weekly option doesn't support times per day.

6. **Time-bound completion bonuses.** No way to set a deadline window where completing on time gives bonus XP.

---

## Changes

### 1. Remove Manual XP Buttons from SkillCard

Remove the +5/+15 XP buttons from `SkillCard`. Skills display XP progress (read-only view showing what you've earned from completing things), not a manual increment tool.

**File:** `src/components/game/SkillCard.tsx`
- Remove `showAddButtons` prop and the button rendering
- Remove the `handleAddXP` function
- Keep the XP bar, level display, and description (read-only)

### 2. Add One-Off Tasks

Rename and expand the "Add Routine" dialog into a unified "Add Quest" flow that supports three types:
- **Routine** (recurring: daily/weekly/custom)
- **Task** (one-off: single completion, optional due date)
- **Campaign step** (part of a multi-step project -- handled on Campaigns page)

**File:** `src/components/game/QuickAddRoutine.tsx` -- rename to `QuickAddQuest.tsx`
- Add a "Quest Type" selector at the top: Routine | Task
- When "Task" is selected:
  - Hide recurrence fields
  - Show optional due date picker
  - Set `recurrenceType: "none"`, `type: "oneoff"`
  - Generate a single QuestInstance immediately for that date (or today)
- When "Routine" is selected: keep current behavior

**Files updated:** All imports in `CharacterProfile.tsx`, `DomainsSkills.tsx`, `Routines.tsx`

### 3. Enhanced Scheduling (Days + Times Combined)

Currently weekly mode picks days but doesn't support `timesPerDay`. Fix this so the schedule builder works as:

- **Daily**: pick times per day (1x, 2x, etc.)
- **Weekly**: pick specific days AND times per day
- **Custom**: interval days + times per day

This means "Brush Teeth Mon/Wed/Fri at AM and PM" = weekly, daysOfWeek=[1,3,5], timesPerDay=2.

**File:** `src/components/game/QuickAddQuest.tsx` (and `Routines.tsx` form)
- Show `timesPerDay` field for ALL recurrence types (not just daily)
- Add optional time labels (AM/PM/Morning/Evening) -- cosmetic, stored in `dueWindow`

**File:** `src/lib/gameLogic.ts`
- Update `generateQuestInstances` to generate multiple slots for weekly templates too (currently only daily gets `timesPerDay` slots)

### 4. Time-Bound Bonus XP

Add optional `dueWindow` support to the quest creation form:
- Start time and end time (e.g., "before 8:00 AM")
- If `notifyIfIncomplete` is true, flag it for parent view
- Future: bonus XP for on-time completion (prep the field, note in UI as "Complete on time for bonus!")

**File:** `src/components/game/QuickAddQuest.tsx`
- Add collapsible "Advanced" section with `dueWindow` start/end time inputs
- Add `notifyIfIncomplete` toggle

### 5. Fix Dialog Scroll

**File:** `src/components/game/QuickAddQuest.tsx`
- The dialog already has `max-h-[90vh] overflow-y-auto` on QuickAddRoutine but the Routines page dialog at line 165 is missing it
- Add `max-h-[90vh] overflow-y-auto` to all DialogContent instances

**File:** `src/pages/Routines.tsx`
- Add scroll classes to DialogContent

### 6. Rename "Routines" Page to "Quests & Routines"

Update the page title and navigation to reflect that it handles both one-off tasks and recurring routines. Show them in separate sections:
- **Active Tasks** (one-off, not yet done)
- **Routines** (recurring templates)

**File:** `src/pages/Routines.tsx` -- update title, split display
**File:** `src/components/layout/Navigation.tsx` -- update nav label

---

## Technical Details

### Files to Create
- `src/components/game/QuickAddQuest.tsx` -- new unified quest creation dialog (replaces QuickAddRoutine)

### Files to Modify
- `src/components/game/SkillCard.tsx` -- remove manual XP buttons
- `src/components/game/QuickAddRoutine.tsx` -- delete (replaced by QuickAddQuest)
- `src/pages/Routines.tsx` -- rename to "Quests and Routines", split view, fix dialog scroll, support one-off tasks
- `src/pages/CharacterProfile.tsx` -- update imports, add "Add Task" button alongside "Add Routine"
- `src/pages/DomainsSkills.tsx` -- update imports
- `src/components/layout/Navigation.tsx` -- rename nav item
- `src/lib/gameLogic.ts` -- support `timesPerDay` for weekly templates in instance generation
- `src/context/GameContext.tsx` -- no schema changes needed; ADD_QUEST_TEMPLATE already handles `type: "oneoff"` with `recurrenceType: "none"`

### Data Flow for One-Off Tasks
When creating a one-off task:
1. Create a QuestTemplate with `type: "oneoff"`, `recurrenceType: "none"`, `active: true`
2. Immediately create a QuestInstance with `dueDate` set to the chosen date (or today)
3. Completing it works exactly like completing a routine instance (same XP/gold flow)
4. Template stays in the list until manually deleted or auto-archived

### Instance Generation Fix
In `generateQuestInstances`, the `timesPerDay` slot loop currently only runs for templates that pass `shouldGenerateForDay`. The fix is ensuring weekly templates also respect `timesPerDay` -- this is already structurally correct in the code but the form never lets you set `timesPerDay` for weekly, so enabling the form field is the main change.

