// Unified Quest System Types

export type QuestType = "training" | "side" | "guild" | "campaign_step";
export type FrequencyType = "daily" | "weekly" | "monthly";
export type RitualBlock = "morning" | "afternoon" | "evening";
export type QuestImportance = "essential" | "growth" | "delight";
export type QuestAutonomy = "self_start" | "prompt_ok" | "parent_led";

export interface UnifiedQuest {
  id: string;
  family_id: string;
  quest_type: QuestType;
  name: string;
  description: string;

  // Assignment (NULL = guild quest, anyone can complete)
  assigned_to_character_id: string | null;
  character_skill_id: string | null;

  // Rewards
  xp_reward: number;
  gold_reward: number;

  // Frequency (training quests)
  frequency_type: FrequencyType | null;
  ritual_block: RitualBlock | null;
  days_of_week: number[];
  times_per_day: number;
  interval_days: number | null;

  // Streak tracking
  streak_count: number;
  last_completed_at: string | null;

  // Metadata
  importance: string;
  autonomy: string;
  due_start: string | null;
  due_end: string | null;
  notify_if_incomplete: boolean;

  // Campaign linkage
  campaign_id: string | null;
  step_order: number | null;

  // Status
  active: boolean;
  status: string;

  // Source tracking
  is_suggested: boolean;
  source_template_id: string | null;

  created_at: string;
}

export interface QuestLog {
  id: string;
  family_id: string;
  quest_id: string;
  character_id: string;
  completed_at: string;
  due_date: string;
  slot: number;
  ritual_block: string | null;
  xp_earned: number;
  gold_earned: number;
  streak_at_completion: number;
  note: string;
}

// Helpers
export const RITUAL_BLOCK_CONFIG: Record<RitualBlock, { icon: string; label: string; timeRange: string }> = {
  morning: { icon: "🌅", label: "Morning Ritual", timeRange: "6am – 12pm" },
  afternoon: { icon: "☀️", label: "Afternoon Ritual", timeRange: "12pm – 6pm" },
  evening: { icon: "🌙", label: "Evening Ritual", timeRange: "6pm – 10pm" },
};

export const QUEST_TYPE_CONFIG: Record<QuestType, { icon: string; label: string; color: string }> = {
  training: { icon: "🏋️", label: "Training Quest", color: "text-blue-500" },
  side: { icon: "📌", label: "Side Quest", color: "text-amber-500" },
  guild: { icon: "⚔️", label: "Guild Quest", color: "text-purple-500" },
  campaign_step: { icon: "🗺️", label: "Campaign Step", color: "text-emerald-500" },
};
