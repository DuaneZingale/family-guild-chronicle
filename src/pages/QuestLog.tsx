import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { AddCampaignDialog } from "@/components/game/AddCampaignDialog";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Plus, Trash2, Edit } from "lucide-react";
import type { QuestTemplate, QuestImportance } from "@/types/game";
import { useNavigate } from "react-router-dom";

export default function QuestLog() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [editingTemplate, setEditingTemplate] = useState<QuestTemplate | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEditDialog = (template: QuestTemplate) => {
    setEditingTemplate(template);
    setIsEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) setEditingTemplate(null);
  };

  const handleDelete = (templateId: string) => {
    dispatch({ type: "DELETE_QUEST_TEMPLATE", templateId });
  };

  const handleToggleActive = (template: QuestTemplate) => {
    dispatch({
      type: "UPDATE_QUEST_TEMPLATE",
      template: { ...template, active: !template.active },
    });
  };

  const importanceIcon: Record<QuestImportance, string> = {
    essential: "🔴",
    growth: "🟡",
    delight: "🟢",
  };

  const activeTemplates = state.questTemplates.filter((t) => t.visibility === "active");
  const dailyQuests = activeTemplates.filter((t) => t.type === "recurring");
  const guildQuests = activeTemplates.filter((t) => t.type === "oneoff");

  const getQuestStatus = (templateId: string) => {
    const instances = state.questInstances.filter((qi) => qi.templateId === templateId);
    return instances.some((qi) => qi.status === "done") ? "done" : "available";
  };

  const activeCampaigns = state.campaigns.filter((c) => c.status === "active");

  return (
    <PageWrapper title="Quest Log" subtitle="All your quests, daily routines, and adventures">
      {/* Edit Dialog */}
      <QuickAddQuest
        editTemplate={editingTemplate}
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
      />

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="daily">🔄 Daily Quests</TabsTrigger>
          <TabsTrigger value="guild-quests">⚔️ Guild Quests</TabsTrigger>
          <TabsTrigger value="campaigns">🗺️ Campaigns</TabsTrigger>
          <TabsTrigger value="journeys">🧭 Journeys</TabsTrigger>
        </TabsList>

        {/* Daily Quests Tab */}
        <TabsContent value="daily">
          <div className="flex gap-2 mb-4">
            <QuickAddQuest defaultQuestType="routine" trigger={
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Daily Quest</Button>
            } />
          </div>

          {dailyQuests.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">🔄</span>
              <p className="text-lg text-muted-foreground">No daily quests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create recurring quests like brushing teeth, reading, or exercise!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyQuests.map((template) => (
                <QuestTemplateRow
                  key={template.id}
                  template={template}
                  state={state}
                  importanceIcon={importanceIcon}
                  onEdit={() => openEditDialog(template)}
                  onDelete={() => handleDelete(template.id)}
                  onToggleActive={() => handleToggleActive(template)}
                  showRecurrence
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Guild Quests Tab */}
        <TabsContent value="guild-quests">
          <div className="flex gap-2 mb-4">
            <QuickAddQuest defaultQuestType="task" trigger={
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Guild Quest</Button>
            } />
          </div>

          {guildQuests.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">⚔️</span>
              <p className="text-lg text-muted-foreground">No guild quests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add one-time quests like "Clean the garage" or "Fix the fence."
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guildQuests.map((template) => {
                const questStatus = getQuestStatus(template.id);
                return (
                  <QuestTemplateRow
                    key={template.id}
                    template={template}
                    state={state}
                    importanceIcon={importanceIcon}
                    onEdit={() => openEditDialog(template)}
                    onDelete={() => handleDelete(template.id)}
                    isDone={questStatus === "done"}
                    badge={questStatus === "done" ? "✅ Complete" : "One-time"}
                  />
                );
              })}
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
              <p className="text-sm text-muted-foreground mt-1">
                Start an epic multi-step adventure!
              </p>
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

        {/* Journeys Tab */}
        <TabsContent value="journeys">
          <div className="parchment-panel p-6 text-center">
            <span className="text-4xl block mb-2">🧭</span>
            <p className="text-muted-foreground">
              Manage your long-term growth arcs on the dedicated Journeys page.
            </p>
            <Button className="mt-3" onClick={() => navigate("/journeys")}>
              Open Journeys
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

/* ── Reusable Quest Template Row ── */
function QuestTemplateRow({
  template,
  state,
  importanceIcon,
  onEdit,
  onDelete,
  onToggleActive,
  showRecurrence,
  isDone,
  badge,
}: {
  template: QuestTemplate;
  state: any;
  importanceIcon: Record<QuestImportance, string>;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
  showRecurrence?: boolean;
  isDone?: boolean;
  badge?: string;
}) {
  const character = getCharacter(state, template.assignedToId);
  const skill = getSkill(state, template.skillId);
  const domain = skill ? getDomain(state, skill.domainId) : null;

  return (
    <div className={`parchment-panel p-4 ${isDone || !template.active ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">{importanceIcon[template.importance]}</span>
            <span className="font-fantasy text-lg">{template.name}</span>
            {badge && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded">{badge}</span>
            )}
            {showRecurrence && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                {template.recurrenceType}
                {template.timesPerDay && template.timesPerDay > 1
                  ? ` (${template.timesPerDay}x)`
                  : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{character?.avatarEmoji} {character?.name}</span>
            <span>•</span>
            <span>{domain?.icon} {skill?.name}</span>
            <span>•</span>
            <span className="text-xp">+{template.xpReward} XP</span>
            {template.goldReward > 0 && (
              <>
                <span>•</span>
                <span className="text-gold">+{template.goldReward} 💰</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleActive && (
            <Switch
              checked={template.active}
              onCheckedChange={onToggleActive}
            />
          )}
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
