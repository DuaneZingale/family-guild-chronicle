import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterQuestsPanel } from "@/components/game/CharacterQuestsPanel";
import { GuildSummaryStrip } from "@/components/game/GuildSummaryStrip";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export default function CharacterProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { membership } = useAuth();
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: xpTotal = 0 } = useQuery({
    queryKey: ["character-xp", id],
    queryFn: async () => {
      if (!id) return 0;
      const { data, error } = await supabase
        .from("xp_events")
        .select("xp")
        .eq("character_id", id);
      if (error) throw error;
      return (data ?? []).reduce((sum, e) => sum + e.xp, 0);
    },
    enabled: !!id,
  });

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
    return (
      <PageWrapper title="Not Found">
        <div className="parchment-panel p-8 text-center">
          <p className="text-muted-foreground">Character not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/guild")}>
            Back to Guild Hall
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const level = Math.floor(xpTotal / 200) + 1;
  const progress = ((xpTotal % 200) / 200) * 100;

  return (
    <PageWrapper title={character.name} subtitle={character.role_class}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/guild")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Guild Hall
          </Button>
        </div>

        {/* Character Header */}
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
                  <div className="text-xs text-muted-foreground mt-1">{xpTotal % 200} / 200 XP</div>
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

        {/* Guild Summary Strip */}
        <GuildSummaryStrip />

        {/* Training Grounds */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>🏋️</span> Training Grounds
            </h2>
            {isParent && (
              <QuickAddQuest
                preSelectedCharacterIds={[character.id]}
                defaultQuestType="training"
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Training Quest
                  </Button>
                }
              />
            )}
          </div>
          <CharacterQuestsPanel characterId={character.id} />
        </section>
      </div>
    </PageWrapper>
  );
}
