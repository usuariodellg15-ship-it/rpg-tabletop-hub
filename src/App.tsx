import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CampaignsPage from "./pages/CampaignsPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import JoinCampaignPage from "./pages/JoinCampaignPage";
import CampaignPage from "./pages/CampaignPage";
import GMShieldPage from "./pages/GMShieldPage";
import CreateCharacterPage from "./pages/CreateCharacterPage";
import CharacterPage from "./pages/CharacterPage";
import HomebrewsPage from "./pages/HomebrewsPage";
import HomebrewDetailPage from "./pages/HomebrewDetailPage";
import CreateHomebrewPage from "./pages/CreateHomebrewPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/new" element={<CreateCampaignPage />} />
              <Route path="/campaigns/join" element={<JoinCampaignPage />} />
              <Route path="/campaigns/:id" element={<CampaignPage />} />
              <Route path="/campaigns/:id/gm" element={<GMShieldPage />} />
              <Route path="/campaigns/:id/create-character" element={<CreateCharacterPage />} />
              <Route path="/characters/:id" element={<CharacterPage />} />
              <Route path="/homebrews" element={<HomebrewsPage />} />
              <Route path="/homebrews/new" element={<CreateHomebrewPage />} />
              <Route path="/homebrews/:id" element={<HomebrewDetailPage />} />
              <Route path="/homebrews/:id/edit" element={<CreateHomebrewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
