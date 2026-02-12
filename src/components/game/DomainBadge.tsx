import type { DomainName } from "@/types/game";
import { cn } from "@/lib/utils";

const domainColors: Record<DomainName, string> = {
  Care: "bg-domain-care/20 text-domain-care border-domain-care/30",
  Curiosity: "bg-domain-curiosity/20 text-domain-curiosity border-domain-curiosity/30",
  Craft: "bg-domain-craft/20 text-domain-craft border-domain-craft/30",
  Contribution: "bg-domain-contribution/20 text-domain-contribution border-domain-contribution/30",
  Connection: "bg-domain-connection/20 text-domain-connection border-domain-connection/30",
  Wealth: "bg-domain-wealth/20 text-domain-wealth border-domain-wealth/30",
  Adventure: "bg-domain-adventure/20 text-domain-adventure border-domain-adventure/30",
};

interface DomainBadgeProps {
  domain: { name: DomainName; icon: string };
  size?: "sm" | "md";
}

export function DomainBadge({ domain, size = "sm" }: DomainBadgeProps) {
  return (
    <span
      className={cn(
        "domain-badge border",
        domainColors[domain.name],
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      <span>{domain.icon}</span>
      <span>{domain.name}</span>
    </span>
  );
}
