
import { Post, Group, User } from "@/types";

export const useStats = (posts: Post[], groups: Group[], currentUser: User | null) => {
  const getGroupStats = (groupId: string) => {
    const groupPosts = posts.filter(post => post.group?.id === groupId);
    
    const userPostCounts: Record<string, number> = {};
    const userLikeCounts: Record<string, number> = {};
    const userHeartCounts: Record<string, number> = {};
    const userCommentCounts: Record<string, number> = {};
    const mostSavedPosts: { post: any; count: number }[] = [];
    
    groupPosts.forEach(post => {
      userPostCounts[post.user.id] = (userPostCounts[post.user.id] || 0) + 1;
      userLikeCounts[post.user.id] = (userLikeCounts[post.user.id] || 0) + post.likes.length;
      userHeartCounts[post.user.id] = (userHeartCounts[post.user.id] || 0) + post.hearts.length;
      if (post.hearts.length > 0) {
        mostSavedPosts.push({ post, count: post.hearts.length });
      }
      
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
    
    const activeGroup = groups.find(g => g.id === groupId);
    if (!activeGroup) return null;
    
    // Get user streaks from localStorage
    const userStreaks: Record<string, number> = {};
    activeGroup.members.forEach(member => {
      const streakCount = parseInt(localStorage.getItem(`streakCount_${member.id}`) || '0');
      if (streakCount > 0) {
        userStreaks[member.id] = streakCount;
      }
    });
    
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
      
    const mostStreaks = Object.entries(userStreaks)
      .map(([userId, count]) => {
        const user = activeGroup.members.find(member => member.id === userId);
        return { user, count };
      })
      .filter(item => item.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    mostSavedPosts.sort((a, b) => b.count - a.count);
    
    return {
      mostUploads,
      mostLiked,
      mostHearted,
      mostCommented,
      mostStreaks,
      mostSavedPosts: mostSavedPosts.slice(0, 5)
    };
  };
  
  const getUserStats = (userId: string, groupId: string) => {
    const groupPosts = posts.filter(post => post.group?.id === groupId);
    
    let uploads = 0;
    let likes = 0;
    let dislikes = 0;
    let hearts = 0;
    let commentCount = 0;
    
    uploads = groupPosts.filter(post => post.user.id === userId).length;
    
    groupPosts.forEach(post => {
      if (post.likes.includes(userId)) likes++;
      if (post.dislikes.includes(userId)) dislikes++;
      if (post.hearts.includes(userId)) hearts++;
    });
    
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
    
    // Get user streak from localStorage
    const streak = parseInt(localStorage.getItem(`streakCount_${userId}`) || '0');
    
    return {
      uploads,
      likes,
      dislikes,
      hearts,
      commentCount,
      streak
    };
  };

  return {
    getGroupStats,
    getUserStats
  };
};
