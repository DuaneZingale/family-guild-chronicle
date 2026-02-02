import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import GuildHall from "./pages/GuildHall";
import DomainsSkills from "./pages/DomainsSkills";
import Routines from "./pages/Routines";
import Campaigns from "./pages/Campaigns";
import RewardsShop from "./pages/RewardsShop";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuildHall />} />
            <Route path="/domains" element={<DomainsSkills />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/shop" element={<RewardsShop />} />
            <Route path="/journal" element={<Journal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
