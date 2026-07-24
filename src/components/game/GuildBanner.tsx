import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getCharacterXP } from "@/lib/gameLogic";

export function GuildBanner() {
  const { state } = useGame();
  const navigate = useNavigate();

  const guild = state.characters.find((c) => c.id === "guild");
  const members = state.characters.filter((c) => c.id !== "guild");

  const totalXP = members.reduce((sum, c) => sum + getCharacterXP(state, c.id), 0);
  const totalGold = state.characters.reduce((sum, c) => sum + c.gold, 0);
  const activeCampaigns = state.campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="parchment-panel p-6 sm:p-8 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => navigate("/guild")}>
      <div className="flex items-center gap-4 sm:gap-6">
        <span className="text-6xl sm:text-7xl">{guild?.avatarEmoji ?? "🏰"}</span>
        <div className="flex-1">
          <h1 className="font-fantasy text-2xl sm:text-3xl text-foreground tracking-wider">
            {guild?.name ?? "Family Guild"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} adventurer{members.length !== 1 ? "s" : ""} strong
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total XP</div>
          <div className="font-fantasy text-xl sm:text-2xl text-primary">{totalXP.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Guild Gold</div>
          <div className="font-fantasy text-xl sm:text-2xl flex items-center justify-center gap-1">
            <span>💰</span>
            <span className="gold-text">{totalGold}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Campaigns</div>
          <div className="font-fantasy text-xl sm:text-2xl text-secondary-foreground">
            ⚔️ {activeCampaigns}
          </div>
        </div>
      </div>
    </div>
  );
}
