import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const EMOJI_OPTIONS = ["🧒", "👧", "👦", "🧒🏽", "👸", "🤴", "🧝", "🧙‍♂️", "🦸", "🐉"];

interface AddKidDialogProps {
  trigger: React.ReactNode;
  onCreated?: () => void;
}

export function AddKidDialog({ trigger, onCreated }: AddKidDialogProps) {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧒");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const familyId = membership?.familyId;

  async function handleSubmit() {
    if (!familyId || !name.trim()) return;
    setSaving(true);

    // 1. Create the character
    const { data: character, error: charErr } = await supabase
      .from("characters")
      .insert({
        family_id: familyId,
        name: name.trim(),
        avatar_emoji: emoji,
        is_kid: true,
        role_class: "Adventurer",
      })
      .select("id")
      .single();

    if (charErr || !character) {
      toast({ title: "Failed to create character", description: charErr?.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // 2. Optionally set PIN
    if (pin.length === 4) {
      const { error: pinErr } = await supabase.rpc("set_kid_pin", {
        p_family_id: familyId,
        p_character_id: character.id,
        p_pin: pin,
      });
      if (pinErr) {
        toast({ title: "Character created, but PIN failed", description: pinErr.message, variant: "destructive" });
      }
    }

    toast({ title: "Kid added! 🎉", description: `${name} is ready to adventure.` });
    setSaving(false);
    setOpen(false);
    setName("");
    setPin("");
    setEmoji("🧒");
    onCreated?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-fantasy">Add Kid Character</DialogTitle>
          <DialogDescription>
            Create a character for a kid on this device. No email needed — they can log in with a PIN.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <Label htmlFor="kidName">Character Name</Label>
            <Input
              id="kidName"
              placeholder="e.g. Luna the Brave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Emoji picker */}
          <div>
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-1.5 rounded-lg border-2 transition-colors ${
                    emoji === e
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Optional PIN */}
          <div>
            <Label>PIN (optional — 4 digits)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Set a PIN so this kid can log in on the shared device.
            </p>
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? "Creating…" : "Add Kid"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
