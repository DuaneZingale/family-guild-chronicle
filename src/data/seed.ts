import type { Path, Character, Skill, QuestTemplate, Campaign, CampaignStep, Reward } from "@/types/game";

// DO NOT create new paths dynamically. These 7 are canon — The Seven Paths.

export const PATHS: Path[] = [
  { id: "care", name: "Care", icon: "🌿", description: "Support body and nervous system wellbeing with steady self-care." },
  { id: "curiosity", name: "Curiosity", icon: "🔎", description: "Explore, ask questions, and keep learning with wonder." },
  { id: "craft", name: "Craft", icon: "🛠️", description: "Build skills through practice, creating, and mastery." },
  { id: "contribution", name: "Contribution", icon: "🤝", description: "Strengthen the guild by helping, stewarding, and taking responsibility." },
  { id: "connection", name: "Connection", icon: "🫶", description: "Grow closeness through presence, kindness, and celebration." },
  { id: "wealth", name: "Wealth", icon: "💰", description: "Build stability through smart stewardship of money and resources." },
  { id: "adventure", name: "Adventure", icon: "🗺️", description: "Turn life into stories through experiences, play, and exploration." },
];

/** @deprecated Use PATHS instead */
export const DOMAINS = PATHS;

export const CHARACTERS: Character[] = [
  { id: "duane", name: "Duane", roleClass: "Builder", isKid: false, avatarEmoji: "🧙‍♂️", gold: 0 },
  { id: "becky", name: "Becky", roleClass: "Hearthkeeper", isKid: false, avatarEmoji: "🧝‍♀️", gold: 0 },
  { id: "chloe", name: "Chloe", roleClass: "Scribe", isKid: true, avatarEmoji: "📜", gold: 0 },
  { id: "ariasha", name: "Ariasha", roleClass: "Ranger", isKid: true, avatarEmoji: "🏹", gold: 0 },
  { id: "guild", name: "The Guild", roleClass: "Shared", isKid: false, avatarEmoji: "🏰", gold: 0 },
];

