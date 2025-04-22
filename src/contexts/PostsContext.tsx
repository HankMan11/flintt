import React, { createContext, useContext, useState, useEffect } from "react";
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

interface UserActivity {
  lastActive: Date;
  streak: number;
}

export const PostsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeGroup } = useGroups();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userActivity, setUserActivity] = useState<Record<string, UserActivity>>({});

  // Fetch posts for active group
  const fetchPosts = async (groupId: string) => {
    if (!groupId) return;

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (postsData) {
        const formattedPosts = postsData.map(post => ({
          id: post.id,
          user: {
            id: post.user.id,
            name: post.user.username || 'Anonymous',
            username: post.user.username || 'anonymous',
            avatar: post.user.avatar_url
          },
          group: activeGroup!,
          caption: post.caption,
          mediaUrl: post.media_url,
          mediaType: post.media_type,
          createdAt: post.created_at,
          likes: post.likes || [],
          dislikes: post.dislikes || [],
          hearts: post.hearts || [],
          comments: post.comments || []
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Subscribe to post changes
  useEffect(() => {
    if (!activeGroup?.id) return;

    // Initial fetch
    fetchPosts(activeGroup.id);

    // Subscribe to changes
    const subscription = supabase
      .channel(`posts_${activeGroup.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `group_id=eq.${activeGroup.id}`
      }, () => {
        fetchPosts(activeGroup.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeGroup?.id]);

  // Update user activity and streak
  const updateUserActivity = (userId: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    setUserActivity(prev => {
      const userStats = prev[userId];
      if (!userStats) {
        return { ...prev, [userId]: { lastActive: today, streak: 1 } };
      }

      const lastActive = new Date(userStats.lastActive);
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = userStats.streak;
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }

      return { ...prev, [userId]: { lastActive: today, streak: newStreak } };
    });
  };

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

    const { error } = await supabase
      .from("posts")
      .insert(newPost);

    if (error) {
      console.error("Error saving post:", error);
      return;
    }

    // Posts will be automatically updated via subscription
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

const usePosts = (): PostsContextType => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within a PostsProvider");
  return ctx;
};
export {usePosts};