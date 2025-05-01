
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { toast } from '@/hooks/use-toast';

// Define notification type
export interface Notification {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  type: 'reaction' | 'comment' | 'new_post';
  related_post_id?: string;
  related_group_id?: string;
  actor_id?: string;
  user_id: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  addNotification: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications when user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser]);

  // Set up interval to fetch notifications periodically
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    // In a real app, you would fetch from API
    // For now, we'll use mock data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        content: 'John liked your post',
        created_at: new Date().toISOString(),
        is_read: false,
        type: 'reaction',
        related_post_id: '123',
        actor_id: '456',
        user_id: currentUser.id
      },
      {
        id: '2',
        content: 'Amy commented on your post',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_read: true,
        type: 'comment',
        related_post_id: '123',
        actor_id: '789',
        user_id: currentUser.id
      },
      {
        id: '3',
        content: 'New post in "Hiking Adventures" group',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        is_read: false,
        type: 'new_post',
        related_post_id: '456',
        related_group_id: '111',
        actor_id: '222',
        user_id: currentUser.id
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  };

  const markAsRead = async (notificationId: string) => {
    // In a real app, you would call an API
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true } 
          : notif
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    // In a real app, you would call an API
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
    
    // Reset unread count
    setUnreadCount(0);
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    // In a real app, you would call an API
    const newNotification: Notification = {
      ...notification,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast for new notification
    toast({
      title: "New notification",
      description: notification.content,
      duration: 5000,
    });
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        addNotification 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
