import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, Comment, User, Group } from "@/types";
import { useAuth } from "./AuthContext";
import { useGroups } from "./GroupsContext";
import { useToast } from "@/hooks/use-toast";

interface PostsContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (groupId: string, caption: string, mediaUrl: string, mediaType: "image" | "video") => Promise<void>;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => Promise<void>;
  dislikePost: (postId: string) => Promise<void>;
  heartPost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
  editPost: (postId: string, caption: string) => Promise<void>;
  pinPost: (postId: string, isPinned: boolean) => Promise<void>;
  reportPost: (postId: string, reason: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  updateUserStreak: (userId: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeGroup } = useGroups();
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  
  // Track user streaks
  const [userStreaks, setUserStreaks] = useState<Record<string, number>>({});

  const addPost = async (groupId: string, caption: string, mediaUrl: string, mediaType: "image" | "video") => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      return;
    }
    
    if (!groupId || !mediaUrl) {
      toast({
        title: "Missing information",
        description: "Group ID and media URL are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const newPost = {
        user_id: currentUser.id,
        group_id: groupId,
        caption,
        media_url: mediaUrl,
        media_type: mediaType,
        likes: [],
        dislikes: [],
        hearts: [],
        is_pinned: false,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select()
        .single();

      if (error) {
        console.error("Error saving post:", error);
        toast({
          title: "Error creating post",
          description: error.message || "Failed to save your post to the database",
          variant: "destructive"
        });
        return;
      }

      if (activeGroup) {
        const postObj: Post = {
          id: data.id,
          user: currentUser,
          group: activeGroup,
          caption: data.caption || undefined,
          mediaUrl: data.media_url,
          mediaType: data.media_type === "video" ? "video" : "image",
          createdAt: data.created_at,
          likes: data.likes ?? [],
          dislikes: data.dislikes ?? [],
          hearts: data.hearts ?? [],
          comments: [],
          isPinned: data.is_pinned || false,
        };
        setPosts(p => [postObj, ...p]);
        
        // Notify group members about the new post
        notifyGroupMembers(groupId, `${currentUser.name} posted in ${activeGroup.name}`, 'new_post', data.id);
        
        // Update user streak
        updateUserStreak(currentUser.id);
      }
    } catch (error) {
      console.error("Unexpected error creating post:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating your post",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
        
      if (error) {
        console.error('Error deleting post:', error);
        return;
      }
      
      setPosts(posts => posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const likePost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      let newLikes = post.likes;
      let newDislikes = post.dislikes;
      let shouldNotify = false;

      if (newLikes.includes(currentUser.id)) {
        newLikes = newLikes.filter(id => id !== currentUser.id);
      } else {
        newLikes = [...newLikes, currentUser.id];
        newDislikes = newDislikes.filter(id => id !== currentUser.id);
        shouldNotify = post.user.id !== currentUser.id;
        
        // Update user streak when liking a post
        updateUserStreak(currentUser.id);
      }

      const { error } = await supabase
        .from('posts')
        .update({
          likes: newLikes,
          dislikes: newDislikes
        })
        .eq('id', postId);

      if (error) throw error;

      if (shouldNotify) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user.id,
            type: 'like',
            content: `${currentUser.name} liked your post`,
            related_post_id: postId,
            actor_id: currentUser.id
          });
      }

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: newLikes, dislikes: newDislikes }
          : p
      ));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const dislikePost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      let newDislikes = post.dislikes;
      let newLikes = post.likes;
      let shouldNotify = false;

      if (newDislikes.includes(currentUser.id)) {
        newDislikes = newDislikes.filter(id => id !== currentUser.id);
      } else {
        newDislikes = [...newDislikes, currentUser.id];
        newLikes = newLikes.filter(id => id !== currentUser.id);
        shouldNotify = post.user.id !== currentUser.id;
        
        // Update user streak when disliking a post
        updateUserStreak(currentUser.id);
      }

      const { error } = await supabase
        .from('posts')
        .update({
          dislikes: newDislikes,
          likes: newLikes
        })
        .eq('id', postId);

      if (error) throw error;

      if (shouldNotify) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user.id,
            type: 'dislike',
            content: `${currentUser.name} disliked your post`,
            related_post_id: postId,
            actor_id: currentUser.id
          });
      }

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, dislikes: newDislikes, likes: newLikes }
          : p
      ));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const heartPost = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      let newHearts = post.hearts;
      let shouldNotify = false;

      if (newHearts.includes(currentUser.id)) {
        newHearts = newHearts.filter(id => id !== currentUser.id);
      } else {
        newHearts = [...newHearts, currentUser.id];
        shouldNotify = post.user.id !== currentUser.id;
        
        // Update user streak when adding a heart
        updateUserStreak(currentUser.id);
      }

      const { error } = await supabase
        .from('posts')
        .update({
          hearts: newHearts
        })
        .eq('id', postId);

      if (error) throw error;

      if (shouldNotify) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user.id,
            type: 'heart',
            content: `${currentUser.name} saved your post`,
            related_post_id: postId,
            actor_id: currentUser.id
          });
      }

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, hearts: newHearts }
          : p
      ));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const addComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        user: currentUser,
        content,
        createdAt: new Date().toISOString()
      };

      if (parentCommentId) {
        const findAndAddReply = (comments: Comment[]): boolean => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === parentCommentId) {
              if (!comments[i].replies) {
                comments[i].replies = [];
              }
              comments[i].replies!.push(newComment);
              return true;
            }
            if (comments[i].replies && findAndAddReply(comments[i].replies!)) {
              return true;
            }
          }
          return false;
        };
        findAndAddReply(post.comments);
      } else {
        post.comments.push(newComment);
      }

      if (post.user.id !== currentUser.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user.id,
            type: 'comment',
            content: `${currentUser.name} commented on your post`,
            related_post_id: postId,
            actor_id: currentUser.id
          });
      }

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p }
          : p
      ));
      
      // Update user streak when commenting
      updateUserStreak(currentUser.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const editPost = async (postId: string, caption: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ caption })
        .eq('id', postId)
        .eq('user_id', currentUser.id);
        
      if (error) {
        console.error('Error updating post:', error);
        toast({
          title: "Error",
          description: "Failed to update post",
          variant: "destructive"
        });
        return;
      }
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, caption } 
          : p
      ));
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully"
      });
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };
  
  const pinPost = async (postId: string, isPinned: boolean) => {
    if (!currentUser) return;
    
    try {
      // First check if the user is an admin of the group
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const { data, error: adminCheckError } = await supabase
        .from('group_members')
        .select('*') // Use select * to get all columns including the newly added is_admin
        .eq('group_id', post.group.id)
        .eq('user_id', currentUser.id)
        .single();
        
      if (adminCheckError || !data?.is_admin) {
        toast({
          title: "Permission denied",
          description: "Only group admins can pin posts",
          variant: "destructive"
        });
        return;
      }
      
      // Update the post - use is_pinned which we've added in our SQL migration
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);
        
      if (error) {
        console.error('Error pinning post:', error);
        toast({
          title: "Error",
          description: "Failed to update post",
          variant: "destructive"
        });
        return;
      }
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isPinned } 
          : p
      ));
      
      toast({
        title: isPinned ? "Post pinned" : "Post unpinned",
        description: isPinned ? "Post will now appear at the top of the feed" : "Post has been unpinned"
      });
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };
  
  const reportPost = async (postId: string, reason: string) => {
    if (!currentUser) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      // In a real application, we would store this report in the database
      // For now, we'll just show a toast notification
      toast({
        title: "Post reported",
        description: "Thank you for reporting this post. Our team will review it.",
      });
      
      console.log(`Post ${postId} reported by ${currentUser.id} for reason: ${reason}`);
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };
  
  const blockUser = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      // In a real app, we would store blocked users in the database
      // For now, we'll just show a toast
      toast({
        title: "User blocked",
        description: "You will no longer see content from this user",
      });
      
      console.log(`User ${userId} blocked by ${currentUser.id}`);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };
  
  const updateUserStreak = (userId: string) => {
    if (!userId) return;
    
    // Get the current date
    const today = new Date().toDateString();
    
    // Get the last activity date from localStorage
    const lastActivityKey = `lastActivity_${userId}`;
    const streakCountKey = `streakCount_${userId}`;
    
    const lastActivity = localStorage.getItem(lastActivityKey);
    let streakCount = parseInt(localStorage.getItem(streakCountKey) || '0');
    
    if (!lastActivity) {
      // First activity
      streakCount = 1;
    } else if (lastActivity !== today) {
      // If the last activity was not today, increment the streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        // If the last activity was yesterday, increment the streak
        streakCount += 1;
      } else {
        // If there was a gap, reset the streak
        streakCount = 1;
      }
    }
    
    // Save the updated streak info
    localStorage.setItem(lastActivityKey, today);
    localStorage.setItem(streakCountKey, streakCount.toString());
    
    // Update state
    setUserStreaks(prev => ({
      ...prev,
      [userId]: streakCount
    }));
  };
  
  // Helper function to notify all group members
  const notifyGroupMembers = async (groupId: string, content: string, type: string, relatedPostId?: string) => {
    if (!currentUser) return;
    
    try {
      // Get all group members
      const { data: members, error } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
        
      if (error) {
        console.error('Error fetching group members:', error);
        return;
      }
      
      // Filter out the current user
      const otherMembers = members.filter(member => member.user_id !== currentUser.id);
      
      // Create a notification for each member
      for (const member of otherMembers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: member.user_id,
            type,
            content,
            related_post_id: relatedPostId,
            related_group_id: groupId,
            actor_id: currentUser.id
          });
      }
    } catch (error) {
      console.error('Error notifying group members:', error);
    }
  };

  return (
    <PostsContext.Provider value={{
      posts, 
      setPosts, 
      addPost, 
      deletePost, 
      likePost, 
      dislikePost, 
      heartPost, 
      addComment,
      editPost,
      pinPost,
      reportPost,
      blockUser,
      updateUserStreak
    }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextType => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within a PostsProvider");
  return ctx;
};
