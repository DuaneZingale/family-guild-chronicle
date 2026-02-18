import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { UnifiedQuest, QuestLog, QuestType, FrequencyType, RitualBlock } from "@/types/unified-quests";

export function useUnifiedQuests() {
  const { membership } = useAuth();
  const familyId = membership?.familyId;

  return useQuery({
    queryKey: ["unified-quests", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("unified_quests")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as UnifiedQuest[];
    },
    enabled: !!familyId,
  });
}

export function useQuestLogs(questId?: string, characterId?: string, date?: string) {
  const { membership } = useAuth();
  const familyId = membership?.familyId;

  return useQuery({
    queryKey: ["quest-logs", familyId, questId, characterId, date],
    queryFn: async () => {
      if (!familyId) return [];
      let query = supabase
        .from("quest_logs")
        .select("*")
        .eq("family_id", familyId);
      if (questId) query = query.eq("quest_id", questId);
      if (characterId) query = query.eq("character_id", characterId);
      if (date) query = query.eq("due_date", date);
      const { data, error } = await query.order("completed_at", { ascending: false });
      if (error) throw error;
      return data as QuestLog[];
    },
    enabled: !!familyId,
  });
}

export function useTodayQuestLogs(characterId?: string) {
  const today = new Date().toISOString().split("T")[0];
  return useQuestLogs(undefined, characterId, today);
}

export function useCreateQuest() {
  const queryClient = useQueryClient();
  const { membership } = useAuth();

  return useMutation({
    mutationFn: async (quest: Omit<UnifiedQuest, "id" | "family_id" | "created_at" | "streak_count" | "last_completed_at">) => {
      if (!membership?.familyId) throw new Error("No family");
      const { data, error } = await supabase
        .from("unified_quests")
        .insert({ ...quest, family_id: membership.familyId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-quests"] });
    },
  });
}

export function useUpdateQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UnifiedQuest> & { id: string }) => {
      const { data, error } = await supabase
        .from("unified_quests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-quests"] });
    },
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();
  const { membership } = useAuth();

  return useMutation({
    mutationFn: async ({
      quest,
      characterId,
      slot = 1,
    }: {
      quest: UnifiedQuest;
      characterId: string;
      slot?: number;
    }) => {
      if (!membership?.familyId) throw new Error("No family");
      const today = new Date().toISOString().split("T")[0];

      // Insert quest log
      const { error: logError } = await supabase.from("quest_logs").insert({
        family_id: membership.familyId,
        quest_id: quest.id,
        character_id: characterId,
        due_date: today,
        slot,
        ritual_block: quest.ritual_block,
        xp_earned: quest.xp_reward,
        gold_earned: quest.gold_reward,
        streak_at_completion: quest.streak_count + 1,
      });
      if (logError) throw logError;

      // Update streak on the quest
      const { error: updateError } = await supabase
        .from("unified_quests")
        .update({
          streak_count: quest.streak_count + 1,
          last_completed_at: new Date().toISOString(),
        })
        .eq("id", quest.id);
      if (updateError) throw updateError;

      // Award XP + gold to character
      if (quest.xp_reward > 0 || quest.gold_reward > 0) {
        await supabase.from("xp_events").insert({
          family_id: membership.familyId,
          character_id: characterId,
          character_skill_id: quest.character_skill_id,
          xp: quest.xp_reward,
          gold: quest.gold_reward,
          source: quest.quest_type === "campaign_step" ? "campaign" : "quest",
          note: `Completed: ${quest.name}`,
        });

        // Update character gold
        const { data: char } = await supabase
          .from("characters")
          .select("gold")
          .eq("id", characterId)
          .single();
        if (char) {
          await supabase
            .from("characters")
            .update({ gold: char.gold + quest.gold_reward })
            .eq("id", characterId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-quests"] });
      queryClient.invalidateQueries({ queryKey: ["quest-logs"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

// Helper: filter quests by type and character
export function filterQuests(
  quests: UnifiedQuest[],
  opts: {
    type?: QuestType;
    characterId?: string;
    ritualBlock?: RitualBlock;
    activeOnly?: boolean;
    campaignId?: string;
  }
): UnifiedQuest[] {
  return quests.filter((q) => {
    if (opts.type && q.quest_type !== opts.type) return false;
    if (opts.characterId && q.assigned_to_character_id !== opts.characterId) return false;
    if (opts.ritualBlock && q.ritual_block !== opts.ritualBlock) return false;
    if (opts.activeOnly && !q.active) return false;
    if (opts.campaignId && q.campaign_id !== opts.campaignId) return false;
    return true;
  });
}

// Helper: check if a training quest is completed today
export function isCompletedToday(quest: UnifiedQuest, logs: QuestLog[]): boolean {
  const today = new Date().toISOString().split("T")[0];
  return logs.some((l) => l.quest_id === quest.id && l.due_date === today);
}

// Helper: get completion count for today
export function todayCompletionCount(quest: UnifiedQuest, logs: QuestLog[]): number {
  const today = new Date().toISOString().split("T")[0];
  return logs.filter((l) => l.quest_id === quest.id && l.due_date === today).length;
}
