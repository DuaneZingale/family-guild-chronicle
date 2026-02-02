import type { Domain, Character, Skill, QuestTemplate, Campaign, CampaignStep, Reward } from "@/types/game";

// DO NOT create new domains/skills dynamically. Only use seed data or explicit user-created ones.

export const DOMAINS: Domain[] = [
  { id: "health", name: "Health", icon: "❤️", description: "Physical wellness and self-care" },
  { id: "learning", name: "Learning", icon: "📚", description: "Knowledge and education" },
  { id: "stewardship", name: "Stewardship", icon: "🏠", description: "Home and responsibility" },
  { id: "wealth", name: "Wealth", icon: "💰", description: "Financial wisdom" },
  { id: "bond", name: "Bond", icon: "💕", description: "Family connection and love" },
  { id: "craft", name: "Craft", icon: "🎨", description: "Creative projects and making" },
  { id: "adventure", name: "Adventure", icon: "⚔️", description: "Exploration and new experiences" },
];

export const CHARACTERS: Character[] = [
  { id: "duane", name: "Duane", roleClass: "Builder", isKid: false, avatarEmoji: "🧙‍♂️", gold: 0 },
  { id: "becky", name: "Becky", roleClass: "Hearthkeeper", isKid: false, avatarEmoji: "🧝‍♀️", gold: 0 },
  { id: "chloe", name: "Chloe", roleClass: "Scribe", isKid: true, avatarEmoji: "📜", gold: 0 },
  { id: "ariasha", name: "Ariasha", roleClass: "Ranger", isKid: true, avatarEmoji: "🏹", gold: 0 },
  { id: "guild", name: "The Guild", roleClass: "Shared", isKid: false, avatarEmoji: "🏰", gold: 0 },
];

