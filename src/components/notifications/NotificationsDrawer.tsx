
import React from "react";
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="h-[60vh] px-4">
          {notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    notification.isRead ? "bg-background" : "bg-muted"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm">{notification.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DrawerFooter>
          <Button onClick={markAllAsRead} variant="outline" className="w-full">
            Mark all as read
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
