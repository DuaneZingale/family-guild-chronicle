import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { QuickAddQuest } from "@/components/game/QuickAddQuest";
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Plus, Trash2, Edit } from "lucide-react";
import type { QuestTemplate, QuestImportance, QuestAutonomy } from "@/types/game";

export default function Routines() {
  const { state, dispatch } = useGame();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    assignedToIds: [] as string[],
    skillId: "",
    xpReward: 10,
    goldReward: 0,
    recurrenceType: "daily" as QuestTemplate["recurrenceType"],
    timesPerDay: 1,
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
    importance: "growth" as QuestImportance,
    autonomyLevel: "prompt_ok" as QuestAutonomy,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      assignedToIds: [],
      skillId: "",
      xpReward: 10,
      goldReward: 0,
      recurrenceType: "daily",
      timesPerDay: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
      importance: "growth",
      autonomyLevel: "prompt_ok",
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: QuestTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      assignedToIds: [template.assignedToId],
      skillId: template.skillId,
      xpReward: template.xpReward,
      goldReward: template.goldReward,
      recurrenceType: template.recurrenceType,
      timesPerDay: template.timesPerDay ?? 1,
      daysOfWeek: template.daysOfWeek ?? [1, 2, 3, 4, 5],
      importance: template.importance,
      autonomyLevel: template.autonomyLevel,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.assignedToIds.length === 0 || !formData.skillId) return;

    if (editingTemplate) {
      const templateData: Omit<QuestTemplate, "id"> = {
        name: formData.name,
        type: editingTemplate.type,
        assignedToId: formData.assignedToIds[0],
        skillId: formData.skillId,
        xpReward: formData.xpReward,
        goldReward: formData.goldReward,
        recurrenceType: formData.recurrenceType,
        timesPerDay: formData.timesPerDay > 1 ? formData.timesPerDay : undefined,
        daysOfWeek: formData.recurrenceType === "weekly" ? formData.daysOfWeek : undefined,
        active: editingTemplate.active,
        importance: formData.importance,
        visibility: "active",
        autonomyLevel: formData.autonomyLevel,
      };
      dispatch({
        type: "UPDATE_QUEST_TEMPLATE",
        template: { ...templateData, id: editingTemplate.id },
      });
    } else {
      for (const charId of formData.assignedToIds) {
        const templateData: Omit<QuestTemplate, "id"> = {
          name: formData.name,
          type: "recurring",
          assignedToId: charId,
          skillId: formData.skillId,
          xpReward: formData.xpReward,
          goldReward: formData.goldReward,
          recurrenceType: formData.recurrenceType,
          timesPerDay: formData.timesPerDay > 1 ? formData.timesPerDay : undefined,
          daysOfWeek: formData.recurrenceType === "weekly" ? formData.daysOfWeek : undefined,
          active: true,
          importance: formData.importance,
          visibility: "active",
          autonomyLevel: formData.autonomyLevel,
        };
        dispatch({ type: "ADD_QUEST_TEMPLATE", template: templateData });
      }
    }

    setIsDialogOpen(false);
    resetForm();
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

  const allSkills = state.skills;
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-fantasy text-xl">
              {editingTemplate ? "Edit Quest" : "New Routine"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Quest Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Brush Teeth"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Assign To</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setFormData({ ...formData, assignedToIds: state.characters.map((c) => c.id) })}
                  >
                    All
                  </Button>
                  {state.characters.some((c) => c.isKid) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setFormData({ ...formData, assignedToIds: state.characters.filter((c) => c.isKid).map((c) => c.id) })}
                    >
                      All Kids
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {state.characters.map((char) => {
                  const isSelected = formData.assignedToIds.includes(char.id);
                  return (
                    <label
                      key={char.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          setFormData({
                            ...formData,
                            assignedToIds: isSelected
                              ? formData.assignedToIds.filter((id) => id !== char.id)
                              : [...formData.assignedToIds, char.id],
                          });
                        }}
                      />
                      <span className="text-lg">{char.avatarEmoji}</span>
                      <span className="text-sm font-medium truncate">{char.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Skill</Label>
              <Select
                value={formData.skillId}
                onValueChange={(v) => setFormData({ ...formData, skillId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {allSkills.map((skill) => {
                    const domain = getDomain(state, skill.domainId);
                    return (
                      <SelectItem key={skill.id} value={skill.id}>
                        {domain?.icon} {skill.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Importance</Label>
                <Select
                  value={formData.importance}
                  onValueChange={(v) => setFormData({ ...formData, importance: v as QuestImportance })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essential">🔴 Essential</SelectItem>
                    <SelectItem value="growth">🟡 Growth</SelectItem>
                    <SelectItem value="delight">🟢 Delight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Autonomy</Label>
                <Select
                  value={formData.autonomyLevel}
                  onValueChange={(v) => setFormData({ ...formData, autonomyLevel: v as QuestAutonomy })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_start">Self Start</SelectItem>
                    <SelectItem value="prompt_ok">Prompt OK</SelectItem>
                    <SelectItem value="parent_led">Parent Led</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="xp">XP Reward</Label>
                <Input
                  id="xp"
                  type="number"
                  min={0}
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="gold">Gold Reward</Label>
                <Input
                  id="gold"
                  type="number"
                  min={0}
                  value={formData.goldReward}
                  onChange={(e) => setFormData({ ...formData, goldReward: Number(e.target.value) })}
                />
              </div>
            </div>

            {editingTemplate?.type !== "oneoff" && (
              <>
                <div>
                  <Label>Recurrence</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(v) => setFormData({ ...formData, recurrenceType: v as QuestTemplate["recurrenceType"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="times">Times per Day</Label>
                  <Input
                    id="times"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.timesPerDay}
                    onChange={(e) => setFormData({ ...formData, timesPerDay: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">e.g., 2x for morning & evening</p>
                </div>

                {formData.recurrenceType === "weekly" && (
                  <div>
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dayLabels.map((day, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const days = formData.daysOfWeek.includes(i)
                              ? formData.daysOfWeek.filter((d) => d !== i)
                              : [...formData.daysOfWeek, i];
                            setFormData({ ...formData, daysOfWeek: days });
                          }}
                          className={`px-3 py-1 rounded border transition-colors ${
                            formData.daysOfWeek.includes(i)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border hover:border-primary"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button onClick={handleSubmit} className="w-full">
              {editingTemplate
                ? "Update Quest"
                : formData.assignedToIds.length > 1
                ? `Create for ${formData.assignedToIds.length} members`
                : "Create Routine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
