
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { useTheme } from "./ThemeContext";
import { User } from "@/types";

// Import new hooks for refactored functionality
import { useStats } from "@/hooks/useStats";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import { usePostExtensions } from "@/hooks/usePostExtensions";

export const useApp = () => {
  const auth = useAuth();
  const groups = useGroups();
  const posts = usePosts();
  const notifications = useNotifications();
  const { theme, setTheme } = useTheme();

  // Initialize our refactored hooks
  const { getGroupStats, getUserStats } = useStats(posts.posts);
  const { createGroup: createGroupBase, joinGroup: joinGroupBase } = 
    useGroupManagement(groups.fetchGroups);
  const { reactToPost, filterGroupPosts, getSavedPosts } = 
    usePostExtensions(posts.posts, posts.likePost, posts.dislikePost, posts.heartPost);

  // Add setDarkMode function that uses the theme context
  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  // Wrapper for createGroup to reduce parameter passing
  const createGroup = async (name: string, icon: string | null, description: string = "") => {
    return createGroupBase(
      auth.currentUser, 
      name, 
      icon, 
      description, 
      groups.uploadGroupImage
    );
  };

  // Wrapper for joinGroup to reduce parameter passing
  const joinGroup = async (inviteCode: string) => {
    return joinGroupBase(auth.currentUser, inviteCode);
  };

  // Wrapper for getSavedPosts to handle undefined currentUser
  const getSavedPostsWrapped = () => {
    return getSavedPosts(auth.currentUser?.id);
  };

  return {
    // Auth context
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    login: auth.login,
    logout: auth.logout,
    blockedUsers: auth.blockedUsers,
    blockUser: auth.blockUser,
    unblockUser: auth.unblockUser,
    isUserBlocked: auth.isUserBlocked,

    // Groups context
    groups: groups.groups,
    setGroups: groups.setGroups,
    activeGroup: groups.activeGroup,
    setActiveGroup: groups.setActiveGroup,
    loadingGroups: groups.loadingGroups,
    setLoadingGroups: groups.setLoadingGroups,
    fetchGroups: groups.fetchGroups,
    uploadGroupImage: groups.uploadGroupImage,
    uploadingImage: groups.uploadingImage,

    // Posts context
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
    
    // Post extensions (refactored)
    reactToPost,
    filterGroupPosts,
    getSavedPosts: getSavedPostsWrapped,
    
    // Stats (refactored)
    getGroupStats: (groupId: string, timeRange: "all" | "month" | "week") => 
      getGroupStats(groupId, timeRange, groups.groups),
    getUserStats,
    
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
    
    // Group management (refactored)
    createGroup,
    joinGroup
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
