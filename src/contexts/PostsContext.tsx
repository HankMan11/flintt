
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
  likePost: (postId: string) => void;
  dislikePost: (postId: string) => void;
  heartPost: (postId: string) => void;
  addComment: (postId: string, content: string, parentCommentId?: string) => void;
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

  const likePost = (postId: string) => {
    if (!currentUser) return;

    setPosts(posts => posts.map(post => {
      if (post.id !== postId) return post;
      let newLikes = post.likes;
      let newDislikes = post.dislikes;
      if (newLikes.includes(currentUser.id)) {
        newLikes = newLikes.filter(id => id !== currentUser.id);
      } else {
        newLikes = [...newLikes, currentUser.id];
        newDislikes = newDislikes.filter(id => id !== currentUser.id);
      }
      return { ...post, likes: newLikes, dislikes: newDislikes };
    }));
  };

  const dislikePost = (postId: string) => {
    if (!currentUser) return;

    setPosts(posts => posts.map(post => {
      if (post.id !== postId) return post;
      let newDislikes = post.dislikes;
      let newLikes = post.likes;
      if (newDislikes.includes(currentUser.id)) {
        newDislikes = newDislikes.filter(id => id !== currentUser.id);
      } else {
        newDislikes = [...newDislikes, currentUser.id];
        newLikes = newLikes.filter(id => id !== currentUser.id);
      }
      return { ...post, dislikes: newDislikes, likes: newLikes };
    }));
  };

  const heartPost = (postId: string) => {
    if (!currentUser) return;

    setPosts(posts => posts.map(post => {
      if (post.id !== postId) return post;
      let newHearts = post.hearts;
      if (newHearts.includes(currentUser.id)) {
        newHearts = newHearts.filter(id => id !== currentUser.id);
      } else {
        newHearts = [...newHearts, currentUser.id];
      }
      return { ...post, hearts: newHearts };
    }));
  };

  const addComment = (postId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) return;

    setPosts(posts => posts.map(post => {
      if (post.id !== postId) return post;

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
      return { ...post };
    }));
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
