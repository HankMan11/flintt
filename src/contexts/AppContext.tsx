
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { useStats } from "@/hooks/useStats";
import { useGroupManagement } from "@/hooks/useGroupManagement";
import { usePostExtensions } from "@/hooks/usePostExtensions";

export const useApp = () => {
  const auth = useAuth();
  const groups = useGroups();
  const posts = usePosts();
  const stats = useStats(posts.posts, groups.groups, auth.currentUser);
  const groupManagement = useGroupManagement(auth.currentUser, groups.fetchGroups);
  const postExtensions = usePostExtensions(auth.currentUser, posts.posts);
  const notifications = useNotifications();

  return {
    // Auth related
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    login: auth.login,
    logout: auth.logout,

    // Group related
    groups: groups.groups,
    setGroups: groups.setGroups,
    activeGroup: groups.activeGroup,
    setActiveGroup: groups.setActiveGroup,
    loadingGroups: groups.loadingGroups,
    setLoadingGroups: groups.setLoadingGroups,
    fetchGroups: groups.fetchGroups,
    createGroup: groupManagement.createGroup,
    joinGroup: groupManagement.joinGroup,

    // Post related
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
    reportPost: posts.reportPost,
    blockUser: posts.blockUser,
    updateUserStreak: posts.updateUserStreak,

    // Notifications related
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    markAsRead: notifications.markAsRead,
    markAllAsRead: notifications.markAllAsRead,
    fetchNotifications: notifications.fetchNotifications,

    // Helper functions
    filterGroupPosts: postExtensions.filterGroupPosts,
    getSavedPosts: postExtensions.getSavedPosts,
    getGroupStats: stats.getGroupStats,
    getUserStats: stats.getUserStats,
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
