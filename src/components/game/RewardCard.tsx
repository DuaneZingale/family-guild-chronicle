import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import type { Reward, Character } from "@/types/game";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: Reward;
  selectedCharacter: Character | null;
}

export function RewardCard({ reward, selectedCharacter }: RewardCardProps) {
  const { dispatch } = useGame();
  
  const canAfford = selectedCharacter ? selectedCharacter.gold >= reward.cost : false;

  const handlePurchase = () => {
    if (!selectedCharacter || !canAfford) return;
    
    dispatch({
      type: "SPEND_GOLD",
      characterId: selectedCharacter.id,
      amount: reward.cost,
      note: reward.name,
    });
  };

  return (
    <div className="parchment-panel p-4">
      <div className="flex items-start gap-3">
        <span className="text-4xl">{reward.icon}</span>
        <div className="flex-1">
          <h4 className="font-fantasy text-lg">{reward.name}</h4>
          <p className="text-sm text-muted-foreground">{reward.description}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-gold font-fantasy text-xl">
          <span>💰</span>
          <span>{reward.cost}</span>
        </div>
        
        <Button
          variant={canAfford ? "default" : "outline"}
          disabled={!selectedCharacter || !canAfford}
          onClick={handlePurchase}
          className={cn(
            canAfford && "bg-primary hover:bg-primary/90"
          )}
        >
          {!selectedCharacter
            ? "Select Character"
            : canAfford
            ? "Purchase"
            : "Not Enough Gold"}
        </Button>
      </div>
    </div>
  );
}
