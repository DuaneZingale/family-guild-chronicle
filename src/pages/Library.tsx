import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { getPath, getSkill } from "@/lib/gameLogic";
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
import { Sparkles, Zap, Heart } from "lucide-react";

export default function Library() {
  const { state, dispatch } = useGame();
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterImportance, setFilterImportance] = useState<string>("all");
  const [assignToId, setAssignToId] = useState<string>(
    state.characters.find((c) => c.isKid)?.id ?? state.characters[0]?.id ?? ""
  );

  // Filter out already-activated templates (by name match)
  const activeNames = new Set(state.questTemplates.map((t) => t.name));
  const availableSuggestions = SUGGESTED_QUEST_LIBRARY.filter(
    (t) => !activeNames.has(t.name)
  );

  const filtered = availableSuggestions.filter((t) => {
    if (filterDomain !== "all") {
      const skill = state.skills.find((s) => s.id === t.skillId);
      if (skill?.domainId !== filterDomain) return false;
    }
    if (filterImportance !== "all" && t.importance !== filterImportance) return false;
    return true;
  });

  const importanceConfig: Record<QuestImportance, { icon: React.ReactNode; label: string; color: string }> = {
    essential: { icon: <Zap className="h-4 w-4" />, label: "Essential", color: "bg-destructive/10 text-destructive border-destructive/30" },
    growth: { icon: <Sparkles className="h-4 w-4" />, label: "Growth", color: "bg-accent/10 text-accent-foreground border-accent/30" },
    delight: { icon: <Heart className="h-4 w-4" />, label: "Delight", color: "bg-xp/10 text-xp border-xp/30" },
  };

  const handleActivate = (template: typeof SUGGESTED_QUEST_LIBRARY[0]) => {
    if (!assignToId) return;
    const { id, ...rest } = template;
    dispatch({
      type: "ACTIVATE_SUGGESTED_QUEST",
      template: rest,
      assignedToId: assignToId,
    });
  };

  return (
    <PageWrapper
      title="Guild Library"
      subtitle="Browse and activate quests for your adventurers"
    >
      {/* Filters */}
      <div className="parchment-panel p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[140px]">
            <label className="text-sm font-medium mb-1 block">Assign To</label>
            <Select value={assignToId} onValueChange={setAssignToId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.characters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.avatarEmoji} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[140px]">
            <label className="text-sm font-medium mb-1 block">Path</label>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
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

          <div className="min-w-[140px]">
            <label className="text-sm font-medium mb-1 block">Importance</label>
            <Select value={filterImportance} onValueChange={setFilterImportance}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="essential">🔴 Essential</SelectItem>
                <SelectItem value="growth">🟡 Growth</SelectItem>
                <SelectItem value="delight">🟢 Delight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quest cards */}
      {filtered.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">📚</span>
          <p className="text-lg text-muted-foreground">
            All quests in this category have been activated!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => {
            const skill = state.skills.find((s) => s.id === template.skillId);
            const domain = skill ? getPath(state, skill.domainId) : null;
            const imp = importanceConfig[template.importance];

            return (
              <div key={template.id} className="parchment-panel p-4 flex flex-col">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{domain?.icon ?? "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-fantasy text-lg">{template.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                        imp.color
                      )}>
                        {imp.icon}
                        {imp.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                        {template.recurrenceType}
                        {template.timesPerDay && template.timesPerDay > 1
                          ? ` (${template.timesPerDay}x)`
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {domain?.name} → {skill?.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <span className="text-xp font-semibold">+{template.xpReward} XP</span>
                      {template.goldReward > 0 && (
                        <span className="text-gold font-semibold">+{template.goldReward} 💰</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleActivate(template)}
                  disabled={!assignToId}
                >
                  ⚡ Activate for {state.characters.find((c) => c.id === assignToId)?.name ?? "..."}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
