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
      // Ensure all arrays exist (for backwards compatibility)
      return {
        domains: parsed.domains ?? DOMAINS,
        characters: parsed.characters ?? CHARACTERS,
        skills: parsed.skills ?? SKILLS,
        xpEvents: parsed.xpEvents ?? [],
        questTemplates: parsed.questTemplates ?? QUEST_TEMPLATES,
        questInstances: parsed.questInstances ?? [],
        campaigns: parsed.campaigns ?? CAMPAIGNS,
        campaignSteps: parsed.campaignSteps ?? CAMPAIGN_STEPS,
        rewards: parsed.rewards ?? REWARDS,
        customIntervalAnchor: parsed.customIntervalAnchor,
      };
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return getInitialState();
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
