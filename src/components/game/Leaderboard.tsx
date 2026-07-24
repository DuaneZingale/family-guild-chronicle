import { useGame } from "@/context/GameContext";
import { getCharacterXP, getCharacterLevel } from "@/lib/gameLogic";
import { useNavigate } from "react-router-dom";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard() {
  const { state } = useGame();
  const navigate = useNavigate();

  const members = state.characters
    .filter((c) => c.id !== "guild")
    .map((c) => ({
      ...c,
      xp: getCharacterXP(state, c.id),
      level: getCharacterLevel(getCharacterXP(state, c.id)),
    }))
    .sort((a, b) => b.xp - a.xp);

  if (members.length === 0) return null;

  return (
    <div className="parchment-panel p-4 sm:p-6">
      <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-4">
        <span>🏆</span> Hall of Fame
      </h2>

      <div className="space-y-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/character/${member.id}`)}
          >
            <span className="text-lg w-8 text-center font-fantasy">
              {index < 3 ? RANK_MEDALS[index] : `#${index + 1}`}
            </span>
            <span className="text-2xl">{member.avatarEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-fantasy text-base truncate">{member.name}</div>
              <div className="text-xs text-muted-foreground">Lvl {member.level}</div>
            </div>
            <div className="text-sm font-semibold text-primary">{member.xp} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}
