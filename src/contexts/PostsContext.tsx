import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types";
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

  return (
    <PostsContext.Provider value={{
      posts, setPosts, addPost, deletePost, 
      // Include other methods here
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