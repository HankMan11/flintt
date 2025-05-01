import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "@/pages/Auth";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GroupSettingsPage from "./pages/GroupSettings";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple fallback loading component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            <NotificationsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/group-settings" element={<GroupSettingsPage />} />
                  <Route path="/*" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationsProvider>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
