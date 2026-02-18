import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Flame, Trophy, Star, Zap } from "lucide-react";

interface CharacterStats {
  id: string;
  name: string;
  avatarEmoji: string;
  level: number;
  totalXp: number;
  totalGold: number;
  currentStreak: number;
  weeklyXp: number;
  weeklyQuestsCompleted: number;
}

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export function HallOfFame() {
  const { membership } = useAuth();
  const familyId = membership?.familyId;
  const weekStart = getStartOfWeek();

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["hall-of-fame", familyId, weekStart],
    queryFn: async (): Promise<CharacterStats[]> => {
      if (!familyId) return [];

      const [charsRes, xpRes, questsRes, weeklyLogsRes] = await Promise.all([
        supabase
          .from("characters")
          .select("id, name, avatar_emoji, gold")
          .eq("family_id", familyId),
        supabase
          .from("xp_events")
          .select("character_id, xp, ts")
          .eq("family_id", familyId),
        supabase
          .from("unified_quests")
          .select("id, assigned_to_character_id, streak_count")
          .eq("family_id", familyId)
          .eq("quest_type", "training")
          .eq("active", true),
        supabase
          .from("quest_logs")
          .select("character_id, xp_earned")
          .eq("family_id", familyId)
          .gte("completed_at", weekStart),
      ]);

      const characters = charsRes.data ?? [];
      const xpEvents = xpRes.data ?? [];
      const quests = questsRes.data ?? [];
      const weeklyLogs = weeklyLogsRes.data ?? [];

      return characters.map((char) => {
        const charXp = xpEvents.filter((e) => e.character_id === char.id);
        const totalXp = charXp.reduce((sum, e) => sum + e.xp, 0);

        const charQuests = quests.filter((q) => q.assigned_to_character_id === char.id);
        const maxStreak = charQuests.reduce((max, q) => Math.max(max, q.streak_count), 0);

        const charWeeklyLogs = weeklyLogs.filter((l) => l.character_id === char.id);
        const weeklyXp = charWeeklyLogs.reduce((sum, l) => sum + l.xp_earned, 0);

        return {
          id: char.id,
          name: char.name,
          avatarEmoji: char.avatar_emoji,
          level: Math.floor(totalXp / 200) + 1,
          totalXp,
          totalGold: char.gold,
          currentStreak: maxStreak,
          weeklyXp,
          weeklyQuestsCompleted: charWeeklyLogs.length,
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

  if (stats.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* All-Time Legends */}
      <section>
        <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-primary" /> All-Time Legends
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.id} className="parchment-panel p-4 text-center space-y-2">
              <span className="text-4xl block">{s.avatarEmoji}</span>
              <div className="font-fantasy text-base truncate">{s.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Level</div>
                  <div className="font-fantasy text-primary text-lg">{s.level}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">XP Gained</div>
                  <div className="font-semibold text-xp">+{s.totalXp.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Gold Earned</div>
                  <div className="font-semibold gold-text flex items-center justify-center gap-1">
                    💰 {s.totalGold}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Best Streak</div>
                  <div className="flex items-center justify-center gap-1">
                    {s.currentStreak > 0 ? (
                      <>
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-semibold">{s.currentStreak}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Ready to start</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* This Week's Momentum */}
      <section>
        <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-primary" /> This Week You Gained
        </h2>
        <div className="parchment-panel overflow-hidden">
          <div className="divide-y divide-border">
            {stats.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl">{s.avatarEmoji}</span>
                <span className="font-semibold text-sm min-w-[5rem] truncate">{s.name}</span>
                <div className="flex items-center gap-4 flex-1 justify-end text-sm">
                  <span className="flex items-center gap-1" title="XP gained this week">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-xp">+{s.weeklyXp}</span>
                  </span>
                  <span title="Quests completed this week">
                    <span className="font-semibold">+{s.weeklyQuestsCompleted}</span>
                    <span className="text-muted-foreground ml-1">quests</span>
                  </span>
                  {s.currentStreak > 0 && (
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-accent text-accent-foreground rounded">
                      <Flame className="h-3 w-3" /> {s.currentStreak} streak
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
