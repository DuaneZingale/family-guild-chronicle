import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Plus, Trash2, Edit } from "lucide-react";
import type { QuestTemplate, QuestImportance } from "@/types/game";

export default function Routines() {
  const { state, dispatch } = useGame();
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

  // Split templates into tasks vs routines
  const activeTemplates = state.questTemplates.filter((t) => t.visibility === "active");
  const oneoffTasks = activeTemplates.filter((t) => t.type === "oneoff");
  const routineTemplates = activeTemplates.filter((t) => t.type === "recurring");

  // Check if oneoff tasks have completed instances
  const getTaskStatus = (templateId: string) => {
    const instances = state.questInstances.filter((qi) => qi.templateId === templateId);
    return instances.some((qi) => qi.status === "done") ? "done" : "available";
  };

  return (
    <PageWrapper title="Quests & Routines" subtitle="Manage tasks, habits, and recurring quests">
      <div className="flex gap-2 mb-6">
        <QuickAddQuest defaultQuestType="routine" />
        <QuickAddQuest
          defaultQuestType="task"
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          }
        />
      </div>

      {/* Edit Dialog — reuses QuickAddQuest in edit mode */}
      <QuickAddQuest
        editTemplate={editingTemplate}
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
      />

      {/* Active Tasks (one-off) */}
      {oneoffTasks.length > 0 && (
        <section className="mb-8">
          <h2 className="font-fantasy text-xl mb-4 flex items-center gap-2">
            <span>✅</span> Active Tasks
          </h2>
          <div className="space-y-4">
            {oneoffTasks.map((template) => {
              const character = getCharacter(state, template.assignedToId);
              const skill = getSkill(state, template.skillId);
              const domain = skill ? getDomain(state, skill.domainId) : null;
              const taskStatus = getTaskStatus(template.id);

              return (
                <div
                  key={template.id}
                  className={`parchment-panel p-4 ${taskStatus === "done" ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{importanceIcon[template.importance]}</span>
                        <span className="font-fantasy text-lg">{template.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded">
                          {taskStatus === "done" ? "✅ Done" : "One-off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{character?.avatarEmoji} {character?.name}</span>
                        <span>•</span>
                        <span>{domain?.icon} {skill?.name}</span>
                        <span>•</span>
                        <span className="text-xp">+{template.xpReward} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Routines (recurring) */}
      <section>
        <h2 className="font-fantasy text-xl mb-4 flex items-center gap-2">
          <span>🔄</span> Routines
        </h2>
        <div className="space-y-4">
          {routineTemplates.length === 0 ? (
            <div className="parchment-panel p-8 text-center">
              <span className="text-4xl block mb-2">📜</span>
              <p className="text-lg text-muted-foreground">No routines yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create one or browse the Guild Library!
              </p>
            </div>
          ) : (
            routineTemplates.map((template) => {
              const character = getCharacter(state, template.assignedToId);
              const skill = getSkill(state, template.skillId);
              const domain = skill ? getDomain(state, skill.domainId) : null;

              return (
                <div
                  key={template.id}
                  className={`parchment-panel p-4 ${!template.active ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{importanceIcon[template.importance]}</span>
                        <span className="font-fantasy text-lg">{template.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                          {template.recurrenceType}
                          {template.timesPerDay && template.timesPerDay > 1
                            ? ` (${template.timesPerDay}x)`
                            : ""}
                        </span>
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
                      <Switch
                        checked={template.active}
                        onCheckedChange={() => handleToggleActive(template)}
                      />
                      <Button size="icon" variant="ghost" onClick={() => openEditDialog(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </PageWrapper>
  );
}