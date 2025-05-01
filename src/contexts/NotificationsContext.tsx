
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { Notification, NotificationType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();

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
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      if (data) {
        // Cast the data to ensure correct types
        const typedNotifications: Notification[] = data.map(item => ({
          ...item,
          type: item.type as NotificationType // Ensure the type is properly cast
        }));
        
        setNotifications(typedNotifications);
        setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data as fallback
      const mockNotifications: Notification[] = [
        {
          id: '1',
          content: 'John liked your post',
          created_at: new Date().toISOString(),
          is_read: false,
          type: 'reaction' as NotificationType,
          related_post_id: '123',
          actor_id: '456',
          user_id: currentUser.id
        },
        {
          id: '2',
          content: 'Amy commented on your post',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          is_read: true,
          type: 'comment' as NotificationType,
          related_post_id: '123',
          actor_id: '789',
          user_id: currentUser.id
        },
        {
          id: '3',
          content: 'New post in "Hiking Adventures" group',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          is_read: false,
          type: 'new_post' as NotificationType,
          related_post_id: '456',
          related_group_id: '111',
          actor_id: '222',
          user_id: currentUser.id
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true } 
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          is_read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Cast the returned notification to ensure correct types
        const typedNotification: Notification = {
          ...data,
          type: data.type as NotificationType
        };
        
        // Add to local state
        setNotifications(prev => [typedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast({
          title: "New notification",
          description: notification.content,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      
      // Fallback to client-side only notification
      const newNotification: Notification = {
        ...notification,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        is_read: false,
        type: notification.type as NotificationType
      };
      
      setNotifications(prev => [newNotification, ...prev] as Notification[]);
      setUnreadCount(prev => prev + 1);
      
      toast({
        title: "New notification",
        description: notification.content,
        duration: 5000,
      });
    }
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
