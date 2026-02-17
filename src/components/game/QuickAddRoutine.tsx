import { useState } from "react";
import { useGame } from "@/context/GameContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { getDomain } from "@/lib/gameLogic";
import { Plus } from "lucide-react";
import type { QuestImportance, QuestAutonomy, QuestTemplate } from "@/types/game";

interface QuickAddRoutineProps {
  /** Pre-select these character IDs */
  preSelectedCharacterIds?: string[];
  /** Pre-select this skill */
  preSelectedSkillId?: string;
  /** Custom trigger element — defaults to a + button */
  trigger?: React.ReactNode;
}

export function QuickAddRoutine({
  preSelectedCharacterIds = [],
  preSelectedSkillId = "",
  trigger,
}: QuickAddRoutineProps) {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(preSelectedCharacterIds);
  const [skillId, setSkillId] = useState(preSelectedSkillId);
  const [xpReward, setXpReward] = useState(10);
  const [goldReward, setGoldReward] = useState(0);
  const [recurrenceType, setRecurrenceType] = useState<QuestTemplate["recurrenceType"]>("daily");
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [importance, setImportance] = useState<QuestImportance>("growth");
  const [autonomyLevel, setAutonomyLevel] = useState<QuestAutonomy>("prompt_ok");

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function resetForm() {
    setName("");
    setSelectedCharacterIds(preSelectedCharacterIds);
    setSkillId(preSelectedSkillId);
    setXpReward(10);
    setGoldReward(0);
    setRecurrenceType("daily");
    setTimesPerDay(1);
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setImportance("growth");
    setAutonomyLevel("prompt_ok");
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      // Re-apply preselected values when opening
      if (preSelectedCharacterIds.length > 0) setSelectedCharacterIds(preSelectedCharacterIds);
      if (preSelectedSkillId) setSkillId(preSelectedSkillId);
    } else {
      resetForm();
    }
  }

  function toggleCharacter(charId: string) {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  }

  function selectAll() {
    setSelectedCharacterIds(state.characters.map((c) => c.id));
  }

  function selectAllKids() {
    setSelectedCharacterIds(state.characters.filter((c) => c.isKid).map((c) => c.id));
  }

  function handleSubmit() {
    if (!name.trim() || selectedCharacterIds.length === 0 || !skillId) return;

    // Create one template per selected character
    for (const charId of selectedCharacterIds) {
      const templateData: Omit<QuestTemplate, "id"> = {
        name: name.trim(),
        type: "recurring",
        assignedToId: charId,
        skillId,
        xpReward,
        goldReward,
        recurrenceType,
        timesPerDay: recurrenceType === "daily" ? timesPerDay : undefined,
        daysOfWeek: recurrenceType === "weekly" ? daysOfWeek : undefined,
        active: true,
        importance,
        visibility: "active",
        autonomyLevel,
      };
      dispatch({ type: "ADD_QUEST_TEMPLATE", template: templateData });
    }

    setOpen(false);
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Routine
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-xl">New Routine</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="qr-name">Quest Name</Label>
            <Input
              id="qr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Brush Teeth, Read 20 mins"
            />
          </div>

          {/* Multi-character selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Assign To</Label>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7 px-2">
                  All
                </Button>
                {state.characters.some((c) => c.isKid) && (
                  <Button type="button" variant="ghost" size="sm" onClick={selectAllKids} className="text-xs h-7 px-2">
                    All Kids
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {state.characters.map((char) => (
                <label
                  key={char.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedCharacterIds.includes(char.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedCharacterIds.includes(char.id)}
                    onCheckedChange={() => toggleCharacter(char.id)}
                  />
                  <span className="text-lg">{char.avatarEmoji}</span>
                  <span className="text-sm font-medium truncate">{char.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skill */}
          <div>
            <Label>Skill</Label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {state.skills.map((skill) => {
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

          {/* Importance & Autonomy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Importance</Label>
              <Select value={importance} onValueChange={(v) => setImportance(v as QuestImportance)}>
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
              <Select value={autonomyLevel} onValueChange={(v) => setAutonomyLevel(v as QuestAutonomy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self_start">Self Start</SelectItem>
                  <SelectItem value="prompt_ok">Prompt OK</SelectItem>
                  <SelectItem value="parent_led">Parent Led</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* XP & Gold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>XP Reward</Label>
              <Input type="number" min={0} value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} />
            </div>
            <div>
              <Label>Gold Reward</Label>
              <Input type="number" min={0} value={goldReward} onChange={(e) => setGoldReward(Number(e.target.value))} />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <Label>Recurrence</Label>
            <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as QuestTemplate["recurrenceType"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrenceType === "daily" && (
            <div>
              <Label>Times per Day</Label>
              <Input type="number" min={1} max={5} value={timesPerDay} onChange={(e) => setTimesPerDay(Number(e.target.value))} />
            </div>
          )}

          {recurrenceType === "weekly" && (
            <div>
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dayLabels.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDaysOfWeek((prev) => prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i])}
                    className={`px-3 py-1 rounded border transition-colors ${
                      daysOfWeek.includes(i)
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

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full" disabled={!name.trim() || selectedCharacterIds.length === 0 || !skillId}>
            {selectedCharacterIds.length > 1
              ? `Create for ${selectedCharacterIds.length} members`
              : "Create Routine"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
