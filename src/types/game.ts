// Core game types — Canon v2 with shared skills, quest metadata, kid mode

export type DomainName = "Care" | "Curiosity" | "Craft" | "Contribution" | "Connection" | "Wealth" | "Adventure";

export type Domain = {
  id: string;
  name: DomainName;
  icon: string;
  description: string;
};

export type Character = {
  id: string;
  name: string;
  roleClass: string;
  isKid: boolean;
  avatarEmoji: string;
  gold: number;
};

// Skills are shared definitions — XP tracked per character via XPEvents
export type Skill = {
  id: string;
  domainId: string;
  name: string;
  description: string;
  isSuggested: boolean;
  suggestedFor: "kid" | "parent" | "guild" | "all";
  defaultEssential: boolean;
};

export type XPEvent = {
  id: string;
  ts: number;
  characterId: string;
  skillId: string;
  xp: number;
  gold: number;
  source: "quest" | "manual" | "campaign";
  note?: string;
};

export type QuestImportance = "essential" | "growth" | "delight";
export type QuestVisibility = "suggested" | "active";
export type QuestAutonomy = "self_start" | "prompt_ok" | "parent_led";

export type QuestTemplate = {
  id: string;
  name: string;
  type: "recurring" | "oneoff";
  assignedToId: string;
  skillId: string;
  xpReward: number;
  goldReward: number;
  recurrenceType: "none" | "daily" | "weekly" | "custom";
  timesPerDay?: number;
  daysOfWeek?: number[];
  intervalDays?: number;
  active: boolean;
  // v2 fields
  importance: QuestImportance;
  visibility: QuestVisibility;
  autonomyLevel: QuestAutonomy;
  dueWindow?: { start: string; end: string };
  notifyIfIncomplete?: boolean;
};

export type QuestInstance = {
  id: string;
  templateId: string;
  dueDate: string;
  slot?: number;
  status: "available" | "done" | "skipped";
  completedTs?: number;
};

export type Campaign = {
  id: string;
  name: string;
  description: string;
  status: "active" | "complete";
};

export type CampaignStep = {
  id: string;
  campaignId: string;
  order: number;
  name: string;
  assignedToId: string;
  skillId: string;
  xpReward: number;
  goldReward: number;
  status: "locked" | "available" | "done";
};

export type Reward = {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
};

export type GameState = {
  domains: Domain[];
  characters: Character[];
  skills: Skill[];
  xpEvents: XPEvent[];
  questTemplates: QuestTemplate[];
  questInstances: QuestInstance[];
  campaigns: Campaign[];
  campaignSteps: CampaignStep[];
  rewards: Reward[];
  customIntervalAnchor?: string;
  kidModeCharacterId?: string; // when set, app is in kid mode for this character
};
