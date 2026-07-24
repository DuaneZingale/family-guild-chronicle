# Family Guild Chronicle — Local Forge / Demo Mode

Lovable export of the **OWF Family Guild Chronicle** app, running locally to explore the UI/UX
while the original Supabase backend (project `rqfwpyzkqgvwcxlxdoji`) is paused.

## Run it

```bash
cd 05_FORGE/code-projects/family-guild-chronicle
npm install        # first time only
npm run dev        # → http://localhost:8080
```

Or via the Forge preview launcher: server name `family-guild-chronicle` in `.claude/launch.json`.

## Demo mode (auth bypass)

`.env` sets `VITE_DEMO_MODE="true"`. When on, `AuthGate` in `src/App.tsx` lets every route
through without a Supabase login. **Set it to `"false"` (or delete the line) to restore real auth.**
Only that one flag + the early-return in `AuthGate` were added — nothing else was modified.

## What's viewable offline vs. not

The app was mid-migration from a localStorage seed (`src/data/seed`) to Supabase. So:

| Status | Pages | Source |
|--------|-------|--------|
| ✅ Fully populated offline | Quest Board, Quest Log, Shop, Journal, Library, Campaigns | localStorage seed |
| ⚠️ Empty while Supabase paused | My Character (home), Paths, Character Profile, Guild Hall, Guild Settings | Supabase queries (filtered by `familyId`, which is null in demo mode) |

Seed family: Duane, Becky, Chloe, Ariasha. Six Paths: Care, Curiosity, Craft, Contribution, Connection, Wealth.

To get a **complete** offline tour, the Supabase-backed pages would each need a demo branch that
returns the seed data instead of querying the paused backend. Not yet done — see the Forge log.
