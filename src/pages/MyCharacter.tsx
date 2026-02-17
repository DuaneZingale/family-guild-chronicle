import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CharacterCard } from "@/components/game/CharacterCard";
import { QuestCard } from "@/components/game/QuestCard";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import {
  getTodayQuests,
  getCharacterXP,
  getCharacterLevel,
  getXPProgress,
  getSkillsByPath,
  getPath,
  getSkillXP,
} from "@/lib/gameLogic";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";

export default function MyCharacter() {
  const { state } = useGame();
  const { membership } = useAuth();
  const navigate = useNavigate();

  // Find the logged-in user's character
  const myCharacter = state.characters.find((c) => c.id === membership?.characterId);

  if (!myCharacter) {
    return (
      <PageWrapper title="My Character">
        <div className="parchment-panel p-8 text-center">
          <span className="text-5xl block mb-3">🧙</span>
          <p className="text-muted-foreground">No character linked to your account yet.</p>
          <Button className="mt-4" onClick={() => navigate("/guild")}>
            Visit Guild Hall
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const xp = getCharacterXP(state, myCharacter.id);
  const level = getCharacterLevel(xp);
  const progress = getXPProgress(xp, 200);

  // My today's quests
  const todayQuests = getTodayQuests(state).filter((qi) => {
    const template = state.questTemplates.find((t) => t.id === qi.templateId);
    return template?.assignedToId === myCharacter.id;
  });

  const activeQuests = todayQuests.filter((q) => q.status === "available");
  const doneQuests = todayQuests.filter((q) => q.status === "done");

  // My routines
  const myRoutines = state.questTemplates.filter(
    (t) =>
      t.assignedToId === myCharacter.id &&
      t.active &&
      t.visibility === "active" &&
      t.recurrenceType !== "none"
  );

  // My campaigns
  const myCampaignSteps = state.campaignSteps.filter((s) => s.assignedToId === myCharacter.id);
  const myCampaigns = state.campaigns.filter(
    (c) => c.status === "active" && myCampaignSteps.some((s) => s.campaignId === c.id)
  );

  // Guild summary
  const members = state.characters.filter((c) => c.id !== "guild");
  const totalGuildXP = members.reduce((sum, c) => sum + getCharacterXP(state, c.id), 0);
  const activeCampaigns = state.campaigns.filter((c) => c.status === "active").length;

  // Top paths for this character
  const skillsByPath = getSkillsByPath(state);
  const pathXP = Object.entries(skillsByPath)
    .map(([pathId, skills]) => {
      const path = getPath(state, pathId);
      const totalPathXP = skills.reduce(
        (sum, skill) => sum + getSkillXP(state, skill.id, myCharacter.id),
        0
      );
      return { path, totalPathXP };
    })
    .filter((p) => p.path && p.totalPathXP > 0)
    .sort((a, b) => b.totalPathXP - a.totalPathXP)
    .slice(0, 3);

  return (
    <PageWrapper title={myCharacter.name} subtitle={myCharacter.roleClass}>
      <div className="space-y-6">
        {/* ── Hero Section ── */}
        <div className="parchment-panel p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="text-6xl sm:text-7xl">{myCharacter.avatarEmoji}</span>
            <div className="flex-1">
              <h1 className="font-fantasy text-2xl sm:text-3xl text-foreground tracking-wider">
                {myCharacter.name}
              </h1>
              <p className="text-sm text-muted-foreground">{myCharacter.roleClass}</p>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Level
                  </div>
                  <div className="font-fantasy text-2xl text-primary">{level}</div>
                  <div className="xp-bar mt-1">
                    <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{xp % 200}/200 XP</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Gold
                  </div>
                  <div className="font-fantasy text-2xl flex items-center gap-1">
                    <span>💰</span>
                    <span className="gold-text">{myCharacter.gold}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Quests Today
                  </div>
                  <div className="font-fantasy text-2xl text-primary">
                    {doneQuests.length}/{todayQuests.length}
                  </div>
                </div>
              </div>

              {/* Top Paths */}
              {pathXP.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {pathXP.map(({ path }) =>
                    path ? (
                      <span
                        key={path.id}
                        className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                      >
                        {path.icon} {path.name}
                      </span>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Compact Guild Strip ── */}
        <div
          className="parchment-panel p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => navigate("/guild")}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏰</span>
            <div>
              <div className="font-fantasy text-base">
                {membership?.familyName || "Family Guild"}
              </div>
              <div className="text-xs text-muted-foreground">
                {members.length} members · {totalGuildXP.toLocaleString()} XP · ⚔️ {activeCampaigns} campaigns
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* ── My Active Quests ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
              <span>📜</span> My Quests Today
            </h2>
            <QuickAddQuest
              preSelectedCharacterIds={[myCharacter.id]}
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Quest
                </Button>
              }
            />
          </div>
          {todayQuests.length === 0 ? (
            <div className="parchment-panel p-6 text-center">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-muted-foreground">No quests for today!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...activeQuests, ...doneQuests].map((qi) => {
                const template = state.questTemplates.find((t) => t.id === qi.templateId);
                if (!template) return null;
                return <QuestCard key={qi.id} instance={qi} template={template} />;
              })}
            </div>
          )}
        </section>

        {/* ── My Campaigns ── */}
        {myCampaigns.length > 0 && (
          <section>
            <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
              <span>⚔️</span> My Campaigns
            </h2>
            <div className="space-y-3">
              {myCampaigns.map((campaign) => {
                const steps = myCampaignSteps
                  .filter((s) => s.campaignId === campaign.id)
                  .sort((a, b) => a.order - b.order);
                const done = steps.filter((s) => s.status === "done").length;
                const pct = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;
                return (
                  <div
                    key={campaign.id}
                    className="parchment-panel p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => navigate("/quest-log")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🗺️</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fantasy text-lg">{campaign.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="xp-bar h-2 flex-1 max-w-[200px]">
                            <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {done}/{steps.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            className="parchment-panel p-4 text-center hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/quest-log")}
          >
            <span className="text-2xl block mb-1">📜</span>
            <span className="font-fantasy text-sm">Quest Log</span>
          </button>
          <button
            className="parchment-panel p-4 text-center hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/paths")}
          >
            <span className="text-2xl block mb-1">⚔️</span>
            <span className="font-fantasy text-sm">Paths</span>
          </button>
          <button
            className="parchment-panel p-4 text-center hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/journeys")}
          >
            <span className="text-2xl block mb-1">🧭</span>
            <span className="font-fantasy text-sm">Journeys</span>
          </button>
          <button
            className="parchment-panel p-4 text-center hover:bg-accent/5 transition-colors"
            onClick={() => navigate("/shop")}
          >
            <span className="text-2xl block mb-1">🛒</span>
            <span className="font-fantasy text-sm">Shop</span>
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