export const SKILLS: Skill[] = [
  // Chloe's skills
  { id: "chloe-hygiene", domainId: "health", ownerId: "chloe", name: "Hygiene", description: "Personal cleanliness and care" },
  { id: "chloe-reading", domainId: "learning", ownerId: "chloe", name: "Reading", description: "Books and comprehension" },
  { id: "chloe-math", domainId: "learning", ownerId: "chloe", name: "Math", description: "Numbers and problem solving" },
  { id: "chloe-writing", domainId: "learning", ownerId: "chloe", name: "Writing", description: "Expression through words" },
  
  // Ariasha's skills
  { id: "ariasha-hygiene", domainId: "health", ownerId: "ariasha", name: "Hygiene", description: "Personal cleanliness and care" },
  { id: "ariasha-reading", domainId: "learning", ownerId: "ariasha", name: "Reading", description: "Books and comprehension" },
  { id: "ariasha-math", domainId: "learning", ownerId: "ariasha", name: "Math", description: "Numbers and problem solving" },
  { id: "ariasha-creative", domainId: "craft", ownerId: "ariasha", name: "Creative Projects", description: "Making and crafting" },
  
  // Duane's skills
  { id: "duane-ai", domainId: "learning", ownerId: "duane", name: "AI Mastery", description: "Understanding and leveraging AI" },
  { id: "duane-sales", domainId: "wealth", ownerId: "duane", name: "Sales Outreach", description: "Connecting with customers" },
  { id: "duane-funnels", domainId: "wealth", ownerId: "duane", name: "Funnel Building", description: "Marketing systems" },
  { id: "duane-money", domainId: "wealth", ownerId: "duane", name: "Money Stewardship", description: "Financial management" },
  { id: "duane-nervous", domainId: "health", ownerId: "duane", name: "Nervous System Care", description: "Stress and wellness" },
  
  // Becky's skills
  { id: "becky-home", domainId: "stewardship", ownerId: "becky", name: "Home Reset", description: "Keeping the hearth tidy" },
  { id: "becky-words", domainId: "bond", ownerId: "becky", name: "Appreciation Words", description: "Speaking love and gratitude" },
  { id: "becky-affection", domainId: "bond", ownerId: "becky", name: "Affection Warmth", description: "Physical and emotional warmth" },
  { id: "becky-money", domainId: "wealth", ownerId: "becky", name: "Money Stewardship", description: "Financial management" },
  
  // Guild skills
  { id: "guild-bond", domainId: "bond", ownerId: "guild", name: "Family Bond Time", description: "Quality time together" },
  { id: "guild-stability", domainId: "stewardship", ownerId: "guild", name: "Household Stability", description: "Running a smooth home" },
  { id: "guild-adventure", domainId: "adventure", ownerId: "guild", name: "Adventure Time", description: "Exploring the world together" },
];

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Chloe's routines
  {
    id: "chloe-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "chloe-hygiene",
    xpReward: 5,
    goldReward: 0,
    recurrenceType: "daily",
    timesPerDay: 2,
    active: true,
  },
  {
    id: "chloe-read",
    name: "Reading Time",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "chloe-reading",
    xpReward: 10,
    goldReward: 1,
    recurrenceType: "daily",
    timesPerDay: 1,
    active: true,
  },
  {
    id: "chloe-shower",
    name: "Saturday Shower",
    type: "recurring",
    assignedToId: "chloe",
    skillId: "chloe-hygiene",
    xpReward: 15,
    goldReward: 2,
    recurrenceType: "weekly",
    daysOfWeek: [6],
    active: true,
  },
  
  // Ariasha's routines
  {
    id: "ariasha-teeth",
    name: "Brush Teeth",
    type: "recurring",
    assignedToId: "ariasha",
    skillId: "ariasha-hygiene",
    xpReward: 5,
    goldReward: 0,
    recurrenceType: "daily",
    timesPerDay: 2,
    active: true,
  },
  {
    id: "ariasha-read",
    name: "Reading Time",
    type: "recurring",
    assignedToId: "ariasha",
    skillId: "ariasha-reading",
    xpReward: 10,
    goldReward: 1,
    recurrenceType: "daily",
    timesPerDay: 1,
    active: true,
  },
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
  { id: "disney-1", campaignId: "disney-trip", order: 1, name: "Plan the Trip", assignedToId: "becky", skillId: "guild-adventure", xpReward: 50, goldReward: 0, status: "available" },
  { id: "disney-2", campaignId: "disney-trip", order: 2, name: "Book Everything", assignedToId: "duane", skillId: "duane-money", xpReward: 75, goldReward: 0, status: "locked" },
  { id: "disney-3", campaignId: "disney-trip", order: 3, name: "Pack the Bags", assignedToId: "guild", skillId: "guild-stability", xpReward: 30, goldReward: 5, status: "locked" },
  { id: "disney-4", campaignId: "disney-trip", order: 4, name: "Travel Day", assignedToId: "guild", skillId: "guild-adventure", xpReward: 100, goldReward: 10, status: "locked" },
  { id: "disney-5", campaignId: "disney-trip", order: 5, name: "Park Day 1", assignedToId: "guild", skillId: "guild-adventure", xpReward: 150, goldReward: 20, status: "locked" },
  { id: "disney-6", campaignId: "disney-trip", order: 6, name: "Park Day 2", assignedToId: "guild", skillId: "guild-adventure", xpReward: 150, goldReward: 20, status: "locked" },
];

export const REWARDS: Reward[] = [
  { id: "treat-1", name: "Ice Cream Trip", description: "A visit to the ice cream shop", cost: 20, icon: "🍦" },
  { id: "treat-2", name: "Movie Night Pick", description: "Choose the family movie", cost: 15, icon: "🎬" },
  { id: "treat-3", name: "Extra Screen Time", description: "30 extra minutes of games", cost: 10, icon: "🎮" },
  { id: "treat-4", name: "Stay Up Late", description: "30 extra minutes before bed", cost: 25, icon: "🌙" },
  { id: "treat-5", name: "New Book", description: "Pick a new book to read", cost: 30, icon: "📖" },
  { id: "treat-6", name: "Craft Supplies", description: "New art or craft materials", cost: 35, icon: "🎨" },
];
