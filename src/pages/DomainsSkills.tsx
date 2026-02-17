import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterCard } from "@/components/game/CharacterCard";
import { SkillCard } from "@/components/game/SkillCard";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { getSkillsByPath } from "@/lib/gameLogic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Character } from "@/types/game";

export default function PathsSkills() {
  const { state } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    state.characters[0] ?? null
  );

  const skillsByPath = getSkillsByPath(state);

  const pathsWithSkills = state.domains.filter(
    (d) => skillsByPath[d.id] && skillsByPath[d.id].length > 0
  );

  return (
    <PageWrapper
      title="The Seven Paths"
      subtitle="Track your progress across all paths of growth"
    >
      {/* Character selector */}
      <div className="mb-6">
        <h2 className="font-fantasy text-lg mb-3">Select Adventurer</h2>
        <div className="flex flex-wrap gap-2">
          {state.characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                selectedCharacter?.id === char.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{char.avatarEmoji}</span>
              <span className="font-medium">{char.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCharacter && (
        <>
          {/* Character overview */}
          <div className="mb-8">
            <CharacterCard character={selectedCharacter} variant="full" />
          </div>

          {/* Quick add */}
          <div className="mb-6">
            <QuickAddQuest
              preSelectedCharacterIds={selectedCharacter ? [selectedCharacter.id] : []}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Quest for {selectedCharacter.name}
                </Button>
              }
            />
          </div>

          {/* Skills by path */}
          {pathsWithSkills.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🎯</span>
              <p className="text-lg text-muted-foreground">
                No skills yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {pathsWithSkills.map((path) => (
                <div key={path.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{path.icon}</span>
                    <div>
                      <h2 className="font-fantasy text-2xl">The {path.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {path.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {skillsByPath[path.id].map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        characterId={selectedCharacter.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
