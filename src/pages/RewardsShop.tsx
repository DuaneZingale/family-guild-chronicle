import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RewardCard } from "@/components/game/RewardCard";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/game";

export default function RewardsShop() {
  const { state } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Get characters that can spend gold (usually kids, but allow all)
  const spendingCharacters = state.characters.filter((c) => c.id !== "guild");

  return (
    <PageWrapper title="Rewards Shop" subtitle="Spend your hard-earned gold!">
      {/* Character selector */}
      <div className="parchment-panel p-4 mb-6">
        <h2 className="font-fantasy text-lg mb-3">Who's Shopping?</h2>
        <div className="flex flex-wrap gap-3">
          {spendingCharacters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
                selectedCharacter?.id === char.id
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="text-3xl">{char.avatarEmoji}</span>
              <div className="text-left">
                <div className="font-medium">{char.name}</div>
                <div className="flex items-center gap-1 text-gold font-semibold">
                  <span>💰</span>
                  <span>{char.gold}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rewards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            selectedCharacter={selectedCharacter}
          />
        ))}
      </div>

      {selectedCharacter && selectedCharacter.gold === 0 && (
        <div className="mt-6 parchment-panel p-6 text-center">
          <span className="text-4xl block mb-2">💸</span>
          <p className="text-lg text-muted-foreground">
            {selectedCharacter.name} has no gold yet!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete quests to earn rewards.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
