import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { GroupsProvider, useGroups } from "./GroupsContext";
import { PostsProvider, usePosts } from "./PostsContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsProvider } from "./NotificationsContext";

export const useApp = () => {
  const auth = useAuth();
  const groups = useGroups();
  const posts = usePosts();

  return {
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    login: auth.login,
    logout: auth.logout,

    groups: groups.groups,
    setGroups: groups.setGroups,
    activeGroup: groups.activeGroup,
    setActiveGroup: groups.setActiveGroup,
    loadingGroups: groups.loadingGroups,
    setLoadingGroups: groups.setLoadingGroups,
    fetchGroups: groups.fetchGroups,

    posts: posts.posts,
    setPosts: posts.setPosts,
    addPost: posts.addPost,
    deletePost: posts.deletePost,
    likePost: posts.likePost,
    dislikePost: posts.dislikePost,
    heartPost: posts.heartPost,
    addComment: posts.addComment,

    filterGroupPosts: (groupId: string) => {
      return posts.posts.filter(post => post.group?.id === groupId);
    },
    
    getSavedPosts: () => {
      if (!auth.currentUser) return [];
      return posts.posts.filter(post => post.hearts.includes(auth.currentUser!.id));
    },
    
    getGroupStats: (groupId: string, timeRange?: 'all' | 'month' | 'week') => {
      const groupPosts = posts.posts.filter(post => post.group?.id === groupId);
      
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
      
      const activeGroup = groups.activeGroup;
      if (!activeGroup) return null;
      
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
      
      mostSavedPosts.sort((a, b) => b.count - a.count);
      
      return {
        mostUploads,
        mostLiked,
        mostHearted,
        mostCommented,
        mostSavedPosts: mostSavedPosts.slice(0, 5)
      };
    },
    
    getUserStats: (userId: string, groupId: string, timeRange?: 'all' | 'month' | 'week') => {
      const groupPosts = posts.posts.filter(post => post.group?.id === groupId);
      
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
      
      return {
        uploads,
        likes,
        dislikes,
        hearts,
        commentCount
      };
    },
    
    createGroup: async (name: string, icon: string, description: string = "") => {
      if (!auth.currentUser) return null;
      
      try {
        const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Upload image if provided
        let imageUrl = icon;
        if (icon instanceof File) {
          const ext = icon.name.split('.').pop();
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('group-images')
            .upload(filename, icon);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            return null;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('group-images')
            .getPublicUrl(filename);
          
          imageUrl = publicUrl;
        }

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert({
            name,
            icon: imageUrl,
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
          members: [auth.currentUser]
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
const handleReport = async (postId: string, reason: string, details: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: currentUser.id,
          reported_post_id: postId,
          reason: reason,
          details: details,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe."
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  };
