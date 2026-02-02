import type { DomainName } from "@/types/game";
import { cn } from "@/lib/utils";

const domainColors: Record<DomainName, string> = {
  Health: "bg-domain-health/20 text-domain-health border-domain-health/30",
  Learning: "bg-domain-learning/20 text-domain-learning border-domain-learning/30",
  Stewardship: "bg-domain-stewardship/20 text-domain-stewardship border-domain-stewardship/30",
  Wealth: "bg-domain-wealth/20 text-domain-wealth border-domain-wealth/30",
  Bond: "bg-domain-bond/20 text-domain-bond border-domain-bond/30",
  Craft: "bg-domain-craft/20 text-domain-craft border-domain-craft/30",
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
