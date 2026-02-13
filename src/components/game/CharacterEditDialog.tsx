import { useState } from "react";
import { useGame } from "@/context/GameContext";
import type { Character } from "@/types/game";
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
import { Switch } from "@/components/ui/switch";

const AVATAR_OPTIONS = ["🧙‍♂️", "🧝‍♀️", "📜", "🏹", "🗡️", "🛡️", "🧙", "🧚", "🦊", "🐉", "🦅", "🌟", "⚡", "🔥", "🌊", "🌿"];

interface CharacterEditDialogProps {
  character?: Character;
  trigger: React.ReactNode;
}

export function CharacterEditDialog({ character, trigger }: CharacterEditDialogProps) {
  const { dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(character?.name ?? "");
  const [roleClass, setRoleClass] = useState(character?.roleClass ?? "Adventurer");
  const [avatarEmoji, setAvatarEmoji] = useState(character?.avatarEmoji ?? "🧙‍♂️");
  const [isKid, setIsKid] = useState(character?.isKid ?? false);

  const isEditing = !!character;

  function handleSave() {
    if (!name.trim()) return;

    if (isEditing) {
      dispatch({
        type: "UPDATE_CHARACTER",
        character: { ...character, name: name.trim(), roleClass, avatarEmoji, isKid },
      });
    } else {
      dispatch({
        type: "ADD_CHARACTER",
        character: { name: name.trim(), roleClass, avatarEmoji, isKid, gold: 0 },
      });
    }
    setOpen(false);
    if (!isEditing) {
      setName("");
      setRoleClass("Adventurer");
      setAvatarEmoji("🧙‍♂️");
      setIsKid(false);
    }
  }

  function handleDelete() {
    if (character && confirm(`Remove ${character.name} from the guild?`)) {
      dispatch({ type: "DELETE_CHARACTER", characterId: character.id });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="parchment-panel sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-fantasy text-xl">
            {isEditing ? "Edit Character" : "New Guild Member"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="roleClass">Class / Role</Label>
            <Input
              id="roleClass"
              value={roleClass}
              onChange={(e) => setRoleClass(e.target.value)}
              placeholder="e.g. Builder, Scribe, Ranger"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Avatar</Label>
            <div className="grid grid-cols-8 gap-2 mt-1">
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

          <div className="flex items-center justify-between">
            <Label htmlFor="isKid">Kid account</Label>
            <Switch id="isKid" checked={isKid} onCheckedChange={setIsKid} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              {isEditing ? "Save Changes" : "Add to Guild"}
            </Button>
            {isEditing && character.id !== "guild" && (
              <Button variant="destructive" onClick={handleDelete}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
