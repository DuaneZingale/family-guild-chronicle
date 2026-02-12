import type { Domain, Character, Skill, QuestTemplate, Campaign, CampaignStep, Reward } from "@/types/game";

// DO NOT create new domains dynamically. These 7 are canon.

export const DOMAINS: Domain[] = [
  { id: "care", name: "Care", icon: "❤️", description: "Body + nervous system wellbeing" },
  { id: "curiosity", name: "Curiosity", icon: "🔍", description: "Explore, ask, learn, try new things" },
  { id: "craft", name: "Craft", icon: "🎨", description: "Build skills, create, practice, master" },
  { id: "contribution", name: "Contribution", icon: "🏠", description: "Help the household, take responsibility" },
  { id: "connection", name: "Connection", icon: "💕", description: "Love, relate, bond, celebrate others" },
  { id: "wealth", name: "Wealth", icon: "💰", description: "Money habits, resources, planning" },
  { id: "adventure", name: "Adventure", icon: "⚔️", description: "Experiences, memories, story moments" },
];

export const CHARACTERS: Character[] = [
  { id: "duane", name: "Duane", roleClass: "Builder", isKid: false, avatarEmoji: "🧙‍♂️", gold: 0 },
  { id: "becky", name: "Becky", roleClass: "Hearthkeeper", isKid: false, avatarEmoji: "🧝‍♀️", gold: 0 },
  { id: "chloe", name: "Chloe", roleClass: "Scribe", isKid: true, avatarEmoji: "📜", gold: 0 },
  { id: "ariasha", name: "Ariasha", roleClass: "Ranger", isKid: true, avatarEmoji: "🏹", gold: 0 },
  { id: "guild", name: "The Guild", roleClass: "Shared", isKid: false, avatarEmoji: "🏰", gold: 0 },
];

