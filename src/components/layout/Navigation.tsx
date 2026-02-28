import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const allNavItems = [
  { path: "/", label: "My Character", icon: "🧙", kidVisible: true },
  { path: "/quest-log", label: "Quest Log", icon: "📜", kidVisible: true },
  { path: "/quest-board", label: "Quest Board", icon: "📋", kidVisible: true },
  { path: "/paths", label: "Paths", icon: "⚔️", kidVisible: true },
  { path: "/guild", label: "Guild Hall", icon: "🏰", kidVisible: true },
  { path: "/journal", label: "Chronicle", icon: "📖", kidVisible: false },
  { path: "/shop", label: "Shop", icon: "🛒", kidVisible: true },
];

const ROLE_LABELS: Record<string, string> = {
  parent: "Guild Master",
  owner: "Guild Master",
  "co-parent": "Co-Leader",
  kid: "Adventurer",
  guest: "Guest",
};

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { membership, user, signOut, kidPinCharacterId, exitKidPinMode } = useAuth();
  const { theme, setTheme } = useTheme();

  const isKidMode = !!kidPinCharacterId;
  const isKidRole = membership?.role === "kid";
  const isRestricted = isKidMode || isKidRole;

  const navItems = isRestricted
    ? allNavItems.filter((item) => item.kidVisible)
    : allNavItems;

  const roleLabel = isKidMode
    ? "Kid Mode"
    : ROLE_LABELS[membership?.role ?? ""] ?? membership?.role ?? "";

  return (
    <nav className="wood-panel sticky top-0 z-50 border-b-4 border-amber-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏰</span>
            <h1 className="text-xl font-fantasy text-sidebar-primary tracking-wider hidden sm:block">
              {membership?.familyName || "Family Guild"}
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

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Parchment Realm" : "Dark Realm"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User menu */}
            {isKidMode ? (
              <Button
                size="sm"
                variant="outline"
                className="ml-2 text-xs bg-sidebar-accent/30 text-sidebar-foreground border-sidebar-border"
                onClick={() => {
                  exitKidPinMode();
                  navigate("/login");
                }}
              >
                🧒 Exit Kid Mode
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-sidebar-foreground hover:bg-sidebar-accent/50 gap-1.5"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">{roleLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  {!isKidRole && (
                    <DropdownMenuItem onClick={() => navigate("/guild-settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Guild Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/login");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
