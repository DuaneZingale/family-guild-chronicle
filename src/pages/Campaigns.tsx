import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Check, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCampaignDialog } from "@/components/game/AddCampaignDialog";

export default function Campaigns() {
  const { state, dispatch } = useGame();

  const handleCompleteStep = (stepId: string) => {
    dispatch({ type: "COMPLETE_CAMPAIGN_STEP", stepId });
  };

  return (
    <PageWrapper
      title="Campaigns"
      subtitle="Epic multi-step adventures for the whole guild"
      action={<AddCampaignDialog />}
    >
      {state.campaigns.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">🗺️</span>
          <p className="text-lg text-muted-foreground">No campaigns yet.</p>
          <div className="mt-4">
            <AddCampaignDialog />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {state.campaigns.map((campaign) => {
            const steps = state.campaignSteps
              .filter((s) => s.campaignId === campaign.id)
              .sort((a, b) => a.order - b.order);

            const completedSteps = steps.filter((s) => s.status === "done").length;
            const progress = (completedSteps / steps.length) * 100;

            return (
              <div key={campaign.id} className="parchment-panel p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🗺️</span>
                      <div>
                        <h2 className="font-fantasy text-2xl">{campaign.name}</h2>
                        <p className="text-muted-foreground">{campaign.description}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      campaign.status === "complete"
                        ? "bg-xp/20 text-xp"
                        : "bg-accent/20 text-accent-foreground"
                    )}
                  >
                    {campaign.status === "complete" ? "Complete!" : "In Progress"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {completedSteps} / {steps.length} steps
                    </span>
                  </div>
                  <div className="xp-bar h-3">
                    <div
                      className="xp-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const character = getCharacter(state, step.assignedToId);
                    const skill = getSkill(state, step.skillId);
                    const domain = skill ? getDomain(state, skill.domainId) : null;

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                          step.status === "done"
                            ? "bg-xp/10 border-xp/30"
                            : step.status === "available"
                            ? "bg-card border-primary/50 shadow-sm"
                            : "bg-muted/30 border-border opacity-60"
                        )}
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            step.status === "done"
                              ? "bg-xp text-xp-foreground"
                              : step.status === "available"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {step.status === "done" ? (
                            <Check className="h-5 w-5" />
                          ) : step.status === "locked" ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Step {step.order}
                            </span>
                            <span className="font-semibold">{step.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <span>
                              {character?.avatarEmoji} {character?.name}
                            </span>
                            <span>•</span>
                            <span>
                              {domain?.icon} {skill?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm shrink-0">
                          <span className="text-xp font-semibold">
                            +{step.xpReward} XP
                          </span>
                          {step.goldReward > 0 && (
                            <span className="text-gold font-semibold">
                              +{step.goldReward} 💰
                            </span>
                          )}
                        </div>

                        {step.status === "available" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteStep(step.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
