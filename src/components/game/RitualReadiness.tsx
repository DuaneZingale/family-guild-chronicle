import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { RitualBlock } from "@/types/unified-quests";
import { RITUAL_BLOCK_CONFIG } from "@/types/unified-quests";
import { Flame } from "lucide-react";

type MemberStatus = {
  characterId: string;
  name: string;
  avatarEmoji: string;
  blocks: Record<RitualBlock, { total: number; done: number }>;
  maxStreak: number;
};

export function RitualReadiness() {
  const { membership } = useAuth();
  const familyId = membership?.familyId;
  const today = new Date().toISOString().split("T")[0];

  const { data: memberStatuses, isLoading } = useQuery({
    queryKey: ["ritual-readiness", familyId, today],
    queryFn: async (): Promise<MemberStatus[]> => {
      if (!familyId) return [];

      // Fetch characters, training quests, and today's logs in parallel
      const [charsRes, questsRes, logsRes] = await Promise.all([
        supabase
          .from("characters")
          .select("id, name, avatar_emoji")
          .eq("family_id", familyId),
        supabase
          .from("unified_quests")
          .select("id, assigned_to_character_id, ritual_block, streak_count")
          .eq("family_id", familyId)
          .eq("quest_type", "training")
          .eq("active", true),
        supabase
          .from("quest_logs")
          .select("quest_id, character_id")
          .eq("family_id", familyId)
          .eq("due_date", today),
      ]);

      const characters = charsRes.data ?? [];
      const quests = questsRes.data ?? [];
      const logs = logsRes.data ?? [];

      return characters.map((char) => {
        const charQuests = quests.filter((q) => q.assigned_to_character_id === char.id);
        const charLogs = logs.filter((l) => l.character_id === char.id);
        const completedQuestIds = new Set(charLogs.map((l) => l.quest_id));

        const blocks: Record<RitualBlock, { total: number; done: number }> = {
          morning: { total: 0, done: 0 },
          afternoon: { total: 0, done: 0 },
          evening: { total: 0, done: 0 },
        };

        let maxStreak = 0;

        for (const q of charQuests) {
          const block = q.ritual_block as RitualBlock;
          if (block && blocks[block]) {
            blocks[block].total++;
            if (completedQuestIds.has(q.id)) {
              blocks[block].done++;
            }
          }
          if (q.streak_count > maxStreak) maxStreak = q.streak_count;
        }

        return {
          characterId: char.id,
          name: char.name,
          avatarEmoji: char.avatar_emoji,
          blocks,
          maxStreak,
        };
      });
    },
    enabled: !!familyId,
  });

  if (isLoading) {
    return (
      <div className="parchment-panel p-4 text-center">
        <span className="animate-pulse text-xl">⏳</span>
      </div>
    );
  }

  // Filter to only members with training quests
  const activeMembers = (memberStatuses ?? []).filter(
    (m) => m.blocks.morning.total + m.blocks.afternoon.total + m.blocks.evening.total > 0
  );

  if (activeMembers.length === 0) return null;

  return (
    <section>
      <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
        <span>🛡️</span> Ritual Readiness
      </h2>
      <div className="parchment-panel overflow-hidden">
        <div className="divide-y divide-border">
          {activeMembers.map((member) => (
            <div key={member.characterId} className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl">{member.avatarEmoji}</span>
              <span className="font-semibold text-sm min-w-[5rem] truncate">{member.name}</span>

              <div className="flex items-center gap-3 flex-1 justify-center">
                {(["morning", "afternoon", "evening"] as RitualBlock[]).map((block) => {
                  const { total, done } = member.blocks[block];
                  if (total === 0) return null;
                  const status = done === total ? "complete" : done > 0 ? "partial" : "missed";
                  const statusIcon = status === "complete" ? "✅" : status === "partial" ? "🌓" : "❌";
                  return (
                    <span
                      key={block}
                      className="flex items-center gap-1 text-sm"
                      title={`${RITUAL_BLOCK_CONFIG[block].label}: ${done}/${total}`}
                    >
                      <span>{RITUAL_BLOCK_CONFIG[block].icon}</span>
                      <span>{statusIcon}</span>
                    </span>
                  );
                })}
              </div>

              {member.maxStreak > 0 && (
                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-accent text-accent-foreground rounded shrink-0">
                  <Flame className="h-3 w-3" /> {member.maxStreak}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
