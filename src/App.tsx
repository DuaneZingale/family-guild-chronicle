import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import GuildHall from "./pages/GuildHall";
import CharacterProfile from "./pages/CharacterProfile";
import DomainsSkills from "./pages/DomainsSkills";
import Routines from "./pages/Routines";
import Campaigns from "./pages/Campaigns";
import RewardsShop from "./pages/RewardsShop";
import Journal from "./pages/Journal";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FamilySetup from "./pages/FamilySetup";
import KidPinLogin from "./pages/KidPinLogin";
import JoinFamily from "./pages/JoinFamily";
import GuildSettings from "./pages/GuildSettings";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, membership, kidPinCharacterId } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <span className="text-5xl animate-pulse">🏰</span>
          <p className="text-muted-foreground font-fantasy">Loading…</p>
        </div>
      </div>
    );
  }

  // Kid PIN mode — allow through
  if (kidPinCharacterId) return <>{children}</>;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but no family yet
  if (!membership) return <Navigate to="/family-setup" replace />;

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/kid-login" element={<KidPinLogin />} />
            <Route path="/join" element={<JoinFamily />} />

            {/* Protected routes */}
            <Route
              path="/family-setup"
              element={
                <FamilySetup />
              }
            />
            <Route
              path="/"
              element={
                <AuthGate>
                  <GameProvider>
                    <GuildHall />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/character/:id"
              element={
                <AuthGate>
                  <GameProvider>
                    <CharacterProfile />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/domains"
              element={
                <AuthGate>
                  <GameProvider>
                    <DomainsSkills />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/library"
              element={
                <AuthGate>
                  <GameProvider>
                    <Library />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/routines"
              element={
                <AuthGate>
                  <GameProvider>
                    <Routines />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/campaigns"
              element={
                <AuthGate>
                  <GameProvider>
                    <Campaigns />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/shop"
              element={
                <AuthGate>
                  <GameProvider>
                    <RewardsShop />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/journal"
              element={
                <AuthGate>
                  <GameProvider>
                    <Journal />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route
              path="/guild-settings"
              element={
                <AuthGate>
                  <GameProvider>
                    <GuildSettings />
                  </GameProvider>
                </AuthGate>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
