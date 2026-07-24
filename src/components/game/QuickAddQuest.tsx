import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCreateQuest, useUpdateQuest } from "@/hooks/useUnifiedQuests";
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

import { Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { QuestTemplate, QuestImportance, QuestAutonomy } from "@/types/game";
import type { QuestType, FrequencyType, RitualBlock } from "@/types/unified-quests";

interface QuickAddQuestProps {
  preSelectedCharacterIds?: string[];
  preSelectedSkillId?: string;
  trigger?: React.ReactNode;
  defaultQuestType?: "training" | "side" | "guild";
  defaultRitualBlock?: RitualBlock;
  /** Legacy: maps old types */
  editTemplate?: QuestTemplate | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickAddQuest({
  preSelectedCharacterIds = [],
  preSelectedSkillId = "",
  trigger,
  defaultQuestType = "training",
  defaultRitualBlock,
  editTemplate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: QuickAddQuestProps) {
  const { membership } = useAuth();
  const familyId = membership?.familyId;

  // Fetch characters
  const { data: supabaseCharacters = [] } = useQuery({
    queryKey: ["characters", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("id, name, avatar_emoji, is_kid, family_id")
        .eq("family_id", familyId);
      if (error) throw error;
      return data;
    },
    enabled: !!familyId,
  });

  // Fetch path definitions
  const { data: pathDefinitions = [] } = useQuery({
    queryKey: ["path-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("path_definitions")
        .select("id, name, icon")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch skill definitions with path info
  const { data: skillDefinitions = [] } = useQuery({
    queryKey: ["skill-definitions-with-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_definitions")
        .select("id, name, path_id, domain_id, domain_definitions(icon, name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createQuest = useCreateQuest();
  const updateQuest = useUpdateQuest();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const isEditing = !!editTemplate;

  const [questType, setQuestType] = useState<QuestType>(defaultQuestType);
  const [name, setName] = useState("");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(preSelectedCharacterIds);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [skillId, setSkillId] = useState(preSelectedSkillId);
  const [xpReward, setXpReward] = useState(10);
  const [goldReward, setGoldReward] = useState(0);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [ritualBlock, setRitualBlock] = useState<RitualBlock | "">(defaultRitualBlock ?? "morning");
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [importance, setImportance] = useState<QuestImportance>("growth");
  const [autonomyLevel, setAutonomyLevel] = useState<QuestAutonomy>("prompt_ok");
  const [dueWindowStart, setDueWindowStart] = useState("");
  const [dueWindowEnd, setDueWindowEnd] = useState("");
  const [notifyIfIncomplete, setNotifyIfIncomplete] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const assignableCharacters = supabaseCharacters;
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isTraining = questType === "training";
  const isGuild = questType === "guild";

  // Filter skills by selected path
  const filteredSkills = useMemo(() => {
    if (!selectedPathId) return [];
    return skillDefinitions.filter((s) => s.path_id === selectedPathId);
  }, [selectedPathId, skillDefinitions]);

  // When path changes, clear skill if it doesn't belong to new path
  useEffect(() => {
    if (selectedPathId && skillId) {
      const stillValid = filteredSkills.some((s) => s.id === skillId);
      if (!stillValid) setSkillId("");
    }
  }, [selectedPathId, filteredSkills, skillId]);

  useEffect(() => {
    if (editTemplate && open) {
      const mappedType: QuestType = editTemplate.type === "recurring" ? "training"
        : editTemplate.assignedToId ? "side" : "guild";
      setQuestType(mappedType);
      setName(editTemplate.name);
      setSelectedCharacterIds(editTemplate.assignedToId ? [editTemplate.assignedToId] : []);
      setSkillId(editTemplate.skillId);
      setXpReward(editTemplate.xpReward);
      setGoldReward(editTemplate.goldReward);
      setImportance(editTemplate.importance);
      setAutonomyLevel(editTemplate.autonomyLevel);
      setNotifyIfIncomplete(editTemplate.notifyIfIncomplete ?? false);
    }
  }, [editTemplate, open]);

  function resetForm() {
    setQuestType(defaultQuestType);
    setName("");
    setSelectedCharacterIds(preSelectedCharacterIds);
    setSelectedPathId("");
    setSkillId(preSelectedSkillId);
    setXpReward(10);
    setGoldReward(0);
    setFrequencyType("daily");
    setRitualBlock(defaultRitualBlock ?? "morning");
    setTimesPerDay(1);
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setImportance("growth");
    setAutonomyLevel("prompt_ok");
    setDueWindowStart("");
    setDueWindowEnd("");
    setNotifyIfIncomplete(false);
    setAdvancedOpen(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  }

  function toggleCharacter(charId: string) {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    if (!isGuild && selectedCharacterIds.length === 0) return;

    const characterIds = isGuild ? [null] : selectedCharacterIds;

    try {
      for (const charId of characterIds) {
        const questData = {
          quest_type: questType,
          name: name.trim(),
          description: "",
          assigned_to_character_id: charId,
          character_skill_id: skillId || null,
          xp_reward: xpReward,
          gold_reward: goldReward,
          frequency_type: isTraining ? frequencyType : null,
          ritual_block: isTraining && ritualBlock ? ritualBlock : null,
          days_of_week: isTraining && frequencyType === "weekly" ? daysOfWeek : [],
          times_per_day: isTraining ? timesPerDay : 1,
          interval_days: null,
          importance,
          autonomy: autonomyLevel,
          due_start: dueWindowStart || null,
          due_end: dueWindowEnd || null,
          notify_if_incomplete: notifyIfIncomplete,
          campaign_id: null,
          step_order: null,
          active: true,
          status: "available",
          is_suggested: false,
          source_template_id: null,
        };

        if (isEditing && editTemplate) {
          await updateQuest.mutateAsync({ id: editTemplate.id, ...questData });
        } else {
          await createQuest.mutateAsync(questData as any);
        }
      }

      toast.success(isEditing ? "Quest updated!" : `Quest${characterIds.length > 1 ? "s" : ""} created!`);
      setOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Quest creation failed:", err);
      toast.error(err?.message ?? "Failed to create quest");
    }
  }

  const questTypeLabels: Record<QuestType, { icon: string; label: string }> = {
    training: { icon: "🏋️", label: "Training Quest" },
    side: { icon: "📌", label: "Side Quest" },
    guild: { icon: "⚔️", label: "Guild Quest" },
    campaign_step: { icon: "🗺️", label: "Campaign Step" },
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-fantasy text-xl">
          {isEditing ? "Edit Quest" : `New ${questTypeLabels[questType].label}`}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Step 1: Quest Type */}
        {!isEditing && (
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Step 1 — Quest Type</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {(["training", "side", "guild"] as QuestType[]).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={questType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuestType(type)}
                >
                  {questTypeLabels[type].icon} {questTypeLabels[type].label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quest Name */}
        <div>
          <Label htmlFor="qr-name">Quest Name</Label>
          <Input
            id="qr-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              isTraining ? "e.g., Brush Teeth, Read 20 mins"
                : isGuild ? "e.g., Clean the garage"
                : "e.g., Fix the fence"
            }
          />
        </div>

        {/* Character assignment (not for guild) */}
        {!isGuild && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Assign To</Label>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => setSelectedCharacterIds(assignableCharacters.map((c) => c.id))}
                  className="text-xs h-7 px-2"
                >All</Button>
                {assignableCharacters.some((c) => c.is_kid) && (
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => setSelectedCharacterIds(assignableCharacters.filter((c) => c.is_kid).map((c) => c.id))}
                    className="text-xs h-7 px-2"
                  >All Kids</Button>
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
                  <span className="text-lg">{char.avatar_emoji}</span>
                  <span className="text-sm font-medium truncate">{char.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Path */}
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Step 2 — Path</Label>
          <Select value={selectedPathId} onValueChange={(v) => setSelectedPathId(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a Path" />
            </SelectTrigger>
            <SelectContent>
              {pathDefinitions.map((path) => (
                <SelectItem key={path.id} value={path.id}>
                  {path.icon} {path.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 3: Select Skill (filtered by Path) */}
        {selectedPathId && (
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Step 3 — Skill</Label>
            {filteredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-1">No skills under this path yet.</p>
            ) : (
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a Skill" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Training: Ritual Block & Frequency */}
        {isTraining && (
          <>
            <div>
              <Label>Ritual Block</Label>
              <Select value={ritualBlock} onValueChange={(v) => setRitualBlock(v as RitualBlock)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">🌅 Morning</SelectItem>
                  <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                  <SelectItem value="evening">🌙 Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequencyType} onValueChange={(v) => setFrequencyType(v as FrequencyType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequencyType === "weekly" && (
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

            <div>
              <Label>Times per Day</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={timesPerDay}
                onChange={(e) => setTimesPerDay(Number(e.target.value))}
              />
            </div>
          </>
        )}

        {/* Step 4: XP & Gold */}
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Step 4 — Rewards</Label>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div>
              <Label>XP Reward</Label>
              <Input type="number" min={0} value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} />
            </div>
            <div>
              <Label>Gold Reward</Label>
              <Input type="number" min={0} value={goldReward} onChange={(e) => setGoldReward(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Advanced */}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Window Start</Label>
                <Input type="time" value={dueWindowStart} onChange={(e) => setDueWindowStart(e.target.value)} />
              </div>
              <div>
                <Label>Window End</Label>
                <Input type="time" value={dueWindowEnd} onChange={(e) => setDueWindowEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={notifyIfIncomplete} onCheckedChange={setNotifyIfIncomplete} />
              <Label className="cursor-pointer">Notify parent if incomplete</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!name.trim() || (!isGuild && selectedCharacterIds.length === 0)}
        >
          {isEditing
            ? "Update Quest"
            : selectedCharacterIds.length > 1
            ? `Create for ${selectedCharacterIds.length} members`
            : `Create ${questTypeLabels[questType].label}`}
        </Button>
      </div>
    </DialogContent>
  );

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
