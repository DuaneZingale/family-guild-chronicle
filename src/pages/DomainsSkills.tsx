import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type SkillDef = Tables<"skill_definitions">;
type PathDef = Tables<"path_definitions">;
type XPEvent = Tables<"xp_events">;
type CharacterSkill = Tables<"character_skills">;
type Character = Tables<"characters">;

const PATH_COLORS: Record<string, string> = {
  care: "from-red-500/20 to-red-900/10 border-red-500/30",
  curiosity: "from-blue-500/20 to-blue-900/10 border-blue-500/30",
  craft: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30",
  contribution: "from-orange-500/20 to-orange-900/10 border-orange-500/30",
  connection: "from-pink-500/20 to-pink-900/10 border-pink-500/30",
  wealth: "from-yellow-500/20 to-yellow-900/10 border-yellow-500/30",
  adventure: "from-purple-500/20 to-purple-900/10 border-purple-500/30",
};

const SKILL_GLOW: Record<string, string> = {
  care: "shadow-red-500/30",
  curiosity: "shadow-blue-500/30",
  craft: "shadow-emerald-500/30",
  contribution: "shadow-orange-500/30",
  connection: "shadow-pink-500/30",
  wealth: "shadow-yellow-500/30",
  adventure: "shadow-purple-500/30",
};

function getSkillLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function getXPProgress(xp: number): number {
  return (xp % 100);
}

