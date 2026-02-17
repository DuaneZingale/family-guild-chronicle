import type { GameState, XPEvent, QuestInstance, QuestTemplate, Character, Skill, CampaignStep } from "@/types/game";

// XP and Level calculations — now character-aware for shared skills
export function getSkillXP(state: GameState, skillId: string, characterId?: string): number {
  return state.xpEvents
    .filter((e) => e.skillId === skillId && (!characterId || e.characterId === characterId))
    .reduce((sum, e) => sum + e.xp, 0);
}

export function getSkillLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getCharacterXP(state: GameState, characterId: string): number {
  return state.xpEvents
    .filter((e) => e.characterId === characterId)
    .reduce((sum, e) => sum + e.xp, 0);
}

export function getCharacterLevel(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

export function getXPProgress(xp: number, xpPerLevel: number): number {
  return (xp % xpPerLevel) / xpPerLevel * 100;
}

// ID + date helpers
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

// Quest instance generation
export function shouldGenerateForDay(
  template: QuestTemplate,
  date: Date,
  anchorDate?: string
): boolean {
  if (!template.active) return false;
  if (template.visibility === "suggested") return false;

  switch (template.recurrenceType) {
    case "none":
      return false;
    case "daily":
      return true;
    case "weekly":
      return template.daysOfWeek?.includes(getDayOfWeek(date)) ?? false;
    case "custom":
      if (!template.intervalDays || !anchorDate) return false;
      const anchor = new Date(anchorDate);
      const diffTime = date.getTime() - anchor.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % template.intervalDays === 0;
    default:
      return false;
  }
}

export function generateQuestInstances(state: GameState): QuestInstance[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingMap = new Map<string, QuestInstance>();
  state.questInstances.forEach((qi) => {
    const key = `${qi.templateId}-${qi.dueDate}-${qi.slot ?? 1}`;
    existingMap.set(key, qi);
  });

  const newInstances: QuestInstance[] = [...state.questInstances];

  for (let i = 0; i <= 7; i++) {
    const date = addDays(today, i);
    const dateStr = formatDate(date);

    for (const template of state.questTemplates) {
      if (!shouldGenerateForDay(template, date, state.customIntervalAnchor)) {
        continue;
      }

      const timesPerDay = template.timesPerDay ?? 1;

      for (let slot = 1; slot <= timesPerDay; slot++) {
        const key = `${template.id}-${dateStr}-${slot}`;

        if (!existingMap.has(key)) {
          const instance: QuestInstance = {
            id: generateId(),
            templateId: template.id,
            dueDate: dateStr,
            slot: timesPerDay > 1 ? slot : undefined,
            status: "available",
          };
          newInstances.push(instance);
          existingMap.set(key, instance);
        }
      }
    }
  }

  return newInstances;
}

// Quest completion
export function completeQuest(
  state: GameState,
  instanceId: string
): { updatedState: GameState; xpEvent: XPEvent | null } {
  const instance = state.questInstances.find((qi) => qi.id === instanceId);
  if (!instance || instance.status !== "available") {
    return { updatedState: state, xpEvent: null };
  }

  const template = state.questTemplates.find((qt) => qt.id === instance.templateId);
  if (!template) {
    return { updatedState: state, xpEvent: null };
  }

  const now = Date.now();

  const xpEvent: XPEvent = {
    id: generateId(),
    ts: now,
    characterId: template.assignedToId,
    skillId: template.skillId,
    xp: template.xpReward,
    gold: template.goldReward,
    source: "quest",
    note: template.name,
  };

  const updatedInstances = state.questInstances.map((qi) =>
    qi.id === instanceId
      ? { ...qi, status: "done" as const, completedTs: now }
      : qi
  );

  const updatedCharacters = state.characters.map((c) =>
    c.id === template.assignedToId
      ? { ...c, gold: c.gold + template.goldReward }
      : c
  );

  return {
    updatedState: {
      ...state,
      questInstances: updatedInstances,
      characters: updatedCharacters,
      xpEvents: [...state.xpEvents, xpEvent],
    },
    xpEvent,
  };
}

// Manual XP add
export function addManualXP(
  state: GameState,
  characterId: string,
  skillId: string,
  xp: number,
  gold: number = 0,
  note?: string
): GameState {
  const xpEvent: XPEvent = {
    id: generateId(),
    ts: Date.now(),
    characterId,
    skillId,
    xp,
    gold,
    source: "manual",
    note,
  };

  const updatedCharacters = state.characters.map((c) =>
    c.id === characterId ? { ...c, gold: c.gold + gold } : c
  );

  return {
    ...state,
    xpEvents: [...state.xpEvents, xpEvent],
    characters: updatedCharacters,
  };
}

// Campaign step completion
export function completeCampaignStep(
  state: GameState,
  stepId: string
): GameState {
  const step = state.campaignSteps.find((s) => s.id === stepId);
  if (!step || step.status !== "available") {
    return state;
  }

  const xpEvent: XPEvent = {
    id: generateId(),
    ts: Date.now(),
    characterId: step.assignedToId,
    skillId: step.skillId,
    xp: step.xpReward,
    gold: step.goldReward,
    source: "campaign",
    note: step.name,
  };

  const updatedSteps = state.campaignSteps.map((s) => {
    if (s.id === stepId) {
      return { ...s, status: "done" as const };
    }
    if (s.campaignId === step.campaignId && s.order === step.order + 1) {
      return { ...s, status: "available" as const };
    }
    return s;
  });

  const campaignSteps = updatedSteps.filter((s) => s.campaignId === step.campaignId);
  const allDone = campaignSteps.every((s) => s.status === "done");

  const updatedCampaigns = state.campaigns.map((c) =>
    c.id === step.campaignId && allDone
      ? { ...c, status: "complete" as const }
      : c
  );

  const updatedCharacters = state.characters.map((c) =>
    c.id === step.assignedToId ? { ...c, gold: c.gold + step.goldReward } : c
  );

  return {
    ...state,
    campaignSteps: updatedSteps,
    campaigns: updatedCampaigns,
    characters: updatedCharacters,
    xpEvents: [...state.xpEvents, xpEvent],
  };
}

// Uncomplete a campaign step (undo)
export function uncompleteCampaignStep(
  state: GameState,
  stepId: string
): GameState {
  const step = state.campaignSteps.find((s) => s.id === stepId);
  if (!step || step.status !== "done") return state;

  // Remove the XP event that was created for this step
  const xpEvents = state.xpEvents.filter(
    (e) => !(e.source === "campaign" && e.note === step.name && e.characterId === step.assignedToId && e.skillId === step.skillId)
  );

  // Revert gold
  const updatedCharacters = state.characters.map((c) =>
    c.id === step.assignedToId ? { ...c, gold: Math.max(0, c.gold - step.goldReward) } : c
  );

  // Set this step back to available, and any step after it back to locked
  const updatedSteps = state.campaignSteps.map((s) => {
    if (s.campaignId !== step.campaignId) return s;
    if (s.id === stepId) return { ...s, status: "available" as const };
    if (s.order > step.order && s.status !== "done") return { ...s, status: "locked" as const };
    return s;
  });

  // Campaign can't be complete if we uncompleted a step
  const updatedCampaigns = state.campaigns.map((c) =>
    c.id === step.campaignId ? { ...c, status: "active" as const } : c
  );

  return {
    ...state,
    campaignSteps: updatedSteps,
    campaigns: updatedCampaigns,
    characters: updatedCharacters,
    xpEvents,
  };
}

// Spend gold
export function spendGold(
  state: GameState,
  characterId: string,
  amount: number,
  note: string
): GameState | null {
  const character = state.characters.find((c) => c.id === characterId);
  if (!character || character.gold < amount) {
    return null;
  }

  const updatedCharacters = state.characters.map((c) =>
    c.id === characterId ? { ...c, gold: c.gold - amount } : c
  );

  const xpEvent: XPEvent = {
    id: generateId(),
    ts: Date.now(),
    characterId,
    skillId: "",
    xp: 0,
    gold: -amount,
    source: "manual",
    note: `Purchased: ${note}`,
  };

  return {
    ...state,
    characters: updatedCharacters,
    xpEvents: [...state.xpEvents, xpEvent],
  };
}

// Helpers
export function getTodayQuests(state: GameState): QuestInstance[] {
  const today = formatDate(new Date());
  return state.questInstances.filter((qi) => qi.dueDate === today);
}

export function getRecentEvents(state: GameState, limit: number = 10): XPEvent[] {
  return [...state.xpEvents]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
}

export function getCharacter(state: GameState, id: string): Character | undefined {
  return state.characters.find((c) => c.id === id);
}

export function getSkill(state: GameState, id: string): Skill | undefined {
  return state.skills.find((s) => s.id === id);
}

export function getDomain(state: GameState, id: string) {
  return state.domains.find((d) => d.id === id);
}

// Get all skills grouped by domain (shared skills, no owner filtering)
export function getSkillsByDomain(state: GameState) {
  const grouped: Record<string, Skill[]> = {};
  for (const skill of state.skills) {
    if (!grouped[skill.domainId]) {
      grouped[skill.domainId] = [];
    }
    grouped[skill.domainId].push(skill);
  }
  return grouped;
}

// Legacy compat — returns all skills grouped by domain (ignores characterId since skills are shared)
export function getCharacterSkillsByDomain(state: GameState, _characterId: string) {
  return getSkillsByDomain(state);
}
