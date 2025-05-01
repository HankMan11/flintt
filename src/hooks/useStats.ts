
import { useState } from "react";
import { Group, Post, User } from "@/types";

/**
 * Hook for group and user statistics functionality
 */
export const useStats = (posts: Post[]) => {
  // Get group stats
  const getGroupStats = (groupId: string, timeRange: "all" | "month" | "week", groups: Group[]) => {
    if (!groups.length) return null;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;
    
    // Filter posts by time range and group
    const filteredPosts = posts.filter(post => {
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
    const filteredPosts = posts.filter(post => {
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
    getGroupStats,
    getUserStats
  };
};
