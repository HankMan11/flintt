import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { useTheme } from "./ThemeContext";
import { Post } from "@/types";

export const useApp = () => {
  const auth = useAuth();
  const groups = useGroups();
  const posts = usePosts();
  const notifications = useNotifications();
  const { theme, setTheme } = useTheme();

  // Add setDarkMode function that uses the theme context
  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  // Add reactToPost function that uses the posts context
  const reactToPost = (postId: string, reaction: "like" | "dislike" | "heart") => {
    if (reaction === "like") {
      return posts.likePost(postId);
    } else if (reaction === "dislike") {
      return posts.dislikePost(postId);
    } else if (reaction === "heart") {
      return posts.heartPost(postId);
    }
    return Promise.resolve();
  };

  return {
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    login: auth.login,
    logout: auth.logout,
    blockedUsers: auth.blockedUsers,
    blockUser: auth.blockUser,
    unblockUser: auth.unblockUser,
    isUserBlocked: auth.isUserBlocked,

    groups: groups.groups,
    setGroups: groups.setGroups,
    activeGroup: groups.activeGroup,
    setActiveGroup: groups.setActiveGroup,
    loadingGroups: groups.loadingGroups,
    setLoadingGroups: groups.setLoadingGroups,
    fetchGroups: groups.fetchGroups,
    uploadGroupImage: groups.uploadGroupImage,
    uploadingImage: groups.uploadingImage,

    posts: posts.posts,
    setPosts: posts.setPosts,
    addPost: posts.addPost,
    deletePost: posts.deletePost,
    likePost: posts.likePost,
    dislikePost: posts.dislikePost,
    heartPost: posts.heartPost,
    addComment: posts.addComment,
    editPost: posts.editPost,
    pinPost: posts.pinPost,
    reactToPost,
    
    // Theme control
    theme,
    setTheme,
    setDarkMode,
    
    // Notifications
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    markAsRead: notifications.markAsRead,
    markAllAsRead: notifications.markAllAsRead,
    addNotification: notifications.addNotification,
    
    createGroup: async (name: string, icon: string | null, description: string = "") => {
      if (!auth.currentUser) return null;
      
      try {
        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Upload image if provided
        let imageUrl = icon;
        if (icon && typeof icon === 'string' && icon.startsWith('data:')) {
          // Handle base64 image
          console.log("Processing base64 image");
          // Implementation for base64 upload would go here
        } else if (icon && typeof FileReader !== 'undefined' && icon instanceof File) {
          // Fix the instanceof check by first ensuring icon is a valid object type
          imageUrl = await groups.uploadGroupImage(icon as File);
        }

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert({
            name,
            icon: imageUrl || 'https://via.placeholder.com/150',
            description,
            invite_code: inviteCode
          })
          .select()
          .single();
        
        if (groupError) {
          console.error("Error creating group:", groupError);
          return null;
        }
        
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupData.id,
            user_id: auth.currentUser.id
          });
        
        if (memberError) {
          console.error("Error adding user to group:", memberError);
          return null;
        }
        
        await groups.fetchGroups();
        
        return {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          icon: groupData.icon,
          inviteCode: groupData.invite_code,
          members: [{
            id: `${groupData.id}-${auth.currentUser.id}`,
            userId: auth.currentUser.id,
            groupId: groupData.id,
            role: 'admin',
            user: auth.currentUser
          }],
          createdAt: groupData.created_at
        };
      } catch (error) {
        console.error("Error creating group:", error);
        return null;
      }
    },
    
    joinGroup: async (inviteCode: string) => {
      if (!auth.currentUser) return false;
      
      try {
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('invite_code', inviteCode)
          .single();
        
        if (groupError || !groupData) {
          console.error("Error finding group:", groupError);
          return false;
        }
        
        const { data: memberData, error: memberCheckError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupData.id)
          .eq('user_id', auth.currentUser.id);
        
        if (memberCheckError) {
          console.error("Error checking membership:", memberCheckError);
          return false;
        }
        
        if (memberData && memberData.length > 0) {
          return true;
        }
        
        const { error: joinError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupData.id,
            user_id: auth.currentUser.id
          });
        
        if (joinError) {
          console.error("Error joining group:", joinError);
          return false;
        }
        
        await groups.fetchGroups();
        
        return true;
      } catch (error) {
        console.error("Error joining group:", error);
        return false;
      }
    }
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <GroupsProvider>
      <PostsProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </PostsProvider>
    </GroupsProvider>
  </AuthProvider>
);
