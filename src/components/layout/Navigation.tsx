import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Guild Hall", icon: "🏰" },
  { path: "/domains", label: "Domains", icon: "⚔️" },
  { path: "/routines", label: "Routines", icon: "📜" },
  { path: "/campaigns", label: "Campaigns", icon: "🗺️" },
  { path: "/shop", label: "Shop", icon: "🛒" },
  { path: "/journal", label: "Journal", icon: "📖" },
];

export function Navigation() {
  const location = useLocation();

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
          </div>
        </div>
      </div>
    </nav>
  );
}
