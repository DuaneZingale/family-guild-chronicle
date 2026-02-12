import type { GameState } from "@/types/game";
import { DOMAINS, CHARACTERS, SKILLS, QUEST_TEMPLATES, CAMPAIGNS, CAMPAIGN_STEPS, REWARDS } from "@/data/seed";

const STORAGE_KEY = "family-guild-state";

export function getInitialState(): GameState {
  return {
    domains: DOMAINS,
    characters: CHARACTERS,
    skills: SKILLS,
    xpEvents: [],
    questTemplates: QUEST_TEMPLATES,
    questInstances: [],
    campaigns: CAMPAIGNS,
    campaignSteps: CAMPAIGN_STEPS,
    rewards: REWARDS,
  };
}

export function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GameState;
      // Always use latest domain + skill definitions from seed
      return {
        domains: DOMAINS,
        characters: parsed.characters ?? CHARACTERS,
        skills: SKILLS,
        xpEvents: parsed.xpEvents ?? [],
        questTemplates: migrateQuestTemplates(parsed.questTemplates ?? QUEST_TEMPLATES),
        questInstances: parsed.questInstances ?? [],
        campaigns: parsed.campaigns ?? CAMPAIGNS,
        campaignSteps: parsed.campaignSteps ?? CAMPAIGN_STEPS,
        rewards: parsed.rewards ?? REWARDS,
        customIntervalAnchor: parsed.customIntervalAnchor,
        kidModeCharacterId: parsed.kidModeCharacterId,
      };
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return getInitialState();
}

// Migrate old quest templates to include v2 fields
function migrateQuestTemplates(templates: any[]): GameState["questTemplates"] {
  return templates.map((t) => ({
    ...t,
    importance: t.importance ?? "growth",
    visibility: t.visibility ?? "active",
    autonomyLevel: t.autonomyLevel ?? "prompt_ok",
  }));
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

export function resetGameState(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  return getInitialState();
}
