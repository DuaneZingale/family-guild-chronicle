import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuildSummaryStrip() {
  const navigate = useNavigate();
  const { membership } = useAuth();
  const familyId = membership?.familyId;

  const { data: stats } = useQuery({
    queryKey: ["guild-summary", familyId],
    queryFn: async () => {
      if (!familyId) return null;

      const [xpRes, charRes, campRes] = await Promise.all([
        supabase
          .from("xp_events")
          .select("xp, gold")
          .eq("family_id", familyId),
        supabase
          .from("characters")
          .select("gold")
          .eq("family_id", familyId),
        supabase
          .from("campaigns")
          .select("id")
          .eq("family_id", familyId)
          .eq("status", "active"),
      ]);

      const totalXP = (xpRes.data ?? []).reduce((sum, e) => sum + e.xp, 0);
      const totalGold = (charRes.data ?? []).reduce((sum, c) => sum + c.gold, 0);
      const activeCampaigns = campRes.data?.length ?? 0;

      return { totalXP, totalGold, activeCampaigns };
    },
    enabled: !!familyId,
  });

  return (
    <div className="parchment-panel p-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="text-primary font-semibold">⚡ {(stats?.totalXP ?? 0).toLocaleString()}</span>
          <span className="text-muted-foreground">Guild XP</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold">💰 {stats?.totalGold ?? 0}</span>
          <span className="text-muted-foreground">Gold</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold">⚔️ {stats?.activeCampaigns ?? 0}</span>
          <span className="text-muted-foreground">Campaigns</span>
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/guild")}
        className="shrink-0"
      >
        <Shield className="h-4 w-4 mr-1" />
        Enter Guild Hall
      </Button>
    </div>
  );
}
