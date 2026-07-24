import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterQuestsPanel } from "@/components/game/CharacterQuestsPanel";
import { GuildSummaryStrip } from "@/components/game/GuildSummaryStrip";
import { RitualTabs } from "@/components/game/RitualTabs";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MyCharacter() {
  const { membership, kidPinCharacterId } = useAuth();
  const familyId = membership?.familyId;
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  const characterId = kidPinCharacterId ?? membership?.characterId ?? null;

  // Fetch character from Supabase
  const { data: character, isLoading } = useQuery({
    queryKey: ["my-character", characterId],
    queryFn: async () => {
      if (!characterId) return null;
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", characterId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!characterId,
  });

  // Fetch XP for level calculation
  const { data: xpTotal = 0 } = useQuery({
    queryKey: ["character-xp", characterId],
    queryFn: async () => {
      if (!characterId) return 0;
      const { data, error } = await supabase
        .from("xp_events")
        .select("xp")
        .eq("character_id", characterId);
      if (error) throw error;
      return (data ?? []).reduce((sum, e) => sum + e.xp, 0);
    },
    enabled: !!characterId,
  });

  if (!characterId) {
    return <Navigate to="/guild" replace />;
  }

  if (isLoading) {
    return (
      <PageWrapper title="Loading…">
        <div className="parchment-panel p-8 text-center">
          <span className="text-3xl animate-pulse">⏳</span>
        </div>
      </PageWrapper>
    );
  }

  if (!character) {
    return <Navigate to="/guild" replace />;
  }

  const level = Math.floor(xpTotal / 200) + 1;
  const progress = ((xpTotal % 200) / 200) * 100;

  return (
    <PageWrapper title={character.name} subtitle={character.role_class}>
      <div className="space-y-6">
        {/* 1. Character Header */}
        <div className="parchment-panel p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{character.avatar_emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-fantasy text-2xl">{character.name}</h2>
                <span className="text-sm px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                  {character.role_class}
                </span>
                {character.is_kid && (
                  <span className="text-sm px-2 py-1 bg-accent/30 text-accent-foreground rounded-full">
                    🌟 Kid
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Level</div>
                  <div className="font-fantasy text-2xl text-primary">{level}</div>
                  <div className="xp-bar mt-1">
                    <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {xpTotal % 200} / 200 XP
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Gold</div>
                  <div className="font-fantasy text-2xl flex items-center gap-1">
                    <span>💰</span>
                    <span className="gold-text">{character.gold}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Compact Guild Summary Strip */}
        <GuildSummaryStrip />

        {/* 3. Training Grounds — Ritual Tabs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>🏋️</span> Training Grounds
            </h2>
          </div>
          <RitualTabs characterId={characterId} isParent={isParent} />
        </section>

        {/* 4. Open Quests (Side / Guild / Campaign) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>📜</span> Open Quests
            </h2>
            {isParent && (
              <QuickAddQuest
                preSelectedCharacterIds={[characterId]}
                defaultQuestType="side"
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Quest
                  </Button>
                }
              />
            )}
          </div>
          <CharacterQuestsPanel characterId={characterId} />
        </section>
      </div>
    </PageWrapper>
  );
}
