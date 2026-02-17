import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function JoinFamily() {
  const { user, refreshMembership } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [inviteCode, setInviteCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [characterName, setCharacterName] = useState("");
  const [loading, setLoading] = useState(false);

  // If not logged in, prompt to sign up first
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [step, setStep] = useState<"auth" | "join">(user ? "join" : "auth");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setSignupLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      setStep("join");
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim() || !characterName.trim()) return;

    setLoading(true);

    // Look up invite
    const { data: invite, error: invErr } = await supabase
      .from("family_invites")
      .select("*")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .gte("expires_at", new Date().toISOString())
      .limit(1)
      .single();

    if (invErr || !invite) {
      setLoading(false);
      toast({ title: "Invalid or expired invite code", variant: "destructive" });
      return;
    }

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      setLoading(false);
      toast({ title: "You need to be logged in", variant: "destructive" });
      return;
    }

    // Create membership
    const { error: memErr } = await supabase.from("memberships").insert({
      family_id: invite.family_id,
      user_id: currentUser.id,
      role: invite.role,
    });

    if (memErr) {
      setLoading(false);
      toast({ title: "Join failed", description: memErr.message, variant: "destructive" });
      return;
    }

    // Create character
    const { data: charData, error: charErr } = await supabase
      .from("characters")
      .insert({
        family_id: invite.family_id,
        name: characterName.trim(),
        is_kid: invite.role === "kid",
      })
      .select("id")
      .single();

    if (charErr || !charData) {
      setLoading(false);
      toast({ title: "Character creation failed", variant: "destructive" });
      return;
    }

    // Link user to character
    await supabase.from("user_character_links").insert({
      family_id: invite.family_id,
      user_id: currentUser.id,
      character_id: charData.id,
    });

    await refreshMembership();
    setLoading(false);
    toast({ title: "Welcome to the guild! ⚔️" });
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="parchment-panel w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl">📜</span>
          <h1 className="text-2xl font-fantasy text-foreground">Join a Guild</h1>
          <p className="text-muted-foreground text-sm">Enter your invite code to join a family</p>
        </div>

        {step === "auth" && !user ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <p className="text-sm text-muted-foreground">Create an account first, then join.</p>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={signupLoading}>
              {signupLoading ? "Creating…" : "Create Account & Join"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCD1234"
                required
                className="mt-1 font-mono text-lg tracking-wider"
              />
            </div>
            <div>
              <Label htmlFor="charName">Your Character Name</Label>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining…" : "Join the Guild ⚔️"}
            </Button>
          </form>
        )}

        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
