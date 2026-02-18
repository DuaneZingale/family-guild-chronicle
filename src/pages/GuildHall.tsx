import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GuildBanner } from "@/components/game/GuildBanner";
import { HallOfFame } from "@/components/game/HallOfFame";
import { RitualReadiness } from "@/components/game/RitualReadiness";
import { AddKidDialog } from "@/components/game/AddKidDialog";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

export default function GuildHall() {
  const { membership } = useAuth();
  const familyId = membership?.familyId;
  const navigate = useNavigate();
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  // Fetch characters from Supabase
  const { data: characters = [] } = useQuery({
    queryKey: ["characters", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("family_id", familyId);
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  // Fetch XP totals per character
  const { data: xpMap = {} } = useQuery({
    queryKey: ["guild-xp-map", familyId],
    queryFn: async () => {
      if (!familyId) return {};
      const { data, error } = await supabase
        .from("xp_events")
        .select("character_id, xp")
        .eq("family_id", familyId);
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const e of data ?? []) {
        map[e.character_id] = (map[e.character_id] ?? 0) + e.xp;
      }
      return map;
    },
    enabled: !!familyId,
  });

  // Active guild quests
  const { data: guildQuests = [] } = useQuery({
    queryKey: ["guild-quests", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("unified_quests")
        .select("id, name, xp_reward, gold_reward, status")
        .eq("family_id", familyId)
        .eq("quest_type", "guild")
        .eq("active", true)
        .neq("status", "done");
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  // Active campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["active-campaigns", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, status")
        .eq("family_id", familyId)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  return (
    <PageWrapper title="Guild Hall" subtitle="Welcome home, adventurers">
      <div className="space-y-6">
        {/* Guild Banner */}
        <GuildBanner />

        {/* Member Tiles */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>👥</span> Guild Members
            </h2>
            {isParent && (
              <div className="flex gap-2">
                <AddKidDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Kid
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/guild-settings?tab=invites")}
                >
                  <UserPlus className="h-4 w-4 mr-1" /> Invite
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {characters.map((char) => {
              const xp = xpMap[char.id] ?? 0;
              const level = Math.floor(xp / 200) + 1;
              const progress = ((xp % 200) / 200) * 100;
              return (
                <div
                  key={char.id}
                  className="parchment-panel p-4 flex flex-col items-center gap-2 text-center cursor-pointer hover:scale-[1.03] transition-transform"
                  onClick={() => navigate(`/character/${char.id}`)}
                >
                  <span className="text-4xl">{char.avatar_emoji}</span>
                  <div className="font-fantasy text-base truncate w-full">{char.name}</div>
                  <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                    Lvl {level}
                  </span>
                  <div className="xp-bar w-full mt-1">
                    <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span>💰</span>
                    <span className="gold-text font-semibold">{char.gold}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ritual Readiness — glanceable status board */}
        <RitualReadiness />

        {/* Hall of Fame */}
        <HallOfFame />
        {/* Active Guild Quests */}
        {guildQuests.length > 0 && (
          <section>
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
              <span>⚔️</span> Active Guild Quests
            </h2>
            <div className="space-y-2">
              {guildQuests.map((q) => (
                <div key={q.id} className="quest-card flex items-center gap-3">
                  <span className="text-lg">⚔️</span>
                  <span className="font-semibold flex-1">{q.name}</span>
                  <span className="text-sm text-primary font-semibold">+{q.xp_reward} XP</span>
                  {q.gold_reward > 0 && (
                    <span className="text-sm font-semibold">💰 {q.gold_reward}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <section>
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
              <span>🗺️</span> Active Campaigns
            </h2>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="quest-card flex items-center gap-3 cursor-pointer hover:border-primary/40"
                  onClick={() => navigate("/campaigns")}
                >
                  <span className="text-lg">🗺️</span>
                  <span className="font-semibold flex-1">{c.name}</span>
                  <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                    In Progress
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
