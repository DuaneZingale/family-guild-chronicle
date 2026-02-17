import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { getPath } from "@/lib/gameLogic";
import { SUGGESTED_QUEST_LIBRARY } from "@/data/seed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { QuestImportance } from "@/types/game";
import { Sparkles, Zap, Heart, CheckCircle2, ScrollText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function QuestBoard() {
  const { state, dispatch } = useGame();
  const [filterPath, setFilterPath] = useState<string>("all");
  const [assignToId, setAssignToId] = useState<string>(
    state.characters.find((c) => c.isKid)?.id ?? state.characters[0]?.id ?? ""
  );
  const [justAccepted, setJustAccepted] = useState<Set<string>>(new Set());

  // Filter out already-activated templates (by name match)
  const activeNames = new Set(state.questTemplates.map((t) => t.name));
  const availableSuggestions = SUGGESTED_QUEST_LIBRARY.filter(
    (t) => !activeNames.has(t.name) && !justAccepted.has(t.id)
  );

  const filtered = filterPath === "all"
    ? availableSuggestions
    : availableSuggestions.filter((t) => {
        const skill = state.skills.find((s) => s.id === t.skillId);
        return skill?.domainId === filterPath;
      });

  // Group by path
  const groupedByPath = state.domains.reduce<
    Record<string, typeof filtered>
  >((acc, path) => {
    const quests = filtered.filter((t) => {
      const skill = state.skills.find((s) => s.id === t.skillId);
      return skill?.domainId === path.id;
    });
    if (quests.length > 0) acc[path.id] = quests;
    return acc;
  }, {});

  const importanceConfig: Record<QuestImportance, { icon: React.ReactNode; label: string; color: string }> = {
    essential: { icon: <Zap className="h-3.5 w-3.5" />, label: "Essential", color: "bg-destructive/10 text-destructive border-destructive/30" },
    growth: { icon: <Sparkles className="h-3.5 w-3.5" />, label: "Growth", color: "bg-accent/10 text-accent-foreground border-accent/30" },
    delight: { icon: <Heart className="h-3.5 w-3.5" />, label: "Delight", color: "bg-xp/10 text-xp border-xp/30" },
  };

  const handleAccept = (template: typeof SUGGESTED_QUEST_LIBRARY[0]) => {
    if (!assignToId) return;
    const { id, ...rest } = template;
    dispatch({
      type: "ACTIVATE_SUGGESTED_QUEST",
      template: rest,
      assignedToId: assignToId,
    });
    setJustAccepted((prev) => new Set(prev).add(id));
    const charName = state.characters.find((c) => c.id === assignToId)?.name ?? "adventurer";
    toast({
      title: "⚔️ Quest Accepted!",
      description: `"${template.name}" added to ${charName}'s quest log.`,
    });
  };

  const pathsToShow = filterPath === "all"
    ? state.domains.filter((d) => groupedByPath[d.id])
    : state.domains.filter((d) => d.id === filterPath && groupedByPath[d.id]);

  return (
    <PageWrapper
      title="Quest Board"
      subtitle="Browse the tavern wall — accept quests to add them to your log"
    >
      {/* Filters bar */}
      <div className="parchment-panel p-4 mb-6 border-b-4 border-amber-900/20">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[160px]">
            <label className="text-sm font-medium mb-1 block font-fantasy">Accept For</label>
            <Select value={assignToId} onValueChange={setAssignToId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.characters
                  .filter((c) => c.name !== "The Guild")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.avatarEmoji} {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[160px]">
            <label className="text-sm font-medium mb-1 block font-fantasy">Filter by Path</label>
            <Select value={filterPath} onValueChange={setFilterPath}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Paths</SelectItem>
                {state.domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.icon} {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quest Board — grouped by path */}
      {pathsToShow.length === 0 ? (
        <div className="parchment-panel p-10 text-center">
          <ScrollText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground font-fantasy">
            The board is empty — all quests have been claimed!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pathsToShow.map((path) => {
            const quests = groupedByPath[path.id] ?? [];
            return (
              <section key={path.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{path.icon}</span>
                  <h2 className="font-fantasy text-xl text-foreground">
                    The Path of {path.name}
                  </h2>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({quests.length} available)
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {quests.map((template) => {
                    const skill = state.skills.find((s) => s.id === template.skillId);
                    const imp = importanceConfig[template.importance];
                    const questType = template.recurrenceType !== "none" ? "Daily Quest" : "Guild Task";

                    return (
                      <div
                        key={template.id}
                        className="quest-card flex flex-col relative overflow-hidden"
                      >
                        {/* Decorative nail */}
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-900/30 border border-amber-900/50" />

                        <div className="flex-1">
                          <h3 className="font-fantasy text-lg mb-1 pr-4">{template.name}</h3>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                              imp.color
                            )}>
                              {imp.icon}
                              {imp.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary-foreground rounded border border-secondary/20">
                              {questType}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {skill?.name}
                            {template.recurrenceType === "daily" && template.timesPerDay && template.timesPerDay > 1
                              ? ` · ${template.timesPerDay}x daily`
                              : template.recurrenceType === "weekly"
                              ? " · Weekly"
                              : template.recurrenceType === "daily"
                              ? " · Daily"
                              : ""}
                          </p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-xp font-semibold">+{template.xpReward} XP</span>
                            {template.goldReward > 0 && (
                              <span className="text-gold font-semibold">+{template.goldReward} 💰</span>
                            )}
                          </div>
                        </div>

                        <Button
                          className="mt-3 w-full gap-2"
                          onClick={() => handleAccept(template)}
                          disabled={!assignToId}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept Quest
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
