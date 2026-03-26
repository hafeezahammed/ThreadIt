import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CommunitiesPage from "./pages/CommunitiesPage";
import PlacementsPage from "./pages/PlacementsPage";
import AdsPage from "./pages/AdsPage";
import TrendingPage from "./pages/TrendingPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicProfile from "./pages/PublicProfilePage";
import AdminPage from "./pages/AdminPage";
import ClickSpark from '@/components/ClickSpark';
import ProtectedRoute from "@/components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <ClickSpark
        sparkColor="#3b82f6"
        sparkSize={8}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <BrowserRouter>
  <Routes>

    <Route path="/" element={<AuthPage />} />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/home" element={<HomePage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/placements" element={<PlacementsPage />} />
      <Route path="/ads" element={<AdsPage />} />
      <Route path="/trending" element={<TrendingPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/profile/:id" element={<PublicProfile />} />
      <Route path="/admin" element={<AdminPage />} />
    </Route>

    <Route path="*" element={<NotFound />} />

  </Routes>
</BrowserRouter>
      </ClickSpark>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;