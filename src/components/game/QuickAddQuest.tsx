import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDomain, generateId, formatDate } from "@/lib/gameLogic";
import { Plus, CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { QuestImportance, QuestAutonomy, QuestTemplate } from "@/types/game";

interface QuickAddQuestProps {
  preSelectedCharacterIds?: string[];
  preSelectedSkillId?: string;
  trigger?: React.ReactNode;
  defaultQuestType?: "routine" | "task";
  /** Pass an existing template to open in edit mode */
  editTemplate?: QuestTemplate | null;
  /** Controlled open state for edit mode */
  open?: boolean;
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void;
}

export function QuickAddQuest({
  preSelectedCharacterIds = [],
  preSelectedSkillId = "",
  trigger,
  defaultQuestType = "routine",
  editTemplate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: QuickAddQuestProps) {
  const { state, dispatch } = useGame();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const isEditing = !!editTemplate;

  const [questType, setQuestType] = useState<"routine" | "task">(defaultQuestType);
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
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueWindowStart, setDueWindowStart] = useState("");
  const [dueWindowEnd, setDueWindowEnd] = useState("");
  const [notifyIfIncomplete, setNotifyIfIncomplete] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const assignableCharacters = state.characters.filter((c) => c.id !== "guild");
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Populate form when editing
  useEffect(() => {
    if (editTemplate && open) {
      setQuestType(editTemplate.type === "oneoff" ? "task" : "routine");
      setName(editTemplate.name);
      setSelectedCharacterIds([editTemplate.assignedToId]);
      setSkillId(editTemplate.skillId);
      setXpReward(editTemplate.xpReward);
      setGoldReward(editTemplate.goldReward);
      setRecurrenceType(editTemplate.recurrenceType);
      setTimesPerDay(editTemplate.timesPerDay ?? 1);
      setDaysOfWeek(editTemplate.daysOfWeek ?? [1, 2, 3, 4, 5]);
      setImportance(editTemplate.importance);
      setAutonomyLevel(editTemplate.autonomyLevel);
      setDueWindowStart(editTemplate.dueWindow?.start ?? "");
      setDueWindowEnd(editTemplate.dueWindow?.end ?? "");
      setNotifyIfIncomplete(editTemplate.notifyIfIncomplete ?? false);
      // Open advanced section if there are advanced values set
      if (editTemplate.dueWindow?.start || editTemplate.dueWindow?.end || editTemplate.notifyIfIncomplete) {
        setAdvancedOpen(true);
      }
    }
  }, [editTemplate, open]);

  function resetForm() {
    setQuestType(defaultQuestType);
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
    setDueDate(undefined);
    setDueWindowStart("");
    setDueWindowEnd("");
    setNotifyIfIncomplete(false);
    setAdvancedOpen(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && !isEditing) {
      if (preSelectedCharacterIds.length > 0) setSelectedCharacterIds(preSelectedCharacterIds);
      if (preSelectedSkillId) setSkillId(preSelectedSkillId);
    }
    if (!isOpen) {
      resetForm();
    }
  }

  function toggleCharacter(charId: string) {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  }

  function handleSubmitClean() {
    if (!name.trim() || selectedCharacterIds.length === 0 || !skillId) return;

    const hasDueWindow = dueWindowStart || dueWindowEnd;
    const instanceDueDate = dueDate ? formatDate(dueDate) : formatDate(new Date());

    const buildTemplateData = (charId: string): Omit<QuestTemplate, "id"> => ({
      name: name.trim(),
      type: isOneoff ? "oneoff" : "recurring",
      assignedToId: charId,
      skillId,
      xpReward,
      goldReward,
      recurrenceType: isOneoff ? "none" : recurrenceType,
      timesPerDay: !isOneoff && timesPerDay > 1 ? timesPerDay : undefined,
      daysOfWeek: !isOneoff && recurrenceType === "weekly" ? daysOfWeek : undefined,
      active: true,
      importance,
      visibility: "active",
      autonomyLevel,
      ...(hasDueWindow ? { dueWindow: { start: dueWindowStart, end: dueWindowEnd } } : {}),
      notifyIfIncomplete: notifyIfIncomplete || undefined,
    });

    if (isEditing && editTemplate) {
      // Update the original template with the first selected character
      const templateData: QuestTemplate = {
        ...editTemplate,
        ...buildTemplateData(selectedCharacterIds[0]),
        id: editTemplate.id,
      };
      dispatch({ type: "UPDATE_QUEST_TEMPLATE", template: templateData });

      // Create new templates for any additionally selected characters
      for (let i = 1; i < selectedCharacterIds.length; i++) {
        const newTemplate = buildTemplateData(selectedCharacterIds[i]);
        if (isOneoff) {
          dispatch({
            type: "ADD_ONEOFF_TASK",
            template: newTemplate,
            dueDate: instanceDueDate,
          } as any);
        } else {
          dispatch({ type: "ADD_QUEST_TEMPLATE", template: newTemplate });
        }
      }
    } else {
      // Create new templates for all selected characters
      for (const charId of selectedCharacterIds) {
        const newTemplate = buildTemplateData(charId);
        if (isOneoff) {
          dispatch({
            type: "ADD_ONEOFF_TASK",
            template: newTemplate,
            dueDate: instanceDueDate,
          } as any);
        } else {
          dispatch({ type: "ADD_QUEST_TEMPLATE", template: newTemplate });
        }
      }
    }

    setOpen(false);
    resetForm();
  }

  const isOneoff = isEditing ? editTemplate?.type === "oneoff" : questType === "task";
  const isRoutine = !isOneoff;

  const dialogContent = (
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-fantasy text-xl">
          {isEditing ? "Edit Quest" : `New ${questType === "task" ? "Guild Task" : "Daily Quest"}`}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Quest Type Toggle — only for new quests */}
        {!isEditing && (
          <div>
            <Label>Quest Type</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={questType === "routine" ? "default" : "outline"}
                size="sm"
                onClick={() => setQuestType("routine")}
              >
                🔄 Daily Quest
              </Button>
              <Button
                type="button"
                variant={questType === "task" ? "default" : "outline"}
                size="sm"
                onClick={() => setQuestType("task")}
              >
                ⚔️ Guild Task
              </Button>
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <Label htmlFor="qr-name">Quest Name</Label>
          <Input
            id="qr-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              isOneoff
                ? "e.g., Clean out the garage"
                : "e.g., Brush Teeth, Read 20 mins"
            }
          />
        </div>

        {/* Multi-character selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Assign To</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCharacterIds(assignableCharacters.map((c) => c.id))}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              {assignableCharacters.some((c) => c.isKid) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedCharacterIds(assignableCharacters.filter((c) => c.isKid).map((c) => c.id))
                  }
                  className="text-xs h-7 px-2"
                >
                  All Kids
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {assignableCharacters.map((char) => (
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

        {/* Task: Due Date — only for new tasks */}
        {isOneoff && !isEditing && (
          <div>
            <Label>Due Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Today (default)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Routine: Recurrence */}
        {isRoutine && (
          <>
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

            {/* Times per day */}
            <div>
              <Label>Times per Day</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={timesPerDay}
                onChange={(e) => setTimesPerDay(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                e.g., 2x for morning & evening
              </p>
            </div>

            {recurrenceType === "weekly" && (
              <div>
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dayLabels.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setDaysOfWeek((prev) =>
                          prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
                        )
                      }
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
          </>
        )}

        {/* Advanced Section */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
              Advanced Options
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Window Start</Label>
                <Input
                  type="time"
                  value={dueWindowStart}
                  onChange={(e) => setDueWindowStart(e.target.value)}
                  placeholder="07:00"
                />
              </div>
              <div>
                <Label>Window End</Label>
                <Input
                  type="time"
                  value={dueWindowEnd}
                  onChange={(e) => setDueWindowEnd(e.target.value)}
                  placeholder="08:00"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete on time for bonus! Set a window to encourage timely completion.
            </p>
            <div className="flex items-center gap-3">
              <Switch
                checked={notifyIfIncomplete}
                onCheckedChange={setNotifyIfIncomplete}
              />
              <Label className="cursor-pointer">Notify parent if incomplete</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit */}
        <Button
          onClick={handleSubmitClean}
          className="w-full"
          disabled={!name.trim() || selectedCharacterIds.length === 0 || !skillId}
        >
          {isEditing
            ? "Update Quest"
            : selectedCharacterIds.length > 1
            ? `Create for ${selectedCharacterIds.length} members`
            : isOneoff
            ? "Create Guild Task"
            : "Create Daily Quest"}
        </Button>
      </div>
    </DialogContent>
  );

  // If controlled (edit mode), render without trigger
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Quest
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}