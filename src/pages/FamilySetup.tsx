import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AVATAR_OPTIONS = ["🧙‍♂️", "🧝‍♀️", "🏹", "🗡️", "🛡️", "🧙", "🧚", "🦊", "🐉", "🦅", "🌟", "⚡", "🔥", "🌊"];

export default function FamilySetup() {
  const { user, refreshMembership } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [familyName, setFamilyName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [roleClass, setRoleClass] = useState("Adventurer");
  const [avatarEmoji, setAvatarEmoji] = useState("🧙‍♂️");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!familyName.trim() || !characterName.trim()) return;

    setLoading(true);
    const { error } = await supabase.rpc("create_family_with_setup", {
      p_family_name: familyName.trim(),
      p_user_id: user.id,
      p_character_name: characterName.trim(),
      p_role_class: roleClass,
      p_avatar_emoji: avatarEmoji,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Setup failed", description: error.message, variant: "destructive" });
    } else {
      await refreshMembership();
      toast({ title: "Guild founded! ⚔️", description: `Welcome to ${familyName}!` });
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="parchment-panel w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl">🏰</span>
          <h1 className="text-2xl font-fantasy text-foreground">Found Your Guild</h1>
          <p className="text-muted-foreground text-sm">Set up your family and create your character</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <Label htmlFor="familyName">Family / Guild Name</Label>
            <Input
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="The Zingales"
              required
              maxLength={100}
              className="mt-1"
            />
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="font-fantasy text-lg text-foreground mb-3">Your Character</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="charName">Character Name</Label>
                <Input
                  id="charName"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Your adventurer name"
                  required
                  maxLength={50}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="roleClass">Class / Role</Label>
                <Input
                  id="roleClass"
                  value={roleClass}
                  onChange={(e) => setRoleClass(e.target.value)}
                  placeholder="e.g. Guild Master, Ranger"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Avatar</Label>
                <div className="grid grid-cols-7 gap-2 mt-1">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                        avatarEmoji === emoji
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-border"
                      }`}
                      onClick={() => setAvatarEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "⚔️ Found the Guild"}
          </Button>
        </form>
      </div>
    </div>
  );
}
