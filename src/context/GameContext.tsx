import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { GameState, QuestTemplate, Campaign, CampaignStep, Reward } from "@/types/game";
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
  | { type: "UPDATE_QUEST_TEMPLATE"; template: QuestTemplate }
  | { type: "DELETE_QUEST_TEMPLATE"; templateId: string }
  | { type: "ADD_CAMPAIGN"; campaign: Omit<Campaign, "id">; steps: Omit<CampaignStep, "id" | "campaignId">[] }
  | { type: "ADD_REWARD"; reward: Omit<Reward, "id"> }
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
      // Regenerate instances with new template
      return {
        ...newState,
        questInstances: generateQuestInstances(newState),
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
    case "RESET_GAME": {
      return resetGameState();
    }
    case "REGENERATE_INSTANCES": {
      // Set anchor date if not set
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
    // Generate instances on load
    const withAnchor = {
      ...loaded,
      customIntervalAnchor: loaded.customIntervalAnchor ?? formatDate(new Date()),
    };
    return {
      ...withAnchor,
      questInstances: generateQuestInstances(withAnchor),
    };
  });

  // Save to localStorage on every state change
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
