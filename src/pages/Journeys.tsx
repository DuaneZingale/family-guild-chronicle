import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Compass, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Journey = {
  id: string;
  family_id: string;
  title: string;
  description: string;
  path_id: string | null;
  owner_character_id: string | null;
  status: string;
  created_at: string;
};

type JourneyItem = {
  id: string;
  journey_id: string;
  item_type: string;
  item_id: string;
  sort_order: number;
};

export default function Journeys() {
  const { state } = useGame();
  const { membership } = useAuth();
  const queryClient = useQueryClient();
  const familyId = membership?.familyId;
  const isParent = membership?.role === "parent" || membership?.role === "co-parent";

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pathId, setPathId] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>("");

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["journeys", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Journey[];
    },
    enabled: !!familyId,
  });

  const { data: journeyItems = [] } = useQuery({
    queryKey: ["journey_items", familyId],
    queryFn: async () => {
      if (!familyId || journeys.length === 0) return [];
      const journeyIds = journeys.map((j) => j.id);
      const { data, error } = await supabase
        .from("journey_items")
        .select("*")
        .in("journey_id", journeyIds)
        .order("sort_order");
      if (error) throw error;
      return data as JourneyItem[];
    },
    enabled: !!familyId && journeys.length > 0,
  });

  const createJourney = useMutation({
    mutationFn: async () => {
      if (!familyId) throw new Error("No family");
      const { error } = await supabase.from("journeys").insert({
        family_id: familyId,
        title: title.trim(),
        description: description.trim(),
        path_id: pathId || null,
        owner_character_id: ownerId || null,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      setPathId("");
      setOwnerId("");
    },
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeJourneys = journeys.filter((j) => j.status === "active");
  const completedJourneys = journeys.filter((j) => j.status === "completed");

  const getJourneyProgress = (journeyId: string) => {
    const items = journeyItems.filter((ji) => ji.journey_id === journeyId);
    if (items.length === 0) return { total: 0, done: 0, percent: 0 };
    // Count completed items by checking quest instances or campaign status
    let done = 0;
    for (const item of items) {
      if (item.item_type === "campaign") {
        const campaign = state.campaigns.find((c) => c.id === item.item_id);
        if (campaign?.status === "complete") done++;
      } else if (item.item_type === "quest") {
        const instances = state.questInstances.filter(
          (qi) => qi.templateId === item.item_id && qi.status === "done"
        );
        if (instances.length > 0) done++;
      }
    }
    return { total: items.length, done, percent: items.length > 0 ? (done / items.length) * 100 : 0 };
  };

  return (
    <PageWrapper
      title="Journeys"
      subtitle="Long-term growth arcs and personal quests"
      action={
        isParent ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Journey
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-fantasy text-xl">New Journey</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Journey Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Learn Woodworking, Reach $10k/month"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this journey about?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Path (optional)</Label>
                  <Select value={pathId} onValueChange={setPathId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to a Path" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No path</SelectItem>
                      {state.domains.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.icon} The Path Of {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Owner (optional)</Label>
                  <Select value={ownerId} onValueChange={setOwnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Shared (all members)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Shared Journey</SelectItem>
                      {state.characters.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.avatarEmoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createJourney.mutate()}
                  className="w-full"
                  disabled={!title.trim() || createJourney.isPending}
                >
                  {createJourney.isPending ? "Creating..." : "Begin Journey"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2 animate-pulse">🧭</span>
          <p className="text-muted-foreground">Loading journeys...</p>
        </div>
      ) : journeys.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">🧭</span>
          <p className="text-lg text-muted-foreground">No journeys yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start a journey to track long-term growth — like learning a new skill or saving for a goal.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeJourneys.map((journey) => {
            const progress = getJourneyProgress(journey.id);
            const isExpanded = expanded.has(journey.id);
            const owner = journey.owner_character_id
              ? state.characters.find((c) => c.id === journey.owner_character_id)
              : null;
            const path = journey.path_id
              ? state.domains.find((d) => d.id === journey.path_id)
              : null;
            const items = journeyItems.filter((ji) => ji.journey_id === journey.id);

            return (
              <div key={journey.id} className="parchment-panel overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/5 transition-colors"
                  onClick={() => toggleExpand(journey.id)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Compass className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-fantasy text-lg leading-tight">{journey.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {owner && <span>{owner.avatarEmoji} {owner.name}</span>}
                      {path && <span>{path.icon} The Path Of {path.name}</span>}
                      {progress.total > 0 && (
                        <span>{progress.done}/{progress.total} complete</span>
                      )}
                    </div>
                    {progress.total > 0 && (
                      <Progress value={progress.percent} className="h-2 mt-2 max-w-[200px]" />
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {journey.description && (
                      <p className="text-sm text-muted-foreground">{journey.description}</p>
                    )}
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No quests or campaigns linked yet. Link existing quests or campaigns to track progress.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => {
                          const label =
                            item.item_type === "campaign"
                              ? state.campaigns.find((c) => c.id === item.item_id)?.name
                              : state.questTemplates.find((t) => t.id === item.item_id)?.name;
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span>{item.item_type === "campaign" ? "🗺️" : "📜"}</span>
                              <span>{label ?? "Unknown"}</span>
                              <span className="text-xs text-muted-foreground capitalize">({item.item_type})</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {completedJourneys.length > 0 && (
            <div className="mt-6">
              <h3 className="font-fantasy text-sm text-muted-foreground uppercase tracking-widest mb-3">
                Completed Journeys
              </h3>
              {completedJourneys.map((journey) => (
                <div key={journey.id} className="parchment-panel p-3 opacity-70 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <span className="font-fantasy flex-1">{journey.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