export default function PathsSkills() {
  const { membership } = useAuth();
  const familyId = membership?.familyId;

  // Fetch paths
  const { data: paths = [] } = useQuery({
    queryKey: ["path_definitions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("path_definitions")
        .select("*")
        .order("sort_order");
      return (data ?? []) as PathDef[];
    },
  });

  // Fetch skill definitions
  const { data: skillDefs = [] } = useQuery({
    queryKey: ["skill_definitions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("skill_definitions")
        .select("*")
        .order("name");
      return (data ?? []) as SkillDef[];
    },
  });

  // Fetch characters
  const { data: characters = [] } = useQuery({
    queryKey: ["characters", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data } = await supabase
        .from("characters")
        .select("*")
        .eq("family_id", familyId);
      return (data ?? []) as Character[];
    },
    enabled: !!familyId,
  });

  // Fetch character_skills for this family
  const { data: charSkills = [] } = useQuery({
    queryKey: ["character_skills", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data } = await supabase
        .from("character_skills")
        .select("*")
        .eq("family_id", familyId);
      return (data ?? []) as CharacterSkill[];
    },
    enabled: !!familyId,
  });

  // Fetch XP events for this family
  const { data: xpEvents = [] } = useQuery({
    queryKey: ["xp_events", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      const { data } = await supabase
        .from("xp_events")
        .select("*")
        .eq("family_id", familyId);
      return (data ?? []) as XPEvent[];
    },
    enabled: !!familyId,
  });

  // Selected character
  const kidCharacters = characters.filter((c) => c.is_kid);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const activeCharId = selectedCharId ?? kidCharacters[0]?.id ?? characters[0]?.id;

  // Compute XP per character_skill_id
  const xpByCharSkill = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ev of xpEvents) {
      if (ev.character_id === activeCharId && ev.character_skill_id) {
        map[ev.character_skill_id] = (map[ev.character_skill_id] || 0) + ev.xp;
      }
    }
    return map;
  }, [xpEvents, activeCharId]);

  // Compute recent XP (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentXPByCharSkill = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ev of xpEvents) {
      if (
        ev.character_id === activeCharId &&
        ev.character_skill_id &&
        new Date(ev.ts).getTime() > weekAgo
      ) {
        map[ev.character_skill_id] = (map[ev.character_skill_id] || 0) + ev.xp;
      }
    }
    return map;
  }, [xpEvents, activeCharId, weekAgo]);

  // Map character_skill -> skill_definition_id for the active character
  const charSkillMap = useMemo(() => {
    const map: Record<string, { charSkillId: string; skillDefId: string }[]> = {};
    for (const cs of charSkills) {
      if (cs.character_id === activeCharId) {
        const pathId = skillDefs.find((sd) => sd.id === cs.skill_definition_id)?.path_id;
        if (pathId) {
          if (!map[pathId]) map[pathId] = [];
          map[pathId].push({ charSkillId: cs.id, skillDefId: cs.skill_definition_id });
        }
      }
    }
    return map;
  }, [charSkills, activeCharId, skillDefs]);

  // Group skill definitions by path
  const skillsByPath = useMemo(() => {
    const map: Record<string, SkillDef[]> = {};
    for (const sd of skillDefs) {
      const pid = sd.path_id || sd.domain_id;
      if (!map[pid]) map[pid] = [];
      map[pid].push(sd);
    }
    return map;
  }, [skillDefs]);

  // Compute path-level totals
  const pathTotalXP = useMemo(() => {
    const map: Record<string, number> = {};
    for (const path of paths) {
      const entries = charSkillMap[path.id] || [];
      let total = 0;
      for (const e of entries) {
        total += xpByCharSkill[e.charSkillId] || 0;
      }
      map[path.id] = total;
    }
    return map;
  }, [paths, charSkillMap, xpByCharSkill]);

  const activeChar = characters.find((c) => c.id === activeCharId);

  return (
    <PageWrapper
      title="The Seven Paths"
      subtitle="Skill trees of growth — track mastery across all paths"
    >
      {/* Character selector */}
      {characters.length > 0 && (
        <div className="mb-8">
          <h2 className="font-fantasy text-lg mb-3 text-muted-foreground">Select Adventurer</h2>
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                  activeCharId === char.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{char.avatar_emoji}</span>
                <span className="font-medium">{char.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paths */}
      {paths.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">⚔️</span>
          <p className="text-lg text-muted-foreground">Loading paths...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {paths.map((path) => {
            const skills = skillsByPath[path.id] || [];
            const totalXP = pathTotalXP[path.id] || 0;
            const pathLevel = Math.floor(totalXP / 500) + 1;
            const entries = charSkillMap[path.id] || [];

            return (
              <div key={path.id} className="space-y-4">
                {/* Path header */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{path.icon}</span>
                  <div className="flex-1">
                    <h2 className="font-fantasy text-2xl">The Path Of {path.name.replace("Path of ", "")}</h2>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="font-fantasy text-lg text-primary">Level {pathLevel}</div>
                    <div className="xp-bar w-full mt-1.5">
                      <div className="xp-bar-fill" style={{ width: `${((totalXP % 500) / 500) * 100}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{totalXP % 500} / 500 XP</div>
                  </div>
                </div>

                {/* Skills grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {skills.map((skillDef) => {
                    const charSkillEntry = entries.find((e) => e.skillDefId === skillDef.id);
                    const xp = charSkillEntry ? (xpByCharSkill[charSkillEntry.charSkillId] || 0) : 0;
                    const recentXP = charSkillEntry ? (recentXPByCharSkill[charSkillEntry.charSkillId] || 0) : 0;
                    const level = getSkillLevel(xp);
                    const progress = getXPProgress(xp);

                    return (
                      <div
                        key={skillDef.id}
                        className={cn(
                          "skill-tree-panel relative overflow-hidden",
                          "bg-gradient-to-br border",
                          PATH_COLORS[path.id] || ""
                        )}
                      >
                        {/* Level badge */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-fantasy text-base tracking-wide">{skillDef.name}</h4>
                          <span
                            className={cn(
                              "text-sm font-bold px-2 py-0.5 rounded-full bg-muted text-foreground",
                              level > 1 && `shadow-lg ${SKILL_GLOW[path.id] || ""}`
                            )}
                          >
                            {level}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skillDef.description}</p>

                        {/* XP bar */}
                        <div className="xp-bar-glow">
                          <div
                            className="xp-bar-glow-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
                          <span>{progress} / 100 XP</span>
                          {recentXP > 0 && (
                            <span className="text-xp font-semibold">+{recentXP} this week</span>
                          )}
                        </div>
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
