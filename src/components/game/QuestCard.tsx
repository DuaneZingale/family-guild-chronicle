import { useGame } from "@/context/GameContext";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Check, Swords } from "lucide-react";
import type { QuestInstance, QuestTemplate } from "@/types/game";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  instance: QuestInstance;
  template: QuestTemplate;
}

export function QuestCard({ instance, template }: QuestCardProps) {
  const { state, dispatch } = useGame();
  const character = getCharacter(state, template.assignedToId);
  const skill = getSkill(state, template.skillId);
  const domain = skill ? getDomain(state, skill.domainId) : null;
  
  const isDone = instance.status === "done";
  const slotLabel = template.timesPerDay && template.timesPerDay > 1
    ? instance.slot === 1 ? "AM" : "PM"
    : null;

  const handleComplete = () => {
    if (!isDone) dispatch({ type: "COMPLETE_QUEST", instanceId: instance.id });
  };

  return (
    <div
      role={!isDone ? "button" : undefined}
      tabIndex={!isDone ? 0 : undefined}
      onClick={handleComplete}
      onKeyDown={!isDone ? (e) => e.key === "Enter" && handleComplete() : undefined}
      className={cn(
        "quest-card flex items-center gap-3 transition-all",
        isDone && "opacity-60",
        !isDone && "cursor-pointer hover:border-primary/40"
      )}
    >
      {/* Completion indicator */}
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
          isDone
            ? "bg-xp border-xp text-xp-foreground"
            : "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        {isDone ? <Check className="h-5 w-5" /> : <Swords className="h-4 w-4" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("font-semibold", isDone && "line-through")}>
            {template.name}
          </span>
          {slotLabel && (
            <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
              {slotLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
          <span>{character?.avatarEmoji}</span>
          <span>{character?.name}</span>
          <span>•</span>
          <span>{domain?.icon} {skill?.name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm shrink-0">
        <span className="text-xp font-semibold">+{template.xpReward} XP</span>
        {template.goldReward > 0 && (
          <span className="text-gold font-semibold">+{template.goldReward} 💰</span>
        )}
      </div>

      {!isDone && (
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 sm:hidden">
          Tap to complete
        </span>
      )}
    </div>
  );
}
