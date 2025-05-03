
import React, { useState } from "react";
import { Bell, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GroupSidebar } from "./group-sidebar";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { NotificationsDrawer } from "@/components/notifications/NotificationsDrawer";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationsContext";

export function Header() {
  const { currentUser, logout } = useApp();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <GroupSidebar />
          </SheetContent>
        </Sheet>
        <h1
          className="text-xl font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Flint
        </h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {currentUser && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        {currentUser ? (
          <Avatar className="h-9 w-9 cursor-pointer" onClick={() => navigate("/settings")}>
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <Button onClick={() => navigate("/auth")}>Login</Button>
        )}
      </div>
      <NotificationsDrawer 
        open={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
}
