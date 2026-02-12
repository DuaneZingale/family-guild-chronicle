import { useGame } from "@/context/GameContext";
import { getSkillXP, getSkillLevel, getXPProgress, getDomain } from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/types/game";

interface SkillCardProps {
  skill: Skill;
  characterId: string;
  showAddButtons?: boolean;
}

export function SkillCard({ skill, characterId, showAddButtons = true }: SkillCardProps) {
  const { state, dispatch } = useGame();
  const xp = getSkillXP(state, skill.id, characterId);
  const level = getSkillLevel(xp);
  const progress = getXPProgress(xp, 100);
  const domain = getDomain(state, skill.domainId);

  const handleAddXP = (amount: number) => {
    dispatch({
      type: "ADD_XP",
      characterId,
      skillId: skill.id,
      xp: amount,
      note: `Manual +${amount} XP`,
    });
  };

  return (
    <div className="parchment-panel p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{domain?.icon}</span>
            <h4 className="font-fantasy text-lg">{skill.name}</h4>
            <span className="text-sm px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
              Lvl {level}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>

          <div className="mt-3">
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {xp % 100} / 100 XP to next level
            </div>
          </div>
        </div>

        {showAddButtons && (
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold"
              onClick={() => handleAddXP(5)}
            >
              +5 XP
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold"
              onClick={() => handleAddXP(15)}
            >
              +15 XP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
