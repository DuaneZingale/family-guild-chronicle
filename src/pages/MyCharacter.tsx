import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import CharacterProfile from "./CharacterProfile";

export default function MyCharacter() {
  const { membership, kidPinCharacterId } = useAuth();
  const { state } = useGame();

  // Try auth-provided characterId first, then fall back to first matching
  // local character (name match or first non-guild character)
  let characterId = kidPinCharacterId ?? membership?.characterId ?? null;

  // If the auth characterId doesn't exist in local game state, find a fallback
  const existsLocally = characterId && state.characters.some((c) => c.id === characterId);
  if (!existsLocally) {
    // Find first non-guild, non-kid character for parents, or first kid for kid role
    const isKidRole = membership?.role === "kid";
    const fallback = state.characters.find(
      (c) => c.name !== "The Guild" && c.isKid === isKidRole
    ) ?? state.characters.find((c) => c.name !== "The Guild");
    characterId = fallback?.id ?? null;
  }

  if (!characterId) {
    return <Navigate to="/guild" replace />;
  }

  return <CharacterProfile overrideCharacterId={characterId} isMyCharacter />;
}
