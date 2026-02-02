import { useGame } from "@/context/GameContext";
import { getCharacter, getSkill } from "@/lib/gameLogic";
import type { XPEvent } from "@/types/game";

interface XPEventCardProps {
  event: XPEvent;
}

export function XPEventCard({ event }: XPEventCardProps) {
  const { state } = useGame();
  const character = getCharacter(state, event.characterId);
  const skill = getSkill(state, event.skillId);
  
  const date = new Date(event.ts);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  const sourceIcon = {
    quest: "✅",
    manual: "✋",
    campaign: "🗺️",
  }[event.source];

  return (
    <div className="parchment-panel p-3 flex items-center gap-3">
      <span className="text-2xl">{character?.avatarEmoji ?? "❓"}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{character?.name}</span>
          {skill && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{skill.name}</span>
            </>
          )}
        </div>
        {event.note && (
          <p className="text-sm text-muted-foreground truncate">{event.note}</p>
        )}
      </div>
      
      <div className="text-right shrink-0">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm">{sourceIcon}</span>
          {event.xp > 0 && (
            <span className="text-xp font-semibold">+{event.xp} XP</span>
          )}
          {event.gold !== 0 && (
            <span className={event.gold > 0 ? "text-gold font-semibold" : "text-destructive font-semibold"}>
              {event.gold > 0 ? "+" : ""}{event.gold} 💰
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {dateStr} {timeStr}
        </div>
      </div>
    </div>
  );
}
