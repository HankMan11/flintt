
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { useTheme } from "./ThemeContext";
import { Post, User } from "@/types";

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

  // Filter posts by group ID
  const filterGroupPosts = (groupId: string): Post[] => {
    return posts.posts.filter(post => post.group.id === groupId);
  };

  // Get saved posts (posts hearted by the current user)
  const getSavedPosts = (): Post[] => {
    if (!auth.currentUser) return [];
    return posts.posts.filter(post => post.hearts.includes(auth.currentUser.id));
  };

  // Get group stats
  const getGroupStats = (groupId: string, timeRange: "all" | "month" | "week") => {
    if (!groups.groups.length) return null;
    
    const group = groups.groups.find(g => g.id === groupId);
    if (!group) return null;
    
    // Filter posts by time range and group
    const filteredPosts = posts.posts.filter(post => {
      if (post.group.id !== groupId) return false;
      
      if (timeRange === "all") return true;
      
      const postDate = new Date(post.createdAt);
      const now = new Date();
      
      if (timeRange === "month") {
        // Posts from this month
        return postDate.getMonth() === now.getMonth() && 
               postDate.getFullYear() === now.getFullYear();
      }
      
      if (timeRange === "week") {
        // Posts from this week (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return postDate >= weekAgo;
      }
      
      return true;
    });
    
    // Count uploads per user
    const userUploads = new Map<string, number>();
    // Count likes received per user
    const userLikes = new Map<string, number>();
    // Count hearts received per user
    const userHearts = new Map<string, number>();
    // Count comments made per user
    const userComments = new Map<string, number>();
    // Track most saved posts
    const postHearts = new Map<string, {post: Post, count: number}>();
    
    // Process all posts
    filteredPosts.forEach(post => {
      // Count upload
      const userId = post.user.id;
      userUploads.set(userId, (userUploads.get(userId) || 0) + 1);
      
      // Count likes received
      userLikes.set(userId, (userLikes.get(userId) || 0) + post.likes.length);
      
      // Count hearts received
      userHearts.set(userId, (userHearts.get(userId) || 0) + post.hearts.length);
      
      // Track post heart counts
      if (post.hearts.length > 0) {
        postHearts.set(post.id, {post, count: post.hearts.length});
      }
      
      // Count comments
      post.comments.forEach(comment => {
        const commenterId = comment.user.id;
        userComments.set(commenterId, (userComments.get(commenterId) || 0) + 1);
        
        // Count nested comments too
        if (comment.replies) {
          comment.replies.forEach(reply => {
            const replyerId = reply.user.id;
            userComments.set(replyerId, (userComments.get(replyerId) || 0) + 1);
          });
        }
      });
    });
    
    // Convert maps to arrays and sort
    const mostUploads = Array.from(userUploads.entries())
      .map(([userId, count]) => ({
        user: group.members.find(m => m.userId === userId)?.user,
        count
      }))
      .filter(item => item.user) // Only include users we have data for
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    const mostLiked = Array.from(userLikes.entries())
      .map(([userId, count]) => ({
        user: group.members.find(m => m.userId === userId)?.user,
        count
      }))
      .filter(item => item.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    const mostHearted = Array.from(userHearts.entries())
      .map(([userId, count]) => ({
        user: group.members.find(m => m.userId === userId)?.user,
        count
      }))
      .filter(item => item.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    const mostCommented = Array.from(userComments.entries())
      .map(([userId, count]) => ({
        user: group.members.find(m => m.userId === userId)?.user,
        count
      }))
      .filter(item => item.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    const mostSavedPosts = Array.from(postHearts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    return {
      mostUploads,
      mostLiked,
      mostHearted,
      mostCommented,
      mostSavedPosts
    };
  };
  
  // Get user stats
  const getUserStats = (userId: string, groupId: string, timeRange: "all" | "month" | "week") => {
    // Filter posts by time range and group
    const filteredPosts = posts.posts.filter(post => {
      if (post.group.id !== groupId) return false;
      
      if (timeRange === "all") return true;
      
      const postDate = new Date(post.createdAt);
      const now = new Date();
      
      if (timeRange === "month") {
        // Posts from this month
        return postDate.getMonth() === now.getMonth() && 
               postDate.getFullYear() === now.getFullYear();
      }
      
      if (timeRange === "week") {
        // Posts from this week (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return postDate >= weekAgo;
      }
      
      return true;
    });
    
    // Count user's uploads
    const uploads = filteredPosts.filter(post => post.user.id === userId).length;
    
    // Count likes given
    const likes = filteredPosts.filter(post => 
      post.likes.includes(userId)).length;
    
    // Count hearts given
    const hearts = filteredPosts.filter(post => 
      post.hearts.includes(userId)).length;
    
    // Count comments made
    let commentCount = 0;
    filteredPosts.forEach(post => {
      post.comments.forEach(comment => {
        if (comment.user.id === userId) {
          commentCount++;
        }
        
        // Count nested comments too
        if (comment.replies) {
          comment.replies.forEach(reply => {
            if (reply.user.id === userId) {
              commentCount++;
            }
          });
        }
      });
    });
    
    return {
      uploads,
      likes,
      hearts,
      commentCount
    };
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
    filterGroupPosts,
    getSavedPosts,
    getGroupStats,
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
        } else if (icon && icon instanceof File) {
          // Type check for File instance
          imageUrl = await groups.uploadGroupImage(icon);
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