// 35 RPG-named core skills — 5 per path
export const SKILLS: Skill[] = [
  // Path of Care
  { id: "vitality", domainId: "care", name: "Vitality", description: "Fortify your life force through health and wellness practices", isSuggested: true, suggestedFor: "all", defaultEssential: true },
  { id: "athletics", domainId: "care", name: "Athletics", description: "Strengthen the body through movement, sport, and physical training", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "restoration", domainId: "care", name: "Restoration", description: "Master the arts of rest, recovery, and nervous system regulation", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "discipline", domainId: "care", name: "Discipline", description: "Build steady habits and routines that anchor your day", isSuggested: true, suggestedFor: "all", defaultEssential: true },
  { id: "composure", domainId: "care", name: "Composure", description: "Cultivate emotional steadiness and calm under pressure", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Path of Curiosity
  { id: "perception", domainId: "curiosity", name: "Perception", description: "Sharpen awareness of the world through all senses", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "inquiry", domainId: "curiosity", name: "Inquiry", description: "Ask powerful questions and pursue answers with determination", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "insight", domainId: "curiosity", name: "Insight", description: "Develop deep understanding through observation and reflection", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "lore", domainId: "curiosity", name: "Lore", description: "Accumulate knowledge through reading, study, and research", isSuggested: true, suggestedFor: "kid", defaultEssential: true },
  { id: "expression", domainId: "curiosity", name: "Expression", description: "Communicate ideas clearly through writing and speech", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Path of Craft
  { id: "creation", domainId: "craft", name: "Creation", description: "Bring new things into existence through imagination and effort", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "artistry", domainId: "craft", name: "Artistry", description: "Develop aesthetic skill in visual, musical, or performing arts", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "mastery", domainId: "craft", name: "Mastery", description: "Deepen expertise through deliberate practice and repetition", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "performance", domainId: "craft", name: "Performance", description: "Execute skills under pressure with confidence and flair", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "engineering", domainId: "craft", name: "Engineering", description: "Design and build systems, structures, and solutions", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Path of Contribution
  { id: "service", domainId: "contribution", name: "Service", description: "Strengthen the guild by helping others without expectation", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "order", domainId: "contribution", name: "Order", description: "Bring structure and cleanliness to shared spaces", isSuggested: true, suggestedFor: "kid", defaultEssential: true },
  { id: "reliability", domainId: "contribution", name: "Reliability", description: "Follow through on commitments and be someone others can count on", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "maintenance", domainId: "contribution", name: "Maintenance", description: "Keep systems, spaces, and responsibilities running smoothly", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "community", domainId: "contribution", name: "Community", description: "Build bonds and contribute to the greater good of the guild", isSuggested: true, suggestedFor: "guild", defaultEssential: false },

  // Path of Connection
  { id: "speechcraft", domainId: "connection", name: "Speechcraft", description: "Master the art of conversation, persuasion, and storytelling", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "empathy", domainId: "connection", name: "Empathy", description: "Understand and share the feelings of others deeply", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "compassion", domainId: "connection", name: "Compassion", description: "Act with kindness and warmth toward all guild members", isSuggested: true, suggestedFor: "all", defaultEssential: true },
  { id: "repair", domainId: "connection", name: "Repair", description: "Mend relationships through honest apology and reconnection", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "leadership", domainId: "connection", name: "Leadership", description: "Guide and inspire others through example and encouragement", isSuggested: true, suggestedFor: "parent", defaultEssential: false },

  // Path of Wealth
  { id: "commerce", domainId: "wealth", name: "Commerce", description: "Understand the flow of gold through earning and trading", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "provisioning", domainId: "wealth", name: "Provisioning", description: "Manage resources wisely to keep the guild well-supplied", isSuggested: true, suggestedFor: "parent", defaultEssential: false },
  { id: "strategy", domainId: "wealth", name: "Strategy", description: "Plan ahead and make decisions that compound over time", isSuggested: true, suggestedFor: "parent", defaultEssential: false },
  { id: "investment", domainId: "wealth", name: "Investment", description: "Grow wealth by planting seeds for the long game", isSuggested: true, suggestedFor: "parent", defaultEssential: false },
  { id: "administration", domainId: "wealth", name: "Administration", description: "Handle bills, paperwork, and financial responsibilities", isSuggested: true, suggestedFor: "parent", defaultEssential: true },

  // Path of Adventure
  { id: "exploration", domainId: "adventure", name: "Exploration", description: "Venture into the unknown and discover new territories", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
  { id: "recreation", domainId: "adventure", name: "Recreation", description: "Find joy and renewal through play and leisure", isSuggested: true, suggestedFor: "guild", defaultEssential: true },
  { id: "courage", domainId: "adventure", name: "Courage", description: "Face challenges and fears with bravery and determination", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "adaptation", domainId: "adventure", name: "Adaptation", description: "Thrive in changing circumstances and unfamiliar environments", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "discovery", domainId: "adventure", name: "Discovery", description: "Uncover hidden wonders in the world around you", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
];

// Active quest templates (mapped to new RPG skills)
export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "chloe-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "vitality",
    xpReward: 5,
    goldReward: 0,
    recurrenceType: "daily",
    timesPerDay: 2,
    active: true,
    importance: "essential",
    visibility: "active",
    autonomyLevel: "self_start",
    dueWindow: { start: "07:00", end: "21:00" },
    notifyIfIncomplete: true,
  },
  {
    id: "chloe-read",
    name: "Reading Time",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "lore",
    xpReward: 10,
    goldReward: 1,
    recurrenceType: "daily",
    timesPerDay: 1,
    active: true,
    importance: "growth",
    visibility: "active",
    autonomyLevel: "self_start",
  },
  {
    id: "chloe-shower",
    name: "Saturday Shower",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "vitality",
    xpReward: 15,
    goldReward: 2,
    recurrenceType: "weekly",
    daysOfWeek: [6],
    active: true,
    importance: "essential",
    visibility: "active",
    autonomyLevel: "prompt_ok",
  },
  {
    id: "ariasha-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "ariasha",
    skillId: "vitality",
    xpReward: 5,
    goldReward: 0,
    recurrenceType: "daily",
    timesPerDay: 2,
    active: true,
    importance: "essential",
    visibility: "active",
    autonomyLevel: "self_start",
    dueWindow: { start: "07:00", end: "21:00" },
    notifyIfIncomplete: true,
  },
  {
    id: "ariasha-read",
    name: "Reading Time",
    type: "recurring",
    assignedToId: "ariasha",
    skillId: "lore",
    xpReward: 10,
    goldReward: 1,
    recurrenceType: "daily",
    timesPerDay: 1,
    active: true,
    importance: "growth",
    visibility: "active",
    autonomyLevel: "self_start",
  },
];

// Suggested quest library — mapped to new RPG skills
export const SUGGESTED_QUEST_LIBRARY: QuestTemplate[] = [
  { id: "sug-deodorant", name: "Deodorant", type: "recurring", assignedToId: "", skillId: "vitality", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-water-bottle", name: "Fill Water Bottle", type: "recurring", assignedToId: "", skillId: "vitality", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-clear-table", name: "Clear Table After Meal", type: "recurring", assignedToId: "", skillId: "order", xpReward: 5, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-wipe-counters", name: "Wipe Counters", type: "recurring", assignedToId: "", skillId: "order", xpReward: 5, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-trash", name: "Take Out Trash", type: "recurring", assignedToId: "", skillId: "maintenance", xpReward: 10, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [1], active: false, importance: "essential", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-laundry", name: "Start Laundry Load", type: "recurring", assignedToId: "", skillId: "maintenance", xpReward: 10, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },
  { id: "sug-bathroom-sink", name: "Clean Bathroom Sink", type: "recurring", assignedToId: "", skillId: "order", xpReward: 8, goldReward: 1, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-room-reset", name: "Room Reset", type: "recurring", assignedToId: "", skillId: "order", xpReward: 10, goldReward: 2, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "essential", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-bills", name: "Pay Bills Check-in", type: "recurring", assignedToId: "", skillId: "administration", xpReward: 15, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [1], active: false, importance: "essential", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-budget", name: "Review Budget", type: "recurring", assignedToId: "", skillId: "strategy", xpReward: 15, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [0], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-money-meeting", name: "Family Money Meeting", type: "recurring", assignedToId: "", skillId: "strategy", xpReward: 20, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [0], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-hug", name: "Give a Hug", type: "recurring", assignedToId: "", skillId: "compassion", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-appreciation", name: "Appreciation Note", type: "recurring", assignedToId: "", skillId: "empathy", xpReward: 10, goldReward: 1, recurrenceType: "weekly", daysOfWeek: [3], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-game-night", name: "Family Game Night", type: "recurring", assignedToId: "", skillId: "recreation", xpReward: 20, goldReward: 3, recurrenceType: "weekly", daysOfWeek: [5], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-1on1", name: "1:1 Date (Parent/Child)", type: "recurring", assignedToId: "", skillId: "compassion", xpReward: 25, goldReward: 5, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-math", name: "Math Practice", type: "recurring", assignedToId: "", skillId: "inquiry", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },
  { id: "sug-piano", name: "Piano Practice", type: "recurring", assignedToId: "", skillId: "artistry", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-passion", name: "Passion Project Time", type: "recurring", assignedToId: "", skillId: "creation", xpReward: 15, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-writing", name: "Writing/Editing Block", type: "recurring", assignedToId: "", skillId: "expression", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },
  { id: "sug-nature-walk", name: "Nature Walk", type: "recurring", assignedToId: "", skillId: "exploration", xpReward: 15, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-local-explore", name: "Local Exploration", type: "recurring", assignedToId: "", skillId: "exploration", xpReward: 25, goldReward: 5, recurrenceType: "custom", intervalDays: 30, active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "disney-trip",
    name: "Disney Trip",
    description: "The ultimate family adventure to the magical kingdom!",
    status: "active",
  },
];

export const CAMPAIGN_STEPS: CampaignStep[] = [
  { id: "disney-1", campaignId: "disney-trip", order: 1, name: "Plan the Trip", assignedToId: "becky", skillId: "exploration", xpReward: 50, goldReward: 0, status: "available" },
  { id: "disney-2", campaignId: "disney-trip", order: 2, name: "Book Everything", assignedToId: "duane", skillId: "administration", xpReward: 75, goldReward: 0, status: "locked" },
  { id: "disney-3", campaignId: "disney-trip", order: 3, name: "Pack the Bags", assignedToId: "guild", skillId: "order", xpReward: 30, goldReward: 5, status: "locked" },
  { id: "disney-4", campaignId: "disney-trip", order: 4, name: "Travel Day", assignedToId: "guild", skillId: "courage", xpReward: 100, goldReward: 10, status: "locked" },
  { id: "disney-5", campaignId: "disney-trip", order: 5, name: "Park Day 1", assignedToId: "guild", skillId: "recreation", xpReward: 150, goldReward: 20, status: "locked" },
  { id: "disney-6", campaignId: "disney-trip", order: 6, name: "Park Day 2", assignedToId: "guild", skillId: "recreation", xpReward: 150, goldReward: 20, status: "locked" },
];

export const REWARDS: Reward[] = [
  { id: "treat-1", name: "Ice Cream Trip", description: "A visit to the ice cream shop", cost: 20, icon: "🍦" },
  { id: "treat-2", name: "Movie Night Pick", description: "Choose the family movie", cost: 15, icon: "🎬" },
  { id: "treat-3", name: "Extra Screen Time", description: "30 extra minutes of games", cost: 10, icon: "🎮" },
  { id: "treat-4", name: "Stay Up Late", description: "30 extra minutes before bed", cost: 25, icon: "🌙" },
  { id: "treat-5", name: "New Book", description: "Pick a new book to read", cost: 30, icon: "📖" },
  { id: "treat-6", name: "Craft Supplies", description: "New art or craft materials", cost: 35, icon: "🎨" },
];
