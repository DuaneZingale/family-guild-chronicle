import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterCard } from "@/components/game/CharacterCard";
import { SkillCard } from "@/components/game/SkillCard";
import { CharacterEditDialog } from "@/components/game/CharacterEditDialog";
import { GuildBanner } from "@/components/game/GuildBanner";
import { CharacterQuestsPanel } from "@/components/game/CharacterQuestsPanel";
import { getSkillsByPath, getPath } from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

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

        {/* Unified Quest Panel with Ritual Blocks */}
        {characterId && <CharacterQuestsPanel characterId={characterId} />}

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
