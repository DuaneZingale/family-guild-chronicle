import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useUnifiedQuests, useTodayQuestLogs, useCompleteQuest, filterQuests, isCompletedToday } from "@/hooks/useUnifiedQuests";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { AddCampaignDialog } from "@/components/game/AddCampaignDialog";
import { Plus, Trash2, Edit, Flame } from "lucide-react";
import { RITUAL_BLOCK_CONFIG, QUEST_TYPE_CONFIG } from "@/types/unified-quests";
import type { UnifiedQuest, QuestType } from "@/types/unified-quests";
import { toast } from "sonner";

export default function QuestLog() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { data: allQuests, isLoading } = useUnifiedQuests();
  const { data: todayLogs } = useTodayQuestLogs();

  const quests = allQuests ?? [];
  const logs = todayLogs ?? [];

  const trainingQuests = filterQuests(quests, { type: "training", activeOnly: true });
  const sideQuests = filterQuests(quests, { type: "side", activeOnly: true });
  const guildQuests = filterQuests(quests, { type: "guild", activeOnly: true });

  const activeCampaigns = state.campaigns.filter((c) => c.status === "active");

  return (
    <PageWrapper title="Quest Log" subtitle="All your quests and adventures">
      <Tabs defaultValue="training" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="training">🏋️ Training</TabsTrigger>
          <TabsTrigger value="side">📌 Side</TabsTrigger>
          <TabsTrigger value="guild">⚔️ Guild</TabsTrigger>
          <TabsTrigger value="campaigns">🗺️ Campaigns</TabsTrigger>
        </TabsList>

        {/* Training Quests Tab */}
        <TabsContent value="training">
          <div className="flex gap-2 mb-4">
            <QuickAddQuest defaultQuestType="training" trigger={
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Training Quest</Button>
            } />
          </div>

          {isLoading ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-2xl animate-pulse">⏳</span>
            </div>
          ) : trainingQuests.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🏋️</span>
              <p className="text-lg text-muted-foreground">No training quests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create recurring quests like brushing teeth, reading, or exercise!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(["morning", "afternoon", "evening"] as const).map((block) => {
                const blockQuests = trainingQuests.filter((q) => q.ritual_block === block);
                if (blockQuests.length === 0) return null;
                const config = RITUAL_BLOCK_CONFIG[block];
                return (
                  <section key={block}>
                    <h3 className="font-fantasy text-lg text-foreground flex items-center gap-2 mb-2">
                      <span>{config.icon}</span> {config.label}
                    </h3>
                    <div className="space-y-2">
                      {blockQuests.map((quest) => (
                        <QuestRow key={quest.id} quest={quest} logs={logs} />
                      ))}
                    </div>
                  </section>
                );
              })}
              {/* Unassigned block */}
              {trainingQuests.filter((q) => !q.ritual_block).length > 0 && (
                <section>
                  <h3 className="font-fantasy text-lg text-foreground flex items-center gap-2 mb-2">
                    <span>📋</span> Unscheduled
                  </h3>
                  <div className="space-y-2">
                    {trainingQuests.filter((q) => !q.ritual_block).map((quest) => (
                      <QuestRow key={quest.id} quest={quest} logs={logs} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </TabsContent>

        {/* Side Quests Tab */}
        <TabsContent value="side">
          <div className="flex gap-2 mb-4">
            <QuickAddQuest defaultQuestType="side" trigger={
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Side Quest</Button>
            } />
          </div>

          {sideQuests.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">📌</span>
              <p className="text-lg text-muted-foreground">No side quests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                One-time personal quests for individual heroes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sideQuests.map((quest) => (
                <QuestRow key={quest.id} quest={quest} logs={logs} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Guild Quests Tab */}
        <TabsContent value="guild">
          <div className="flex gap-2 mb-4">
            <QuickAddQuest defaultQuestType="guild" trigger={
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Guild Quest</Button>
            } />
          </div>

          {guildQuests.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">⚔️</span>
              <p className="text-lg text-muted-foreground">No guild quests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Shared family quests anyone can complete.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {guildQuests.map((quest) => (
                <QuestRow key={quest.id} quest={quest} logs={logs} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="flex gap-2 mb-4">
            <AddCampaignDialog />
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🗺️</span>
              <p className="text-lg text-muted-foreground">No active campaigns.</p>
              <p className="text-sm text-muted-foreground mt-1">Start an epic multi-step adventure!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCampaigns.map((campaign) => {
                const steps = state.campaignSteps.filter((s) => s.campaignId === campaign.id);
                const done = steps.filter((s) => s.status === "done").length;
                const progress = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;
                return (
                  <button
                    key={campaign.id}
                    className="w-full parchment-panel p-4 text-left hover:bg-accent/5 transition-colors"
                    onClick={() => navigate("/campaigns")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🗺️</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fantasy text-lg">{campaign.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="xp-bar h-2 flex-1 max-w-[200px]">
                            <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{done}/{steps.length}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

/* ── Quest Row Component ── */
function QuestRow({ quest, logs }: { quest: UnifiedQuest; logs: any[] }) {
  const done = isCompletedToday(quest, logs);
  const config = QUEST_TYPE_CONFIG[quest.quest_type];
  const importanceIcon: Record<string, string> = {
    essential: "🔴",
    growth: "🟡",
    delight: "🟢",
  };

  return (
    <div className={`parchment-panel p-4 ${done ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">{importanceIcon[quest.importance] ?? "🟡"}</span>
            <span className="font-fantasy text-lg">{quest.name}</span>
            {quest.streak_count > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
                <Flame className="h-3 w-3" /> {quest.streak_count}
              </span>
            )}
            {quest.ritual_block && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded">
                {RITUAL_BLOCK_CONFIG[quest.ritual_block as keyof typeof RITUAL_BLOCK_CONFIG]?.icon} {quest.ritual_block}
              </span>
            )}
            {done && <span className="text-xs px-2 py-0.5 bg-muted rounded">✅ Done</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="text-xp">+{quest.xp_reward} XP</span>
            {quest.gold_reward > 0 && (
              <>
                <span>•</span>
                <span className="text-gold">+{quest.gold_reward} 💰</span>
              </>
            )}
            {quest.frequency_type && (
              <>
                <span>•</span>
                <span className="capitalize">{quest.frequency_type}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
