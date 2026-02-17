import { useGame } from "@/context/GameContext";
import { getSkillXP, getSkillLevel, getXPProgress, getPath } from "@/lib/gameLogic";
import type { Skill } from "@/types/game";

interface SkillCardProps {
  skill: Skill;
  characterId: string;
}

export function SkillCard({ skill, characterId }: SkillCardProps) {
  const { state } = useGame();
  const xp = getSkillXP(state, skill.id, characterId);
  const level = getSkillLevel(xp);
  const progress = getXPProgress(xp, 100);
  const domain = getPath(state, skill.domainId);

  return (
    <div className="parchment-panel p-4">
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
    </div>
  );
}
