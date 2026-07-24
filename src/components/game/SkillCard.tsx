import { cn } from "@/lib/utils";

interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    description: string;
    path_id?: string | null;
    domain_id?: string;
  };
  xp?: number;
  recentXP?: number;
  pathId?: string;
}

const SKILL_GLOW: Record<string, string> = {
  care: "shadow-red-500/30",
  curiosity: "shadow-blue-500/30",
  craft: "shadow-emerald-500/30",
  contribution: "shadow-orange-500/30",
  connection: "shadow-pink-500/30",
  wealth: "shadow-yellow-500/30",
  adventure: "shadow-purple-500/30",
};

export function SkillCard({ skill, xp = 0, recentXP = 0, pathId }: SkillCardProps) {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const pid = pathId || skill.path_id || skill.domain_id || "";

  return (
    <div className="skill-tree-panel">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-fantasy text-base tracking-wide">{skill.name}</h4>
        <span
         className={cn(
            "text-sm font-bold px-2 py-0.5 rounded-full bg-muted text-foreground",
            level > 1 && `shadow-lg ${SKILL_GLOW[pid] || ""}`
          )}
        >
          {level}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
      <div className="xp-bar-glow">
        <div className="xp-bar-glow-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
        <span>{progress} / 100 XP</span>
        {recentXP > 0 && (
          <span className="text-xp font-semibold">+{recentXP} this week</span>
        )}
      </div>
    </div>
  );
}
