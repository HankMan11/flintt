import LandingPage from "@/components/auth/LandingPage";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/layout/header";
import { GroupSidebar } from "@/components/layout/group-sidebar";
import { Feed } from "@/components/posts/feed";
import { StatsPage } from "@/components/stats/stats-page";
import { SettingsPage } from "@/components/settings/settings-page";
import { GroupsPage } from "@/components/groups/groups-page";
import { Routes, Route } from "react-router-dom";
import { MobileNav } from "@/components/layout/mobile-nav";

const Index = () => {
  // On load, show the landing page/modal instead of the main app.
  // Remove below to use the app after authentication is implemented.
  return <LandingPage />;
  
  // Old code for after login (restore after backend/user session implemented)
  // return (
  //   <ThemeProvider defaultTheme="light" storageKey="group-glow-theme">
  //     <AppProvider>
  //       <div className="flex min-h-screen flex-col">
  //         <Header />
  //         <div className="flex flex-1">
  //           <GroupSidebar />
  //           <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
  //             <Routes>
  //               <Route path="/" element={<Feed />} />
  //               <Route path="/stats" element={<StatsPage />} />
  //               <Route path="/settings" element={<SettingsPage />} />
  //               <Route path="/groups" element={<GroupsPage />} />
  //               <Route path="*" element={<Feed />} />
  //             </Routes>
  //           </main>
  //         </div>
  //         <MobileNav />
  //       </div>
  //     </AppProvider>
  //   </ThemeProvider>
  // );
};

export default Index;
