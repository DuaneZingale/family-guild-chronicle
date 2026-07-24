import type { PathName } from "@/types/game";
import { cn } from "@/lib/utils";

const pathColors: Record<PathName, string> = {
  Care: "bg-domain-care/20 text-domain-care border-domain-care/30",
  Curiosity: "bg-domain-curiosity/20 text-domain-curiosity border-domain-curiosity/30",
  Craft: "bg-domain-craft/20 text-domain-craft border-domain-craft/30",
  Contribution: "bg-domain-contribution/20 text-domain-contribution border-domain-contribution/30",
  Connection: "bg-domain-connection/20 text-domain-connection border-domain-connection/30",
  Wealth: "bg-domain-wealth/20 text-domain-wealth border-domain-wealth/30",
  Adventure: "bg-domain-adventure/20 text-domain-adventure border-domain-adventure/30",
};

interface PathBadgeProps {
  path: { name: PathName; icon: string };
  size?: "sm" | "md";
}

export function PathBadge({ path, size = "sm" }: PathBadgeProps) {
  return (
    <span
      className={cn(
        "domain-badge border",
        pathColors[path.name],
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      <span>{path.icon}</span>
      <span>{path.name}</span>
    </span>
  );
}

/** @deprecated Use PathBadge instead */
export const DomainBadge = PathBadge;
