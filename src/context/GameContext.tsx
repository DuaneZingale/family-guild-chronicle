import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { GameState, QuestTemplate, Campaign, CampaignStep, Reward, Character } from "@/types/game";
import { loadGameState, saveGameState, resetGameState } from "@/lib/storage";
import {
  generateQuestInstances,
  completeQuest,
  addManualXP,
  completeCampaignStep,
  spendGold,
  generateId,
  formatDate,
} from "@/lib/gameLogic";

type GameAction =
  | { type: "COMPLETE_QUEST"; instanceId: string }
  | { type: "ADD_XP"; characterId: string; skillId: string; xp: number; gold?: number; note?: string }
  | { type: "COMPLETE_CAMPAIGN_STEP"; stepId: string }
  | { type: "SPEND_GOLD"; characterId: string; amount: number; note: string }
  | { type: "ADD_QUEST_TEMPLATE"; template: Omit<QuestTemplate, "id"> }
  | { type: "ADD_ONEOFF_TASK"; template: Omit<QuestTemplate, "id">; dueDate: string }
  | { type: "UPDATE_QUEST_TEMPLATE"; template: QuestTemplate }
  | { type: "DELETE_QUEST_TEMPLATE"; templateId: string }
  | { type: "ACTIVATE_SUGGESTED_QUEST"; template: Omit<QuestTemplate, "id">; assignedToId: string }
  | { type: "ADD_CAMPAIGN"; campaign: Omit<Campaign, "id">; steps: Omit<CampaignStep, "id" | "campaignId">[] }
  | { type: "ADD_CAMPAIGN_STEP"; campaignId: string; step: Omit<CampaignStep, "id" | "campaignId" | "status"> }
  | { type: "ADD_REWARD"; reward: Omit<Reward, "id"> }
  | { type: "ADD_CHARACTER"; character: Omit<Character, "id"> }
  | { type: "UPDATE_CHARACTER"; character: Character }
  | { type: "DELETE_CHARACTER"; characterId: string }
  | { type: "ENTER_KID_MODE"; characterId: string }
  | { type: "EXIT_KID_MODE" }
  | { type: "RESET_GAME" }
  | { type: "REGENERATE_INSTANCES" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "COMPLETE_QUEST": {
      const { updatedState } = completeQuest(state, action.instanceId);
      return updatedState;
    }
    case "ADD_XP": {
      return addManualXP(state, action.characterId, action.skillId, action.xp, action.gold ?? 0, action.note);
    }
    case "COMPLETE_CAMPAIGN_STEP": {
      return completeCampaignStep(state, action.stepId);
    }
    case "SPEND_GOLD": {
      return spendGold(state, action.characterId, action.amount, action.note) ?? state;
    }
    case "ADD_QUEST_TEMPLATE": {
      const newTemplate: QuestTemplate = {
        ...action.template,
        id: generateId(),
      };
      const newState = {
        ...state,
        questTemplates: [...state.questTemplates, newTemplate],
      };
      return {
        ...newState,
        questInstances: generateQuestInstances(newState),
      };
    }
    case "ADD_ONEOFF_TASK": {
      const templateId = generateId();
      const newTemplate: QuestTemplate = {
        ...action.template,
        id: templateId,
      };
      const newInstance = {
        id: generateId(),
        templateId,
        dueDate: action.dueDate,
        status: "available" as const,
      };
      return {
        ...state,
        questTemplates: [...state.questTemplates, newTemplate],
        questInstances: [...state.questInstances, newInstance],
      };
    }
    case "UPDATE_QUEST_TEMPLATE": {
      const newState = {
        ...state,
        questTemplates: state.questTemplates.map((t) =>
          t.id === action.template.id ? action.template : t
        ),
      };
      return {
        ...newState,
        questInstances: generateQuestInstances(newState),
      };
    }
    case "DELETE_QUEST_TEMPLATE": {
      return {
        ...state,
        questTemplates: state.questTemplates.filter((t) => t.id !== action.templateId),
        questInstances: state.questInstances.filter((i) => i.templateId !== action.templateId),
      };
    }
    case "ACTIVATE_SUGGESTED_QUEST": {
      const newTemplate: QuestTemplate = {
        ...action.template,
        id: generateId(),
        assignedToId: action.assignedToId,
        visibility: "active",
        active: true,
      };
      const newState = {
        ...state,
        questTemplates: [...state.questTemplates, newTemplate],
      };
      return {
        ...newState,
        questInstances: generateQuestInstances(newState),
      };
    }
    case "ADD_CAMPAIGN": {
      const campaignId = generateId();
      const newCampaign: Campaign = {
        ...action.campaign,
        id: campaignId,
      };
      const newSteps: CampaignStep[] = action.steps.map((step, index) => ({
        ...step,
        id: generateId(),
        campaignId,
        status: index === 0 ? "available" : "locked",
      }));
      return {
        ...state,
        campaigns: [...state.campaigns, newCampaign],
        campaignSteps: [...state.campaignSteps, ...newSteps],
      };
    }
    case "ADD_CAMPAIGN_STEP": {
      const existingSteps = state.campaignSteps.filter((s) => s.campaignId === action.campaignId);
      const allDone = existingSteps.every((s) => s.status === "done");
      const newStep: CampaignStep = {
        ...action.step,
        id: generateId(),
        campaignId: action.campaignId,
        status: allDone ? "available" : "locked",
      };
      return {
        ...state,
        campaignSteps: [...state.campaignSteps, newStep],
      };
    }
    case "ADD_REWARD": {
      const newReward: Reward = {
        ...action.reward,
        id: generateId(),
      };
      return {
        ...state,
        rewards: [...state.rewards, newReward],
      };
    }
    case "ADD_CHARACTER": {
      const newChar: Character = {
        ...action.character,
        id: generateId(),
      };
      return { ...state, characters: [...state.characters, newChar] };
    }
    case "UPDATE_CHARACTER": {
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.character.id ? action.character : c
        ),
      };
    }
    case "DELETE_CHARACTER": {
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.characterId),
        questTemplates: state.questTemplates.filter((t) => t.assignedToId !== action.characterId),
        questInstances: state.questInstances.filter((qi) => {
          const tpl = state.questTemplates.find((t) => t.id === qi.templateId);
          return tpl?.assignedToId !== action.characterId;
        }),
      };
    }
    case "ENTER_KID_MODE": {
      return { ...state, kidModeCharacterId: action.characterId };
    }
    case "EXIT_KID_MODE": {
      return { ...state, kidModeCharacterId: undefined };
    }
    case "RESET_GAME": {
      return resetGameState();
    }
    case "REGENERATE_INSTANCES": {
      const anchor = state.customIntervalAnchor ?? formatDate(new Date());
      const stateWithAnchor = { ...state, customIntervalAnchor: anchor };
      return {
        ...stateWithAnchor,
        questInstances: generateQuestInstances(stateWithAnchor),
      };
    }
    default:
      return state;
  }
}

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => {
    const loaded = loadGameState();
    const withAnchor = {
      ...loaded,
      customIntervalAnchor: loaded.customIntervalAnchor ?? formatDate(new Date()),
    };
    return {
      ...withAnchor,
      questInstances: generateQuestInstances(withAnchor),
    };
  });

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
