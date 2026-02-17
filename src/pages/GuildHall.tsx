import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GuildBanner } from "@/components/game/GuildBanner";
import { CharacterCard } from "@/components/game/CharacterCard";
import { Leaderboard } from "@/components/game/Leaderboard";
import { AddKidDialog } from "@/components/game/AddKidDialog";
import { QuestCard } from "@/components/game/QuestCard";
import { XPEventCard } from "@/components/game/XPEventCard";
import { getTodayQuests, getRecentEvents, getCharacter } from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Settings } from "lucide-react";

export default function GuildHall() {
  const { state } = useGame();
  const { membership } = useAuth();
  const navigate = useNavigate();
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  const todayQuests = getTodayQuests(state);
  const recentEvents = getRecentEvents(state, 5);

  // Group today's quests by character
  const questsByCharacter: Record<string, typeof todayQuests> = {};
  for (const quest of todayQuests) {
    const template = state.questTemplates.find((t) => t.id === quest.templateId);
    if (template) {
      const charId = template.assignedToId;
      if (!questsByCharacter[charId]) {
        questsByCharacter[charId] = [];
      }
      questsByCharacter[charId].push(quest);
    }
  }

  const members = state.characters.filter((c) => c.id !== "guild");

  return (
    <PageWrapper title="Guild Hall" subtitle="Welcome home, adventurers">
      <div className="space-y-6">
        {/* Guild Banner */}
        <GuildBanner />

        {/* Member Tiles */}
        <div>
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
            {members.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                variant="tile"
                onClick={() => navigate(`/character/${char.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />

        {/* Today's Quests */}
        <div>
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
            <span>📜</span> Today's Quests
          </h2>

          {Object.keys(questsByCharacter).length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-lg text-muted-foreground">No quests for today!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Head to the Quest Log to add daily quests.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(questsByCharacter).map(([charId, quests]) => {
                const character = getCharacter(state, charId);
                if (!character) return null;

                const sortedQuests = [...quests].sort((a, b) => {
                  if (a.status === "available" && b.status !== "available") return -1;
                  if (a.status !== "available" && b.status === "available") return 1;
                  return 0;
                });

                return (
                  <div key={charId}>
                    <div
                      className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/character/${charId}`)}
                    >
                      <span className="text-2xl">{character.avatarEmoji}</span>
                      <h3 className="font-fantasy text-lg">{character.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({quests.filter((q) => q.status === "done").length}/{quests.length} done)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {sortedQuests.map((quest) => {
                        const template = state.questTemplates.find(
                          (t) => t.id === quest.templateId
                        );
                        if (!template) return null;
                        return (
                          <QuestCard key={quest.id} instance={quest} template={template} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-4">
            <span>📖</span> Recent Activity
          </h2>

          {recentEvents.length === 0 ? (
            <div className="parchment-panel p-6 text-center">
              <p className="text-muted-foreground">No activity yet. Complete some quests!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <XPEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
