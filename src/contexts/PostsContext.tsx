
import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types";
import { useAuth } from "./AuthContext";
import { useGroups } from "./GroupsContext";
import { PostsContextType } from "@/types";

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeGroup } = useGroups();
  const [posts, setPosts] = useState<Post[]>([]);

  const addPost = async (groupId: string, caption: string, mediaUrl: string, mediaType: "image" | "video") => {
    if (!currentUser) return;
    if (!groupId || !mediaUrl) return;

    const newPost = {
      user_id: currentUser.id,
      group_id: groupId,
      caption,
      media_url: mediaUrl,
      media_type: mediaType,
      likes: [],
      dislikes: [],
      hearts: [],
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(newPost)
      .select()
      .single();

    if (error) {
      console.error("Error saving post:", error);
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
      };
      setPosts(p => [postObj, ...p]);
    }
  };

  const deletePost = (postId: string) => {
    if (!currentUser) return;
    setPosts(posts => posts.filter(p => p.id !== postId));
  };

  // Add missing methods
  const likePost = async (postId: string) => {
    if (!currentUser) return;
    
    // Find post in state
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Toggle like
    let newLikes = [...post.likes];
    const userIndex = newLikes.indexOf(currentUser.id);
    
    if (userIndex > -1) {
      // User already liked, so remove like
      newLikes.splice(userIndex, 1);
    } else {
      // User hasn't liked, so add like
      newLikes.push(currentUser.id);
      
      // Remove from dislikes if present
      const dislikeIndex = post.dislikes.indexOf(currentUser.id);
      if (dislikeIndex > -1) {
        const newDislikes = [...post.dislikes];
        newDislikes.splice(dislikeIndex, 1);
        
        // Update post in state with new likes and dislikes
        setPosts(currentPosts => 
          currentPosts.map(p => 
            p.id === postId ? {...p, likes: newLikes, dislikes: newDislikes} : p
          )
        );
        
        // Update in database
        await supabase
          .from("posts")
          .update({
            likes: newLikes,
            dislikes: post.dislikes.filter(id => id !== currentUser.id)
          })
          .eq("id", postId);
          
        return;
      }
    }
    
    // Update post in state
    setPosts(currentPosts => 
      currentPosts.map(p => 
        p.id === postId ? {...p, likes: newLikes} : p
      )
    );
    
    // Update in database
    await supabase
      .from("posts")
      .update({ likes: newLikes })
      .eq("id", postId);
  };

  const dislikePost = async (postId: string) => {
    if (!currentUser) return;
    
    // Find post in state
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Toggle dislike
    let newDislikes = [...post.dislikes];
    const userIndex = newDislikes.indexOf(currentUser.id);
    
    if (userIndex > -1) {
      // User already disliked, so remove dislike
      newDislikes.splice(userIndex, 1);
    } else {
      // User hasn't disliked, so add dislike
      newDislikes.push(currentUser.id);
      
      // Remove from likes if present
      const likeIndex = post.likes.indexOf(currentUser.id);
      if (likeIndex > -1) {
        const newLikes = [...post.likes];
        newLikes.splice(likeIndex, 1);
        
        // Update post in state with new likes and dislikes
        setPosts(currentPosts => 
          currentPosts.map(p => 
            p.id === postId ? {...p, likes: newLikes, dislikes: newDislikes} : p
          )
        );
        
        // Update in database
        await supabase
          .from("posts")
          .update({
            likes: post.likes.filter(id => id !== currentUser.id),
            dislikes: newDislikes
          })
          .eq("id", postId);
          
        return;
      }
    }
    
    // Update post in state
    setPosts(currentPosts => 
      currentPosts.map(p => 
        p.id === postId ? {...p, dislikes: newDislikes} : p
      )
    );
    
    // Update in database
    await supabase
      .from("posts")
      .update({ dislikes: newDislikes })
      .eq("id", postId);
  };

  const heartPost = async (postId: string) => {
    if (!currentUser) return;
    
    // Find post in state
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Toggle heart
    let newHearts = [...post.hearts];
    const userIndex = newHearts.indexOf(currentUser.id);
    
    if (userIndex > -1) {
      // User already hearted, so remove heart
      newHearts.splice(userIndex, 1);
    } else {
      // User hasn't hearted, so add heart
      newHearts.push(currentUser.id);
    }
    
    // Update post in state
    setPosts(currentPosts => 
      currentPosts.map(p => 
        p.id === postId ? {...p, hearts: newHearts} : p
      )
    );
    
    // Update in database
    await supabase
      .from("posts")
      .update({ hearts: newHearts })
      .eq("id", postId);
  };

  const addComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!currentUser || !content.trim()) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user: currentUser,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      replies: []
    };
    
    // For now, just add to local state
    // In a real app, you would save to database
    if (parentCommentId) {
      // Add as a reply
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReply(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId ? {...p, comments: addReply(p.comments)} : p
        )
      );
    } else {
      // Add as a top-level comment
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId ? {...p, comments: [...p.comments, newComment]} : p
        )
      );
    }
  };

  return (
    <PostsContext.Provider value={{
      posts, setPosts, addPost, deletePost, likePost, dislikePost, heartPost, addComment
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
