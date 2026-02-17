import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterCard } from "@/components/game/CharacterCard";
import { QuestCard } from "@/components/game/QuestCard";
import { SkillCard } from "@/components/game/SkillCard";
import { CharacterEditDialog } from "@/components/game/CharacterEditDialog";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { GuildBanner } from "@/components/game/GuildBanner";
import { getTodayQuests, getSkillsByPath, getPath } from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

interface CharacterProfileProps {
  overrideCharacterId?: string;
  isMyCharacter?: boolean;
}

export default function CharacterProfile({ overrideCharacterId, isMyCharacter }: CharacterProfileProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGame();

  const characterId = overrideCharacterId ?? id;
  const character = state.characters.find((c) => c.id === characterId);
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

  // Today's quests for this character
  const todayQuests = getTodayQuests(state).filter((qi) => {
    const template = state.questTemplates.find((t) => t.id === qi.templateId);
    return template?.assignedToId === character.id;
  });

  // Routines (active recurring templates assigned to this character)
  const routines = state.questTemplates.filter(
    (t) => t.assignedToId === character.id && t.active && t.visibility === "active" && t.recurrenceType !== "none"
  );

  // Campaign steps assigned to this character
  const campaignSteps = state.campaignSteps.filter((s) => s.assignedToId === character.id);
  const campaigns = state.campaigns.filter((c) =>
    campaignSteps.some((s) => s.campaignId === c.id)
  );

  // Skills by path
  const skillsByPath = getSkillsByPath(state);

  return (
    <PageWrapper title={character.name} subtitle={character.roleClass}>
      <div className="space-y-6">
        <GuildBanner />

        <div className="flex items-center gap-2">
          {!isMyCharacter && (
            <Button variant="outline" size="sm" onClick={() => navigate("/guild")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Guild Hall
            </Button>
          )}
          <CharacterEditDialog
            character={character}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            }
          />
        </div>

        <CharacterCard character={character} variant="full" />

        {/* Today's Quests */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>📜</span> Today's Quests
            </h2>
            <QuickAddQuest
              preSelectedCharacterIds={[character.id]}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Quest
                </Button>
              }
            />
          </div>
          {todayQuests.length === 0 ? (
            <div className="parchment-panel p-6 text-center">
              <p className="text-muted-foreground">No quests for today!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayQuests.map((qi) => {
                const template = state.questTemplates.find((t) => t.id === qi.templateId);
                if (!template) return null;
                return <QuestCard key={qi.id} instance={qi} template={template} />;
              })}
            </div>
          )}
        </section>

        {/* Routines */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>🔄</span> Routines
            </h2>
            <QuickAddQuest
              preSelectedCharacterIds={[character.id]}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              }
            />
          </div>
          {routines.length === 0 ? (
            <div className="parchment-panel p-6 text-center">
              <p className="text-muted-foreground">No routines set up yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {routines.map((r) => (
                <div key={r.id} className="parchment-panel p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-fantasy text-base">{r.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {r.recurrenceType} · {r.importance} · {r.xpReward} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <section>
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
              <span>⚔️</span> Campaigns
            </h2>
            <div className="space-y-3">
              {campaigns.map((campaign) => {
                const steps = campaignSteps
                  .filter((s) => s.campaignId === campaign.id)
                  .sort((a, b) => a.order - b.order);
                return (
                  <div key={campaign.id} className="parchment-panel p-4">
                    <h3 className="font-fantasy text-lg">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                    <div className="space-y-1">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-2 text-sm p-2 rounded ${
                            step.status === "done"
                              ? "text-muted-foreground line-through"
                              : step.status === "available"
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          <span>
                            {step.status === "done" ? "✅" : step.status === "available" ? "⭐" : "🔒"}
                          </span>
                          <span>{step.name}</span>
                          <span className="ml-auto text-xs">{step.xpReward} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills */}
        <section>
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
            <span>🌟</span> Paths & Skills
          </h2>
          <div className="space-y-4">
            {Object.entries(skillsByPath).map(([pathId, skills]) => {
              const path = getPath(state, pathId);
              if (!path) return null;
              return (
                <div key={pathId}>
                  <h3 className="font-fantasy text-base text-muted-foreground mb-2">
                    {path.icon} {path.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {skills.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} characterId={character.id} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
