import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, Comment, User, Group } from "@/types";
import { mockUsers } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { useGroups } from "./GroupsContext";

interface PostsContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (groupId: string, caption: string, mediaUrl: string, mediaType: "image" | "video") => Promise<void>;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => Promise<void>;
  dislikePost: (postId: string) => Promise<void>;
  heartPost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
}

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
    } catch (error) {
      console.error('Error adding comment:', error);
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
