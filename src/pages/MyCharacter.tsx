import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import CharacterProfile from "./CharacterProfile";

export default function MyCharacter() {
  const { membership, kidPinCharacterId } = useAuth();
  const characterId = kidPinCharacterId ?? membership?.characterId;

  if (!characterId) {
    return <Navigate to="/guild" replace />;
  }

  // Render CharacterProfile inline with the user's own character ID
  return <CharacterProfile overrideCharacterId={characterId} isMyCharacter />;
}
