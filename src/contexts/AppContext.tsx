
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";

// This is the combined hook that provides access to all context values
export const useApp = () => {
  const auth = useAuth();
  const groups = useGroups();
  const posts = usePosts();

  return {
    // Auth context values and methods
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    login: auth.login,
    logout: auth.logout,

    // Groups context values and methods
    groups: groups.groups,
    setGroups: groups.setGroups,
    activeGroup: groups.activeGroup,
    setActiveGroup: groups.setActiveGroup,
    loadingGroups: groups.loadingGroups,
    setLoadingGroups: groups.setLoadingGroups,

    // Posts context values and methods
    posts: posts.posts,
    setPosts: posts.setPosts,
    addPost: posts.addPost,
    deletePost: posts.deletePost,
    likePost: posts.likePost,
    dislikePost: posts.dislikePost,
    heartPost: posts.heartPost,
    addComment: posts.addComment,

    // Utility methods that combine data from multiple contexts
    filterGroupPosts: (groupId: string) => {
      return posts.posts.filter(post => post.group?.id === groupId);
    },
    
    getSavedPosts: () => {
      if (!auth.currentUser) return [];
      return posts.posts.filter(post => post.hearts.includes(auth.currentUser!.id));
    },
    
    getGroupStats: (groupId: string) => {
      const groupPosts = posts.posts.filter(post => post.group?.id === groupId);
      
      const userPostCounts: Record<string, number> = {};
      const userLikeCounts: Record<string, number> = {};
      const userHeartCounts: Record<string, number> = {};
      const userCommentCounts: Record<string, number> = {};
      const mostSavedPosts: { post: any; count: number }[] = [];
      
      // Count posts and reactions by user
      groupPosts.forEach(post => {
        // Count posts by user
        userPostCounts[post.user.id] = (userPostCounts[post.user.id] || 0) + 1;
        
        // Count likes received by user
        userLikeCounts[post.user.id] = (userLikeCounts[post.user.id] || 0) + post.likes.length;
        
        // Count hearts received by user
        userHeartCounts[post.user.id] = (userHeartCounts[post.user.id] || 0) + post.hearts.length;
        
        // Track most saved posts
        if (post.hearts.length > 0) {
          mostSavedPosts.push({ post, count: post.hearts.length });
        }
        
        // Count comments by user
        const countComments = (comments: any[]) => {
          comments.forEach(comment => {
            userCommentCounts[comment.user.id] = (userCommentCounts[comment.user.id] || 0) + 1;
            if (comment.replies && comment.replies.length > 0) {
              countComments(comment.replies);
            }
          });
        };
        
        countComments(post.comments);
      });
      
      // Get active group from context
      const activeGroup = groups.activeGroup;
      if (!activeGroup) return null;
      
      // Convert to arrays and sort
      const mostUploads = Object.entries(userPostCounts)
        .map(([userId, count]) => {
          const user = activeGroup.members.find(member => member.id === userId);
          return { user, count };
        })
        .filter(item => item.user)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const mostLiked = Object.entries(userLikeCounts)
        .map(([userId, count]) => {
          const user = activeGroup.members.find(member => member.id === userId);
          return { user, count };
        })
        .filter(item => item.user)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const mostHearted = Object.entries(userHeartCounts)
        .map(([userId, count]) => {
          const user = activeGroup.members.find(member => member.id === userId);
          return { user, count };
        })
        .filter(item => item.user)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const mostCommented = Object.entries(userCommentCounts)
        .map(([userId, count]) => {
          const user = activeGroup.members.find(member => member.id === userId);
          return { user, count };
        })
        .filter(item => item.user)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Sort most saved posts
      mostSavedPosts.sort((a, b) => b.count - a.count);
      
      return {
        mostUploads,
        mostLiked,
        mostHearted,
        mostCommented,
        mostSavedPosts: mostSavedPosts.slice(0, 5)
      };
    },
    
    getUserStats: (userId: string, groupId: string) => {
      const groupPosts = posts.posts.filter(post => post.group?.id === groupId);
      
      let uploads = 0;
      let likes = 0;
      let dislikes = 0;
      let hearts = 0;
      let commentCount = 0;
      
      // Count user's posts
      uploads = groupPosts.filter(post => post.user.id === userId).length;
      
      // Count likes, dislikes, and hearts given by user
      groupPosts.forEach(post => {
        if (post.likes.includes(userId)) likes++;
        if (post.dislikes.includes(userId)) dislikes++;
        if (post.hearts.includes(userId)) hearts++;
      });
      
      // Count comments by user
      const countUserComments = (comments: any[], userId: string): number => {
        let count = 0;
        comments.forEach(comment => {
          if (comment.user.id === userId) count++;
          if (comment.replies && comment.replies.length > 0) {
            count += countUserComments(comment.replies, userId);
          }
        });
        return count;
      };
      
      groupPosts.forEach(post => {
        commentCount += countUserComments(post.comments, userId);
      });
      
      return {
        uploads,
        likes,
        dislikes,
        hearts,
        commentCount
      };
    },
    
    // Add any other methods that combine functionality from multiple contexts here
    createGroup: async (name: string, icon: string, description: string = "") => {
      // Implementation would combine functionality from groups context
      // Placeholder for now
      return null;
    },
    
    joinGroup: async (inviteCode: string) => {
      // Implementation would combine functionality from groups context
      // Placeholder for now
      return false;
    }
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <GroupsProvider>
      <PostsProvider>
        {children}
      </PostsProvider>
    </GroupsProvider>
  </AuthProvider>
);
