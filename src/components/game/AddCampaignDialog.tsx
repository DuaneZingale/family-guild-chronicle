import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface StepDraft {
  name: string;
  assignedToId: string;
  skillId: string;
  xpReward: number;
  goldReward: number;
}

const emptyStep = (): StepDraft => ({
  name: "",
  assignedToId: "",
  skillId: "",
  xpReward: 15,
  goldReward: 0,
});

export function AddCampaignDialog() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([emptyStep()]);

  const handleAddStep = () => setSteps([...steps, emptyStep()]);

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const canSubmit =
    name.trim() &&
    steps.length > 0 &&
    steps.every((s) => s.name.trim() && s.assignedToId && s.skillId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    dispatch({
      type: "ADD_CAMPAIGN",
      campaign: { name: name.trim(), description: description.trim(), status: "active" },
      steps: steps.map((s, i) => ({
        order: i + 1,
        name: s.name.trim(),
        assignedToId: s.assignedToId,
        skillId: s.skillId,
        xpReward: s.xpReward,
        goldReward: s.goldReward,
        status: i === 0 ? ("available" as const) : ("locked" as const),
      })),
    });
    setName("");
    setDescription("");
    setSteps([emptyStep()]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-xl">🗺️ Create Campaign</DialogTitle>
          <DialogDescription>A multi-step adventure with sequential goals.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Build Mom's Desk" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this adventure about?" />
          </div>

          <div>
            <Label className="mb-2 block">Steps</Label>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                    {steps.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRemoveStep(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(i, { name: e.target.value })}
                    placeholder="Step name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Assigned To</Label>
                      <Select value={step.assignedToId} onValueChange={(v) => updateStep(i, { assignedToId: v })}>
                        <SelectTrigger><SelectValue placeholder="Who?" /></SelectTrigger>
                        <SelectContent>
                          {state.characters.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.avatarEmoji} {c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Skill</Label>
                      <Select value={step.skillId} onValueChange={(v) => updateStep(i, { skillId: v })}>
                        <SelectTrigger><SelectValue placeholder="Skill" /></SelectTrigger>
                        <SelectContent>
                          {state.skills.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">XP Reward</Label>
                      <Input type="number" value={step.xpReward} onChange={(e) => updateStep(i, { xpReward: +e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Gold Reward</Label>
                      <Input type="number" value={step.goldReward} onChange={(e) => updateStep(i, { goldReward: +e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAddStep}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
            </Button>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit}>
            Create Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
