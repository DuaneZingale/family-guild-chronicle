import { useState } from "react";
import { useUnifiedQuests, useTodayQuestLogs, useCompleteQuest, useUpdateQuest, filterQuests, isCompletedToday } from "@/hooks/useUnifiedQuests";
import { useAuth } from "@/context/AuthContext";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import type { UnifiedQuest, RitualBlock } from "@/types/unified-quests";
import { RITUAL_BLOCK_CONFIG } from "@/types/unified-quests";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Flame, Swords, Pencil, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RitualTabsProps {
  characterId: string;
  isParent: boolean;
}

export function RitualTabs({ characterId, isParent }: RitualTabsProps) {
  const { data: allQuests, isLoading: questsLoading } = useUnifiedQuests();
  const { data: todayLogs, isLoading: logsLoading } = useTodayQuestLogs(characterId);
  const completeQuest = useCompleteQuest();
  const updateQuest = useUpdateQuest();
  const [designMode, setDesignMode] = useState<RitualBlock | null>(null);

  const loading = questsLoading || logsLoading;
  const quests = allQuests ?? [];
  const logs = todayLogs ?? [];

  const trainingQuests = filterQuests(quests, { type: "training", characterId, activeOnly: true });

  const getBlockQuests = (block: RitualBlock) =>
    trainingQuests.filter((q) => q.ritual_block === block);

  const handleComplete = (quest: UnifiedQuest) => {
    completeQuest.mutate(
      { quest, characterId },
      {
        onSuccess: () => toast.success(`Quest complete! +${quest.xp_reward} XP`),
        onError: () => toast.error("Failed to complete quest"),
      }
    );
  };

  const handleRemoveFromBlock = (quest: UnifiedQuest) => {
    updateQuest.mutate(
      { id: quest.id, ritual_block: null, active: false },
      {
        onSuccess: () => toast.success("Removed from ritual"),
        onError: () => toast.error("Failed to remove"),
      }
    );
  };

  const handleFrequencyChange = (quest: UnifiedQuest, freq: string) => {
    updateQuest.mutate(
      { id: quest.id, frequency_type: freq as any },
      {
        onSuccess: () => toast.success("Frequency updated"),
        onError: () => toast.error("Failed to update"),
      }
    );
  };

  if (loading) {
    return (
      <div className="parchment-panel p-6 text-center">
        <span className="text-2xl animate-pulse">⏳</span>
        <p className="text-muted-foreground mt-2">Loading rituals…</p>
      </div>
    );
  }

  const blocks: RitualBlock[] = ["morning", "afternoon", "evening"];

  return (
    <Tabs defaultValue="morning" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {blocks.map((block) => {
          const bQuests = getBlockQuests(block);
          const doneCount = bQuests.filter((q) => isCompletedToday(q, logs)).length;
          const allDone = bQuests.length > 0 && doneCount === bQuests.length;
          return (
            <TabsTrigger key={block} value={block} className="flex items-center gap-1.5 text-sm">
              <span>{RITUAL_BLOCK_CONFIG[block].icon}</span>
              <span className="hidden sm:inline">{RITUAL_BLOCK_CONFIG[block].label.replace(" Ritual", "")}</span>
              {bQuests.length > 0 && (
                <span className={cn(
                  "text-xs ml-1",
                  allDone ? "text-xp" : "text-muted-foreground"
                )}>
                  {doneCount}/{bQuests.length}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {blocks.map((block) => {
        const blockQuests = getBlockQuests(block);
        const isDesigning = designMode === block;

        return (
          <TabsContent key={block} value={block} className="mt-3 space-y-2">
            {/* Design Mode Toggle */}
            {isParent && (
              <div className="flex justify-end mb-2">
                <Button
                  variant={isDesigning ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDesignMode(isDesigning ? null : block)}
                >
                  {isDesigning ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Done
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-1" /> Design Ritual
                    </>
                  )}
                </Button>
              </div>
            )}

            {blockQuests.length === 0 ? (
              <div className="parchment-panel p-6 text-center">
                <span className="text-3xl block mb-2">{RITUAL_BLOCK_CONFIG[block].icon}</span>
                <p className="text-muted-foreground text-sm">No quests in this ritual yet.</p>
                {isParent && (
                  <QuickAddQuest
                    preSelectedCharacterIds={[characterId]}
                    defaultQuestType="training"
                    defaultRitualBlock={block}
                    trigger={
                      <Button size="sm" variant="outline" className="mt-3">
                        <Plus className="h-4 w-4 mr-1" /> Add Quest
                      </Button>
                    }
                  />
                )}
              </div>
            ) : (
              <>
                {blockQuests.map((quest) => {
                  const done = isCompletedToday(quest, logs);

                  if (isDesigning) {
                    return (
                      <div key={quest.id} className="quest-card flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm">{quest.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Select
                              value={quest.frequency_type ?? "daily"}
                              onValueChange={(v) => handleFrequencyChange(quest, v)}
                            >
                              <SelectTrigger className="h-7 text-xs w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-xp font-semibold">+{quest.xp_reward} XP</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleRemoveFromBlock(quest)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={quest.id}
                      role={!done ? "button" : undefined}
                      tabIndex={!done ? 0 : undefined}
                      onClick={!done ? () => handleComplete(quest) : undefined}
                      onKeyDown={!done ? (e) => e.key === "Enter" && handleComplete(quest) : undefined}
                      className={cn(
                        "quest-card flex items-center gap-3 transition-all",
                        done && "opacity-60",
                        !done && "cursor-pointer hover:border-primary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                          done
                            ? "bg-xp border-xp text-xp-foreground"
                            : "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        {done ? <Check className="h-5 w-5" /> : <Swords className="h-4 w-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("font-semibold", done && "line-through")}>
                            {quest.name}
                          </span>
                          {quest.frequency_type && (
                            <span className="text-xs px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded capitalize">
                              {quest.frequency_type}
                            </span>
                          )}
                          {quest.streak_count > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-accent text-accent-foreground rounded flex items-center gap-1">
                              <Flame className="h-3 w-3" /> {quest.streak_count}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <span className="text-xp font-semibold">+{quest.xp_reward} XP</span>
                          {quest.gold_reward > 0 && (
                            <span className="gold-text font-semibold">+{quest.gold_reward} 💰</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add quest button in design mode */}
                {isDesigning && isParent && (
                  <QuickAddQuest
                    preSelectedCharacterIds={[characterId]}
                    defaultQuestType="training"
                    defaultRitualBlock={block}
                    trigger={
                      <Button size="sm" variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Training Quest
                      </Button>
                    }
                  />
                )}
              </>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
