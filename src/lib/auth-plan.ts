/**
 * AUTH ARCHITECTURE PLAN — Future Supabase Integration
 * ====================================================
 *
 * STATUS: Planning only. No Supabase connected yet.
 *
 * GOAL: Each family member gets a login. Parents have full access (admin).
 * Kids have restricted "Kid Mode" access (Today + Library + Character Sheet).
 *
 * DATABASE MAPPING:
 * -----------------
 * - auth.users → one row per family member
 * - public.profiles → { id (FK auth.users), character_id, role: "parent" | "kid", family_id }
 * - public.families → { id, name, guild_character_id }
 * - Character.id becomes a FK to profiles.character_id
 *
 * ROLES:
 * ------
 * - Parent (admin): full CRUD on all game data, can manage characters, create quests
 * - Kid (restricted): can view Today's quests, browse Library, view own Character Sheet,
 *   complete own quests, but cannot edit templates, manage other characters, or access admin screens
 *
 * RLS POLICIES:
 * -------------
 * - All game tables scoped by family_id
 * - Kids can only READ quest_templates, skills, domains
 * - Kids can UPDATE quest_instances (complete their own quests)
 * - Kids can READ their own xp_events and character data
 * - Parents can CRUD everything within their family
 *
 * KID MODE (current implementation):
 * ----------------------------------
 * - GameState.kidModeCharacterId toggles restricted UI
 * - When Supabase is connected, this will be derived from auth.user → profiles.role
 * - Navigation already filters based on kidModeCharacterId
 *
 * MIGRATION PATH:
 * ---------------
 * 1. Connect Supabase / enable Lovable Cloud
 * 2. Create profiles + families tables
 * 3. Migrate localStorage data to Supabase tables
 * 4. Replace useReducer + localStorage with Supabase queries
 * 5. Add RLS policies per role
 * 6. Replace kidModeCharacterId with auth-derived role check
 */

export {}; // ensure this is treated as a module
