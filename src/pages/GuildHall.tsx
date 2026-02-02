import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterCard } from "@/components/game/CharacterCard";
import { QuestCard } from "@/components/game/QuestCard";
import { XPEventCard } from "@/components/game/XPEventCard";
import { getTodayQuests, getRecentEvents, getCharacter } from "@/lib/gameLogic";

export default function GuildHall() {
  const { state } = useGame();
  
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

  const characters = state.characters.filter((c) => c.id !== "guild");
  const guild = state.characters.find((c) => c.id === "guild");

  return (
    <PageWrapper title="Guild Hall" subtitle="Welcome home, adventurers">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Characters */}
        <div className="space-y-4">
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
            <span>👥</span> Guild Members
          </h2>
          
          <div className="space-y-3">
            {characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
            {guild && <CharacterCard character={guild} />}
          </div>
        </div>
        
        {/* Center column - Today's Quests */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
            <span>📜</span> Today's Quests
          </h2>
          
          {Object.keys(questsByCharacter).length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-lg text-muted-foreground">No quests for today!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check the Routines page to add some.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(questsByCharacter).map(([charId, quests]) => {
                const character = getCharacter(state, charId);
                if (!character) return null;
                
                // Sort: available first, then done
                const sortedQuests = [...quests].sort((a, b) => {
                  if (a.status === "available" && b.status !== "available") return -1;
                  if (a.status !== "available" && b.status === "available") return 1;
                  return 0;
                });
                
                return (
                  <div key={charId}>
                    <div className="flex items-center gap-2 mb-3">
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
          
          {/* Recent Activity */}
          <div className="mt-8">
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
      </div>
    </PageWrapper>
  );
}
