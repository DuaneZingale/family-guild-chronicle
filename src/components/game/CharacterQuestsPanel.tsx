import { useUnifiedQuests, useTodayQuestLogs, useCompleteQuest, filterQuests, isCompletedToday, todayCompletionCount } from "@/hooks/useUnifiedQuests";
import { useAuth } from "@/context/AuthContext";
import type { UnifiedQuest, RitualBlock } from "@/types/unified-quests";
import { RITUAL_BLOCK_CONFIG, QUEST_TYPE_CONFIG } from "@/types/unified-quests";
import { Check, Flame, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RitualSectionProps {
  block: RitualBlock;
  quests: UnifiedQuest[];
  logs: ReturnType<typeof useTodayQuestLogs>["data"];
  onComplete: (quest: UnifiedQuest) => void;
}

function RitualSection({ block, quests, logs, onComplete }: RitualSectionProps) {
  const config = RITUAL_BLOCK_CONFIG[block];
  const completedCount = quests.filter((q) => isCompletedToday(q, logs ?? [])).length;
  const allDone = quests.length > 0 && completedCount === quests.length;

  if (quests.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2">
          <span>{config.icon}</span> {config.label}
          {allDone && <span className="text-sm text-xp ml-2">✨ Complete!</span>}
        </h2>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{quests.length}
        </span>
      </div>
      <div className="space-y-2">
        {quests.map((quest) => {
          const done = isCompletedToday(quest, logs ?? []);
          return (
            <TrainingQuestCard
              key={quest.id}
              quest={quest}
              isDone={done}
              onComplete={() => onComplete(quest)}
            />
          );
        })}
      </div>
    </section>
  );
}

function TrainingQuestCard({
  quest,
  isDone,
  onComplete,
}: {
  quest: UnifiedQuest;
  isDone: boolean;
  onComplete: () => void;
}) {
  return (
    <div
      role={!isDone ? "button" : undefined}
      tabIndex={!isDone ? 0 : undefined}
      onClick={!isDone ? onComplete : undefined}
      onKeyDown={!isDone ? (e) => e.key === "Enter" && onComplete() : undefined}
      className={cn(
        "quest-card flex items-center gap-3 transition-all",
        isDone && "opacity-60",
        !isDone && "cursor-pointer hover:border-primary/40"
      )}
    >
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
            {quest.name}
          </span>
          {quest.streak_count > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
              <Flame className="h-3 w-3" /> {quest.streak_count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
          <span className="text-xp font-semibold">+{quest.xp_reward} XP</span>
          {quest.gold_reward > 0 && (
            <span className="text-gold font-semibold">+{quest.gold_reward} 💰</span>
          )}
        </div>
      </div>
    </div>
  );
}

function GenericQuestCard({
  quest,
  isDone,
  onComplete,
}: {
  quest: UnifiedQuest;
  isDone: boolean;
  onComplete: () => void;
}) {
  const config = QUEST_TYPE_CONFIG[quest.quest_type];
  return (
    <div
      role={!isDone ? "button" : undefined}
      tabIndex={!isDone ? 0 : undefined}
      onClick={!isDone ? onComplete : undefined}
      onKeyDown={!isDone ? (e) => e.key === "Enter" && onComplete() : undefined}
      className={cn(
        "quest-card flex items-center gap-3 transition-all",
        isDone && "opacity-60",
        !isDone && "cursor-pointer hover:border-primary/40"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
          isDone
            ? "bg-xp border-xp text-xp-foreground"
            : "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        {isDone ? <Check className="h-5 w-5" /> : <span className="text-sm">{config.icon}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("font-semibold", isDone && "line-through")}>
            {quest.name}
          </span>
          <span className={cn("text-xs px-1.5 py-0.5 bg-muted rounded", config.color)}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm shrink-0">
        <span className="text-xp font-semibold">+{quest.xp_reward} XP</span>
        {quest.gold_reward > 0 && (
          <span className="text-gold font-semibold">+{quest.gold_reward} 💰</span>
        )}
      </div>
    </div>
  );
}

interface CharacterQuestsPanelProps {
  characterId: string;
}

export function CharacterQuestsPanel({ characterId }: CharacterQuestsPanelProps) {
  const { data: allQuests, isLoading: questsLoading } = useUnifiedQuests();
  const { data: todayLogs, isLoading: logsLoading } = useTodayQuestLogs(characterId);
  const completeQuest = useCompleteQuest();

  const loading = questsLoading || logsLoading;

  if (loading) {
    return (
      <div className="parchment-panel p-6 text-center">
        <span className="text-2xl animate-pulse">⏳</span>
        <p className="text-muted-foreground mt-2">Loading quests…</p>
      </div>
    );
  }

  const quests = allQuests ?? [];
  const logs = todayLogs ?? [];

  // Side quests
  const sideQuests = filterQuests(quests, {
    type: "side",
    characterId,
    activeOnly: true,
  }).filter((q) => q.status !== "done");

  // Guild quests (unassigned, anyone can complete)
  const guildQuests = filterQuests(quests, {
    type: "guild",
    activeOnly: true,
  }).filter((q) => q.status !== "done");

  // Active campaign steps for this character
  const campaignSteps = filterQuests(quests, {
    type: "campaign_step",
    characterId,
  }).filter((q) => q.status === "available");

  const handleComplete = (quest: UnifiedQuest) => {
    const resolvedCharId = quest.assigned_to_character_id ?? characterId;
    completeQuest.mutate(
      { quest, characterId: resolvedCharId },
      {
        onSuccess: () => toast.success(`Quest complete! +${quest.xp_reward} XP`),
        onError: () => toast.error("Failed to complete quest"),
      }
    );
  };

  const hasAny = sideQuests.length > 0 || guildQuests.length > 0 || campaignSteps.length > 0;

  if (!hasAny) {
    return (
      <div className="parchment-panel p-6 text-center">
        <span className="text-4xl block mb-2">📜</span>
        <p className="text-muted-foreground">No open quests right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Side Quests */}
      {sideQuests.length > 0 && (
        <section className="mb-6">
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
            <span>📌</span> Side Quests
          </h2>
          <div className="space-y-2">
            {sideQuests.map((quest) => (
              <GenericQuestCard
                key={quest.id}
                quest={quest}
                isDone={isCompletedToday(quest, logs)}
                onComplete={() => handleComplete(quest)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Guild Quests */}
      {guildQuests.length > 0 && (
        <section className="mb-6">
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
            <span>⚔️</span> Guild Quests
          </h2>
          <div className="space-y-2">
            {guildQuests.map((quest) => (
              <GenericQuestCard
                key={quest.id}
                quest={quest}
                isDone={isCompletedToday(quest, logs)}
                onComplete={() => handleComplete(quest)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Campaign Steps */}
      {campaignSteps.length > 0 && (
        <section className="mb-6">
          <h2 className="font-fantasy text-xl text-foreground flex items-center gap-2 mb-3">
            <span>🗺️</span> Active Campaign Step
          </h2>
          <div className="space-y-2">
            {campaignSteps.map((quest) => (
              <GenericQuestCard
                key={quest.id}
                quest={quest}
                isDone={isCompletedToday(quest, logs)}
                onComplete={() => handleComplete(quest)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