// Shared skill definitions — no ownerId, XP tracked per character via XPEvents
export const SKILLS: Skill[] = [
  // Care
  { id: "hygiene", domainId: "care", name: "Hygiene", description: "Feel fresh and confident", isSuggested: true, suggestedFor: "kid", defaultEssential: true },
  { id: "sleep", domainId: "care", name: "Sleep", description: "Better mood + focus", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "movement", domainId: "care", name: "Movement", description: "Strong body, calmer brain", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "nervous_system", domainId: "care", name: "Nervous System Care", description: "Regulate, recover, reset", isSuggested: true, suggestedFor: "parent", defaultEssential: false },
  { id: "nutrition", domainId: "care", name: "Nutrition", description: "Fuel for energy", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Curiosity
  { id: "reading", domainId: "curiosity", name: "Reading", description: "Ideas unlock worlds", isSuggested: true, suggestedFor: "kid", defaultEssential: true },
  { id: "questions", domainId: "curiosity", name: "Asking Questions", description: "Curiosity grows courage", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "research", domainId: "curiosity", name: "Research", description: "Find answers independently", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "nature_observe", domainId: "curiosity", name: "Nature Observation", description: "Wonder is everywhere", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "language", domainId: "curiosity", name: "Language/Words", description: "Communicate clearly", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Craft
  { id: "writing", domainId: "craft", name: "Writing", description: "Create stories + clarity", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "art_make", domainId: "craft", name: "Making/Art", description: "Build confidence through creation", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "building", domainId: "craft", name: "Building", description: "Hands-on competence", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "music", domainId: "craft", name: "Music", description: "Practice and expression", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "ai_mastery", domainId: "craft", name: "AI Mastery", description: "Modern tool literacy", isSuggested: true, suggestedFor: "parent", defaultEssential: false },

  // Contribution
  { id: "room_reset", domainId: "contribution", name: "Room Reset", description: "Calm space, calm mind", isSuggested: true, suggestedFor: "kid", defaultEssential: true },
  { id: "dishes", domainId: "contribution", name: "Dishes/Kitchen", description: "Shared load = shared peace", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "trash", domainId: "contribution", name: "Trash", description: "Prevent chaos", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "laundry", domainId: "contribution", name: "Laundry", description: "Responsibility reps", isSuggested: true, suggestedFor: "kid", defaultEssential: false },
  { id: "clean_surfaces", domainId: "contribution", name: "Counters & Surfaces", description: "Quick wins reduce stress", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "bathroom_clean", domainId: "contribution", name: "Bathroom Basics", description: "Health + pride", isSuggested: true, suggestedFor: "all", defaultEssential: false },

  // Connection
  { id: "appreciation", domainId: "connection", name: "Appreciation", description: "People bloom when seen", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "kindness", domainId: "connection", name: "Kindness", description: "Compassion as a habit", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "quality_time", domainId: "connection", name: "Quality Time", description: "Build secure attachment", isSuggested: true, suggestedFor: "guild", defaultEssential: true },
  { id: "repair", domainId: "connection", name: "Repair & Apology", description: "We can reconnect after rupture", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "affection", domainId: "connection", name: "Affection", description: "Warmth + closeness", isSuggested: true, suggestedFor: "parent", defaultEssential: false },

  // Wealth
  { id: "bills", domainId: "wealth", name: "Bills & Admin", description: "Stability reduces stress", isSuggested: true, suggestedFor: "parent", defaultEssential: true },
  { id: "budgeting", domainId: "wealth", name: "Budgeting", description: "Reality-based freedom", isSuggested: true, suggestedFor: "parent", defaultEssential: false },
  { id: "saving", domainId: "wealth", name: "Saving", description: "Future confidence", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "earning", domainId: "wealth", name: "Earning", description: "Build capability", isSuggested: true, suggestedFor: "all", defaultEssential: false },
  { id: "investing", domainId: "wealth", name: "Investing", description: "Long game thinking", isSuggested: true, suggestedFor: "parent", defaultEssential: false },

  // Adventure
  { id: "outdoors", domainId: "adventure", name: "Outdoors", description: "Wonder + resilience", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
  { id: "travel", domainId: "adventure", name: "Travel Days", description: "Story arcs matter", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
  { id: "local_explore", domainId: "adventure", name: "Local Explore", description: "Adventures nearby", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
  { id: "festivals", domainId: "adventure", name: "Events & Culture", description: "Shared memories", isSuggested: true, suggestedFor: "guild", defaultEssential: false },
  { id: "play", domainId: "adventure", name: "Play", description: "Joy is a growth skill", isSuggested: true, suggestedFor: "guild", defaultEssential: true },
];

// Active quest templates (from old seed, mapped to new skills)
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Chloe's routines
  {
    id: "chloe-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "hygiene",
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
    skillId: "reading",
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
    skillId: "hygiene",
    xpReward: 15,
    goldReward: 2,
    recurrenceType: "weekly",
    daysOfWeek: [6],
    active: true,
    importance: "essential",
    visibility: "active",
    autonomyLevel: "prompt_ok",
  },

  // Ariasha's routines
  {
    id: "ariasha-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "ariasha",
    skillId: "hygiene",
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
    skillId: "reading",
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

// Suggested quest library — browsable, one-click activate
export const SUGGESTED_QUEST_LIBRARY: QuestTemplate[] = [
  // Care / Hygiene
  { id: "sug-deodorant", name: "Deodorant", type: "recurring", assignedToId: "", skillId: "hygiene", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-water-bottle", name: "Fill Water Bottle", type: "recurring", assignedToId: "", skillId: "nutrition", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },

  // Contribution
  { id: "sug-clear-table", name: "Clear Table After Meal", type: "recurring", assignedToId: "", skillId: "dishes", xpReward: 5, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-wipe-counters", name: "Wipe Counters", type: "recurring", assignedToId: "", skillId: "clean_surfaces", xpReward: 5, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-trash", name: "Take Out Trash", type: "recurring", assignedToId: "", skillId: "trash", xpReward: 10, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [1], active: false, importance: "essential", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-laundry", name: "Start Laundry Load", type: "recurring", assignedToId: "", skillId: "laundry", xpReward: 10, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },
  { id: "sug-bathroom-sink", name: "Clean Bathroom Sink", type: "recurring", assignedToId: "", skillId: "bathroom_clean", xpReward: 8, goldReward: 1, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-room-reset", name: "Room Reset", type: "recurring", assignedToId: "", skillId: "room_reset", xpReward: 10, goldReward: 2, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "essential", visibility: "suggested", autonomyLevel: "self_start" },

  // Wealth
  { id: "sug-bills", name: "Pay Bills Check-in", type: "recurring", assignedToId: "", skillId: "bills", xpReward: 15, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [1], active: false, importance: "essential", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-budget", name: "Review Budget", type: "recurring", assignedToId: "", skillId: "budgeting", xpReward: 15, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [0], active: false, importance: "growth", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-money-meeting", name: "Family Money Meeting", type: "recurring", assignedToId: "", skillId: "budgeting", xpReward: 20, goldReward: 0, recurrenceType: "weekly", daysOfWeek: [0], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },

  // Connection
  { id: "sug-hug", name: "Give a Hug", type: "recurring", assignedToId: "", skillId: "affection", xpReward: 3, goldReward: 0, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-appreciation", name: "Appreciation Note", type: "recurring", assignedToId: "", skillId: "appreciation", xpReward: 10, goldReward: 1, recurrenceType: "weekly", daysOfWeek: [3], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-game-night", name: "Family Game Night", type: "recurring", assignedToId: "", skillId: "quality_time", xpReward: 20, goldReward: 3, recurrenceType: "weekly", daysOfWeek: [5], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-1on1", name: "1:1 Date (Parent/Child)", type: "recurring", assignedToId: "", skillId: "quality_time", xpReward: 25, goldReward: 5, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },

  // Curiosity / Craft
  { id: "sug-math", name: "Math Practice", type: "recurring", assignedToId: "", skillId: "research", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },
  { id: "sug-piano", name: "Piano Practice", type: "recurring", assignedToId: "", skillId: "music", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-passion", name: "Passion Project Time", type: "recurring", assignedToId: "", skillId: "building", xpReward: 15, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "self_start" },
  { id: "sug-writing", name: "Writing/Editing Block", type: "recurring", assignedToId: "", skillId: "writing", xpReward: 10, goldReward: 1, recurrenceType: "daily", timesPerDay: 1, active: false, importance: "growth", visibility: "suggested", autonomyLevel: "prompt_ok" },

  // Adventure
  { id: "sug-nature-walk", name: "Nature Walk", type: "recurring", assignedToId: "", skillId: "outdoors", xpReward: 15, goldReward: 2, recurrenceType: "weekly", daysOfWeek: [6], active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
  { id: "sug-local-explore", name: "Local Exploration", type: "recurring", assignedToId: "", skillId: "local_explore", xpReward: 25, goldReward: 5, recurrenceType: "custom", intervalDays: 30, active: false, importance: "delight", visibility: "suggested", autonomyLevel: "parent_led" },
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
  { id: "disney-1", campaignId: "disney-trip", order: 1, name: "Plan the Trip", assignedToId: "becky", skillId: "outdoors", xpReward: 50, goldReward: 0, status: "available" },
  { id: "disney-2", campaignId: "disney-trip", order: 2, name: "Book Everything", assignedToId: "duane", skillId: "bills", xpReward: 75, goldReward: 0, status: "locked" },
  { id: "disney-3", campaignId: "disney-trip", order: 3, name: "Pack the Bags", assignedToId: "guild", skillId: "room_reset", xpReward: 30, goldReward: 5, status: "locked" },
  { id: "disney-4", campaignId: "disney-trip", order: 4, name: "Travel Day", assignedToId: "guild", skillId: "travel", xpReward: 100, goldReward: 10, status: "locked" },
  { id: "disney-5", campaignId: "disney-trip", order: 5, name: "Park Day 1", assignedToId: "guild", skillId: "play", xpReward: 150, goldReward: 20, status: "locked" },
  { id: "disney-6", campaignId: "disney-trip", order: 6, name: "Park Day 2", assignedToId: "guild", skillId: "play", xpReward: 150, goldReward: 20, status: "locked" },
];

export const REWARDS: Reward[] = [
  { id: "treat-1", name: "Ice Cream Trip", description: "A visit to the ice cream shop", cost: 20, icon: "🍦" },
  { id: "treat-2", name: "Movie Night Pick", description: "Choose the family movie", cost: 15, icon: "🎬" },
  { id: "treat-3", name: "Extra Screen Time", description: "30 extra minutes of games", cost: 10, icon: "🎮" },
  { id: "treat-4", name: "Stay Up Late", description: "30 extra minutes before bed", cost: 25, icon: "🌙" },
  { id: "treat-5", name: "New Book", description: "Pick a new book to read", cost: 30, icon: "📖" },
  { id: "treat-6", name: "Craft Supplies", description: "New art or craft materials", cost: 35, icon: "🎨" },
];
