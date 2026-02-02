import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getCharacter, getSkill, getDomain } from "@/lib/gameLogic";
import { Plus, Trash2, Edit } from "lucide-react";
import type { QuestTemplate } from "@/types/game";

export default function Routines() {
  const { state, dispatch } = useGame();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    assignedToId: "",
    skillId: "",
    xpReward: 10,
    goldReward: 0,
    recurrenceType: "daily" as QuestTemplate["recurrenceType"],
    timesPerDay: 1,
    daysOfWeek: [1, 2, 3, 4, 5] as number[],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      assignedToId: "",
      skillId: "",
      xpReward: 10,
      goldReward: 0,
      recurrenceType: "daily",
      timesPerDay: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: QuestTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      assignedToId: template.assignedToId,
      skillId: template.skillId,
      xpReward: template.xpReward,
      goldReward: template.goldReward,
      recurrenceType: template.recurrenceType,
      timesPerDay: template.timesPerDay ?? 1,
      daysOfWeek: template.daysOfWeek ?? [1, 2, 3, 4, 5],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.assignedToId || !formData.skillId) return;

    const templateData: Omit<QuestTemplate, "id"> = {
      name: formData.name,
      type: "recurring",
      assignedToId: formData.assignedToId,
      skillId: formData.skillId,
      xpReward: formData.xpReward,
      goldReward: formData.goldReward,
      recurrenceType: formData.recurrenceType,
      timesPerDay: formData.recurrenceType === "daily" ? formData.timesPerDay : undefined,
      daysOfWeek: formData.recurrenceType === "weekly" ? formData.daysOfWeek : undefined,
      active: true,
    };

    if (editingTemplate) {
      dispatch({
        type: "UPDATE_QUEST_TEMPLATE",
        template: { ...templateData, id: editingTemplate.id, active: editingTemplate.active },
      });
    } else {
      dispatch({ type: "ADD_QUEST_TEMPLATE", template: templateData });
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

  // Get skills for selected character
  const availableSkills = formData.assignedToId
    ? state.skills.filter((s) => s.ownerId === formData.assignedToId)
    : [];

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <PageWrapper title="Routines" subtitle="Manage recurring quests and habits">
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Routine
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-fantasy text-xl">
              {editingTemplate ? "Edit Routine" : "New Routine"}
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
              <Label>Assigned To</Label>
              <Select
                value={formData.assignedToId}
                onValueChange={(v) => setFormData({ ...formData, assignedToId: v, skillId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  {state.characters.map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      {char.avatarEmoji} {char.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Skill</Label>
              <Select
                value={formData.skillId}
                onValueChange={(v) => setFormData({ ...formData, skillId: v })}
                disabled={!formData.assignedToId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((skill) => {
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

            <div>
              <Label>Recurrence</Label>
              <Select
                value={formData.recurrenceType}
                onValueChange={(v) => setFormData({ ...formData, recurrenceType: v as QuestTemplate["recurrenceType"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recurrenceType === "daily" && (
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
              </div>
            )}

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

            <Button onClick={handleSubmit} className="w-full">
              {editingTemplate ? "Update Routine" : "Create Routine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing routines */}
      <div className="space-y-4">
        {state.questTemplates.length === 0 ? (
          <div className="parchment-panel p-8 text-center">
            <span className="text-4xl block mb-2">📜</span>
            <p className="text-lg text-muted-foreground">No routines yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one to start generating daily quests!
            </p>
          </div>
        ) : (
          state.questTemplates.map((template) => {
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
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageWrapper>
  );
}
