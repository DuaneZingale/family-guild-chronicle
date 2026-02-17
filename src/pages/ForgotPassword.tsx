import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="parchment-panel w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl">🔑</span>
          <h1 className="text-2xl font-fantasy text-foreground">Reset Password</h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Check your email for a reset link!</p>
            <Link to="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
