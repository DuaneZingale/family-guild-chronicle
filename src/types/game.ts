// Core game types - DO NOT modify field names or add new fields without TODO comment

export type DomainName = "Health" | "Learning" | "Stewardship" | "Wealth" | "Bond" | "Craft" | "Adventure";

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

export type Skill = {
  id: string;
  domainId: string;
  ownerId: string;
  name: string;
  description: string;
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

// Game state for context
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
  customIntervalAnchor?: string; // YYYY-MM-DD for custom interval tracking
};
