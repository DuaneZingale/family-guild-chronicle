import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface KidCharacter {
  id: string;
  name: string;
  avatar_emoji: string;
  family_id: string;
}

export default function KidPinLogin() {
  const [kids, setKids] = useState<KidCharacter[]>([]);
  const [selectedKid, setSelectedKid] = useState<KidCharacter | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingKids, setLoadingKids] = useState(true);
  const { enterKidPinMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch all kid characters that have PINs set up
    async function fetchKids() {
      const { data } = await supabase
        .from("kid_pins")
        .select("character_id, characters(id, name, avatar_emoji, family_id)")
        .limit(20);

      if (data) {
        const kidList = data
          .map((row: any) => row.characters)
          .filter(Boolean) as KidCharacter[];
        setKids(kidList);
      }
      setLoadingKids(false);
    }
    fetchKids();
  }, []);

  async function handlePinSubmit() {
    if (!selectedKid || pin.length !== 4) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("verify_kid_pin", {
      p_character_id: selectedKid.id,
      p_pin: pin,
    });

    setLoading(false);

    if (error || !data) {
      toast({ title: "Wrong PIN", description: "Try again!", variant: "destructive" });
      setPin("");
      return;
    }

    enterKidPinMode(selectedKid.id, selectedKid.family_id);
    navigate("/");
  }

  function handleDigit(d: string) {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        // Auto-submit after brief delay
        setTimeout(() => {
          setPin(next);
        }, 100);
      }
    }
  }

  if (loadingKids) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="parchment-panel w-full max-w-md p-8 space-y-6">
        {!selectedKid ? (
          <>
            <div className="text-center space-y-2">
              <span className="text-5xl">🎮</span>
              <h1 className="text-2xl font-fantasy text-foreground">Who's Playing?</h1>
              <p className="text-muted-foreground text-sm">Tap your character</p>
            </div>

            {kids.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No kid PINs set up yet.</p>
                <p className="text-sm mt-2">A parent needs to set up a PIN first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => setSelectedKid(kid)}
                    className="parchment-panel p-4 text-center hover:scale-105 transition-transform"
                  >
                    <span className="text-4xl block mb-2">{kid.avatar_emoji}</span>
                    <span className="font-fantasy text-sm text-foreground">{kid.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <span className="text-5xl">{selectedKid.avatar_emoji}</span>
              <h1 className="text-2xl font-fantasy text-foreground">{selectedKid.name}</h1>
              <p className="text-muted-foreground text-sm">Enter your secret PIN</p>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 border-primary transition-all ${
                    pin.length > i ? "bg-primary scale-110" : ""
                  }`}
                />
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d) =>
                d === "" ? (
                  <div key="empty" />
                ) : d === "⌫" ? (
                  <button
                    key="back"
                    onClick={() => setPin((p) => p.slice(0, -1))}
                    className="text-2xl p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    ⌫
                  </button>
                ) : (
                  <button
                    key={d}
                    onClick={() => handleDigit(d)}
                    className="text-2xl font-fantasy p-3 rounded-lg hover:bg-muted transition-colors border border-border"
                  >
                    {d}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedKid(null);
                  setPin("");
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={pin.length !== 4 || loading}
                onClick={handlePinSubmit}
              >
                {loading ? "Checking…" : "Enter ⚔️"}
              </Button>
            </div>
          </>
        )}

        <div className="text-center border-t border-border pt-4">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Parent / Email Login
          </Link>
        </div>
      </div>
    </div>
  );
}
