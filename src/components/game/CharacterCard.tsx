import { useGame } from "@/context/GameContext";
import { getCharacterXP, getCharacterLevel, getXPProgress } from "@/lib/gameLogic";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/game";

interface CharacterCardProps {
  character: Character;
  variant?: "compact" | "full";
  onClick?: () => void;
}

export function CharacterCard({ character, variant = "compact", onClick }: CharacterCardProps) {
  const { state } = useGame();
  const xp = getCharacterXP(state, character.id);
  const level = getCharacterLevel(xp);
  const progress = getXPProgress(xp, 200);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "parchment-panel p-3 flex items-center gap-3",
          onClick && "cursor-pointer hover:scale-[1.02] transition-transform"
        )}
        onClick={onClick}
      >
        <span className="text-3xl">{character.avatarEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-fantasy text-lg truncate">{character.name}</span>
            <span className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
              Lvl {level}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{character.roleClass}</div>
        </div>
        <div className="flex items-center gap-1 text-gold font-semibold">
          <span>💰</span>
          <span>{character.gold}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="parchment-panel p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="text-5xl">{character.avatarEmoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-fantasy text-2xl">{character.name}</h3>
            <span className="text-sm px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
              {character.roleClass}
            </span>
            {character.isKid && (
              <span className="text-sm px-2 py-1 bg-accent/30 text-accent-foreground rounded-full">
                🌟 Kid
              </span>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Level</div>
              <div className="font-fantasy text-2xl text-primary">{level}</div>
              <div className="xp-bar mt-1">
                <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {xp % 200} / 200 XP
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Gold</div>
              <div className="font-fantasy text-2xl text-gold flex items-center gap-1">
                <span>💰</span>
                <span>{character.gold}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
