import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Check, Lock, Swords, Plus, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCampaignDialog } from "@/components/game/AddCampaignDialog";

export default function Campaigns() {
  const { state, dispatch } = useGame();
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
    () => new Set(state.campaigns.filter((c) => c.status === "active").map((c) => c.id))
  );
  const [addingStepTo, setAddingStepTo] = useState<string | null>(null);
  const [newStepName, setNewStepName] = useState("");
  const [newStepAssignee, setNewStepAssignee] = useState("");
  const [newStepSkill, setNewStepSkill] = useState("");

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCompleteStep = (stepId: string) => {
    dispatch({ type: "COMPLETE_CAMPAIGN_STEP", stepId });
  };

  const handleAddStep = (campaignId: string) => {
    if (!newStepName.trim() || !newStepAssignee || !newStepSkill) return;
    const existingSteps = state.campaignSteps.filter((s) => s.campaignId === campaignId);
    dispatch({
      type: "ADD_CAMPAIGN_STEP",
      campaignId,
      step: {
        order: existingSteps.length + 1,
        name: newStepName.trim(),
        assignedToId: newStepAssignee,
        skillId: newStepSkill,
        xpReward: 15,
        goldReward: 0,
      },
    });
    setNewStepName("");
    setNewStepAssignee("");
    setNewStepSkill("");
    setAddingStepTo(null);
  };

  // Separate active vs complete campaigns
  const activeCampaigns = state.campaigns.filter((c) => c.status === "active");
  const completedCampaigns = state.campaigns.filter((c) => c.status === "complete");

  // Find the "current quest" — the first available step across active campaigns
  const currentQuest = (() => {
    for (const campaign of activeCampaigns) {
      const step = state.campaignSteps.find(
        (s) => s.campaignId === campaign.id && s.status === "available"
      );
      if (step) return { campaign, step };
    }
    return null;
  })();

  return (
    <PageWrapper
      title="Campaigns"
      subtitle="Epic multi-step adventures for the whole guild"
      action={<AddCampaignDialog />}
    >
      {/* Active Quest Spotlight */}
      {currentQuest && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="h-5 w-5 text-primary" />
            <h2 className="font-fantasy text-lg text-primary">Active Quest</h2>
          </div>
          <ActiveQuestCard
            step={currentQuest.step}
            campaignName={currentQuest.campaign.name}
            state={state}
            onComplete={() => handleCompleteStep(currentQuest.step.id)}
          />
        </div>
      )}

      {state.campaigns.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">🗺️</span>
          <p className="text-lg text-muted-foreground">No campaigns yet. Start your first adventure!</p>
          <div className="mt-4">
            <AddCampaignDialog />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Campaigns */}
          {activeCampaigns.map((campaign) => {
            const steps = state.campaignSteps
              .filter((s) => s.campaignId === campaign.id)
              .sort((a, b) => a.order - b.order);
            const completedSteps = steps.filter((s) => s.status === "done").length;
            const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
            const isExpanded = expandedCampaigns.has(campaign.id);

            return (
              <div key={campaign.id} className="parchment-panel overflow-hidden">
                {/* Campaign Header — clickable to expand */}
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/5 transition-colors"
                  onClick={() => toggleCampaign(campaign.id)}
                >
                  <span className="text-2xl">🗺️</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-fantasy text-lg leading-tight">{campaign.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="xp-bar h-2 flex-1 max-w-[200px]">
                        <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completedSteps}/{steps.length}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded Steps */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground px-4 pt-3">{campaign.description}</p>
                    )}
                    {/* Step timeline */}
                    <div className="p-4 pt-2">
                      <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border" />

                        <div className="space-y-1">
                          {steps.map((step) => (
                            <CampaignStepRow
                              key={step.id}
                              step={step}
                              state={state}
                              onComplete={() => handleCompleteStep(step.id)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quick add step */}
                      {addingStepTo === campaign.id ? (
                        <div className="mt-3 ml-10 p-3 border rounded-lg bg-muted/20 space-y-2">
                          <Input
                            value={newStepName}
                            onChange={(e) => setNewStepName(e.target.value)}
                            placeholder="Step name..."
                            autoFocus
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={newStepAssignee} onValueChange={setNewStepAssignee}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Assigned to" />
                              </SelectTrigger>
                              <SelectContent>
                                {state.characters.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.avatarEmoji} {c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={newStepSkill} onValueChange={setNewStepSkill}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Skill" />
                              </SelectTrigger>
                              <SelectContent>
                                {state.skills.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAddStep(campaign.id)} disabled={!newStepName.trim() || !newStepAssignee || !newStepSkill}>
                              Add
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setAddingStepTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="mt-2 ml-10 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setAddingStepTo(campaign.id)}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add step
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Completed Campaigns */}
          {completedCampaigns.length > 0 && (
            <div className="mt-6">
              <h3 className="font-fantasy text-sm text-muted-foreground uppercase tracking-widest mb-3">
                Completed Adventures
              </h3>
              <div className="space-y-2">
                {completedCampaigns.map((campaign) => {
                  const steps = state.campaignSteps.filter((s) => s.campaignId === campaign.id);
                  const isExpanded = expandedCampaigns.has(campaign.id);
                  return (
                    <div key={campaign.id} className="parchment-panel opacity-70">
                      <button
                        className="w-full flex items-center gap-3 p-3 text-left"
                        onClick={() => toggleCampaign(campaign.id)}
                      >
                        <Check className="h-5 w-5 text-xp shrink-0" />
                        <span className="font-fantasy flex-1 line-through">{campaign.name}</span>
                        <span className="text-xs text-muted-foreground">{steps.length} steps</span>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-1">
                          {steps.sort((a, b) => a.order - b.order).map((step) => (
                            <CampaignStepRow key={step.id} step={step} state={state} onComplete={() => {}} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

/* ── Active Quest Spotlight Card ── */
function ActiveQuestCard({
  step,
  campaignName,
  state,
  onComplete,
}: {
  step: import("@/types/game").CampaignStep;
  campaignName: string;
  state: import("@/types/game").GameState;
  onComplete: () => void;
}) {
  const character = getCharacter(state, step.assignedToId);
  const skill = getSkill(state, step.skillId);
  const domain = skill ? getDomain(state, skill.domainId) : null;

  return (
    <button
      onClick={onComplete}
      className="w-full group parchment-panel p-5 border-2 border-primary/40 hover:border-primary/70 transition-all cursor-pointer text-left relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Swords className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{campaignName}</p>
          <h3 className="font-fantasy text-xl">{step.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{character?.avatarEmoji} {character?.name}</span>
            <span>•</span>
            <span>{domain?.icon} {skill?.name}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xp font-semibold">
            <Sparkles className="h-4 w-4" />
            +{step.xpReward} XP
          </div>
          {step.goldReward > 0 && (
            <span className="text-gold text-sm font-semibold">+{step.goldReward} 💰</span>
          )}
          <p className="text-xs text-primary font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to complete →
          </p>
        </div>
      </div>
    </button>
  );
}

/* ── Single Campaign Step Row (timeline style) ── */
function CampaignStepRow({
  step,
  state,
  onComplete,
}: {
  step: import("@/types/game").CampaignStep;
  state: import("@/types/game").GameState;
  onComplete: () => void;
}) {
  const character = getCharacter(state, step.assignedToId);
  const skill = getSkill(state, step.skillId);
  const domain = skill ? getDomain(state, skill.domainId) : null;
  const isDone = step.status === "done";
  const isAvailable = step.status === "available";
  const isLocked = step.status === "locked";

  return (
    <div
      role={isAvailable ? "button" : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onClick={isAvailable ? onComplete : undefined}
      onKeyDown={isAvailable ? (e) => e.key === "Enter" && onComplete() : undefined}
      className={cn(
        "relative flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all",
        isAvailable && "cursor-pointer hover:bg-primary/5",
        isLocked && "opacity-50"
      )}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
          isDone
            ? "bg-xp border-xp text-xp-foreground"
            : isAvailable
            ? "bg-primary border-primary text-primary-foreground animate-pulse"
            : "bg-muted border-border text-muted-foreground"
        )}
      >
        {isDone ? (
          <Check className="h-5 w-5" />
        ) : isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Swords className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm", isDone && "line-through text-muted-foreground")}>
            {step.name}
          </span>
          {isAvailable && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{character?.avatarEmoji} {character?.name}</span>
          <span>•</span>
          <span>{domain?.icon} {skill?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs shrink-0">
        <span className="text-xp font-semibold">+{step.xpReward}</span>
        {step.goldReward > 0 && <span className="text-gold font-semibold">+{step.goldReward} 💰</span>}
      </div>
    </div>
  );
}
