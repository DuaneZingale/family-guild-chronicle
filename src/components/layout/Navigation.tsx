import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";

const allNavItems = [
  { path: "/", label: "Guild Hall", icon: "🏰", kidVisible: true },
  { path: "/domains", label: "Domains", icon: "⚔️", kidVisible: true },
  { path: "/library", label: "Library", icon: "📚", kidVisible: true },
  { path: "/routines", label: "Routines", icon: "📜", kidVisible: false },
  { path: "/campaigns", label: "Campaigns", icon: "🗺️", kidVisible: false },
  { path: "/shop", label: "Shop", icon: "🛒", kidVisible: true },
  { path: "/journal", label: "Journal", icon: "📖", kidVisible: false },
];

export function Navigation() {
  const location = useLocation();
  const { state, dispatch } = useGame();
  const isKidMode = !!state.kidModeCharacterId;
  const kidChar = isKidMode
    ? state.characters.find((c) => c.id === state.kidModeCharacterId)
    : null;

  const navItems = isKidMode
    ? allNavItems.filter((item) => item.kidVisible)
    : allNavItems;

  return (
    <nav className="wood-panel sticky top-0 z-50 border-b-4 border-amber-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏰</span>
            <h1 className="text-xl font-fantasy text-sidebar-primary tracking-wider hidden sm:block">
              Family Guild
            </h1>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}

            {/* Kid Mode toggle */}
            {isKidMode ? (
              <Button
                size="sm"
                variant="outline"
                className="ml-2 text-xs bg-sidebar-accent/30 text-sidebar-foreground border-sidebar-border"
                onClick={() => dispatch({ type: "EXIT_KID_MODE" })}
              >
                {kidChar?.avatarEmoji} Exit Kid Mode
              </Button>
            ) : (
              <div className="ml-2 flex gap-1">
                {state.characters
                  .filter((c) => c.isKid)
                  .map((kid) => (
                    <button
                      key={kid.id}
                      onClick={() => dispatch({ type: "ENTER_KID_MODE", characterId: kid.id })}
                      className="text-xl hover:scale-110 transition-transform"
                      title={`${kid.name}'s Mode`}
                    >
                      {kid.avatarEmoji}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
