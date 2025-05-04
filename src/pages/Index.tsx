
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/layout/header";
import { GroupSidebar } from "@/components/layout/group-sidebar";
import { Feed } from "@/components/posts/feed";
import { StatsPage } from "@/components/stats/stats-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { GroupsPage } from "@/components/groups/groups-page";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { GroupSettingsPage } from "@/components/groups/group-settings-page";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      }
      setCheckingAuth(false);
    }
  }, [loading, user, navigate]);

  if (loading || checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Always show the sidebar, even in settings and other pages
  return (
    <ThemeProvider defaultTheme="light" storageKey="group-glow-theme">
      <AppProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <GroupSidebar />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/group-settings" element={<GroupSettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <MobileNav />
          <Toaster />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default Index;
