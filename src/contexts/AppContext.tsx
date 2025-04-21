
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Group, Post, Comment } from "../types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

// Mock data
import { mockUsers } from "../data/mockData";

interface AppContextType {
  currentUser: User | null;
  groups: Group[];
  posts: Post[];
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createGroup: (name: string, icon: string, description?: string) => void;
  joinGroup: (inviteCode: string) => boolean;
  leaveGroup: (groupId: string) => void;
  addPost: (groupId: string, caption: string, mediaUrl: string, mediaType: 'image' | 'video') => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  dislikePost: (postId: string) => void;
  heartPost: (postId: string) => void;
  addComment: (postId: string, content: string, parentCommentId?: string) => void;
  filterGroupPosts: (groupId: string) => Post[];
  getUserStats: (userId: string, groupId?: string) => any;
  getGroupStats: (groupId: string) => any;
  getSavedPosts: () => Post[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useSupabaseAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]); // Removed mockGroups
  const [posts, setPosts] = useState<Post[]>([]); // Removed mockPosts
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (authUser) {
      const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User';
      const avatar_url = authUser.user_metadata?.avatar_url || 'https://source.unsplash.com/random/100x100/?avatar';
      
      const appUser: User = {
        id: authUser.id,
        name: username,
        username: username,
        avatar: avatar_url,
      };
      
      setCurrentUser(appUser);

      // Since there are no groups, no need to add user to any group now.
      
    } else {
      setCurrentUser(null);
    }
  }, [authUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    return true;
  };

  const logout = () => {
    setActiveGroup(null);
  };

  const createGroup = (name: string, icon: string, description?: string) => {
    if (!currentUser) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      icon,
      description,
      members: [currentUser],
      createdAt: new Date().toISOString(),
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    setGroups([...groups, newGroup]);
  };

  const joinGroup = (inviteCode: string): boolean => {
    if (!currentUser) return false;

    const groupIndex = groups.findIndex(g => g.inviteCode === inviteCode);
    if (groupIndex === -1) return false;

    if (groups[groupIndex].members.some(m => m.id === currentUser.id)) {
      return true;
    }

    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members.push(currentUser);
    setGroups(updatedGroups);
    return true;
  };

  const leaveGroup = (groupId: string) => {
    if (!currentUser) return;

    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;

    const updatedGroups = [...groups];
    updatedGroups[groupIndex].members = updatedGroups[groupIndex].members.filter(
      m => m.id !== currentUser.id
    );

    if (updatedGroups[groupIndex].members.length === 0) {
      updatedGroups.splice(groupIndex, 1);
    }

    setGroups(updatedGroups);
    if (activeGroup?.id === groupId) {
      setActiveGroup(null);
    }
  };

  const addPost = (groupId: string, caption: string, mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!currentUser) return;

    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newPost: Post = {
      id: Date.now().toString(),
      user: currentUser,
      group,
      caption,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      likes: [],
      dislikes: [],
      hearts: [],
      comments: []
    };

    setPosts([...posts, newPost]);
  };

  const deletePost = (postId: string) => {
    if (!currentUser) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    if (posts[postIndex].user.id !== currentUser.id) return;

    const updatedPosts = [...posts];
    updatedPosts.splice(postIndex, 1);
    setPosts(updatedPosts);
  };

  const likePost = (postId: string) => {
    if (!currentUser) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const updatedPosts = [...posts];
    const post = updatedPosts[postIndex];

    if (post.likes.includes(currentUser.id)) {
      post.likes = post.likes.filter(id => id !== currentUser.id);
    } else {
      post.likes.push(currentUser.id);
      post.dislikes = post.dislikes.filter(id => id !== currentUser.id);
    }

    setPosts(updatedPosts);
  };

  const dislikePost = (postId: string) => {
    if (!currentUser) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const updatedPosts = [...posts];
    const post = updatedPosts[postIndex];

    if (post.dislikes.includes(currentUser.id)) {
      post.dislikes = post.dislikes.filter(id => id !== currentUser.id);
    } else {
      post.dislikes.push(currentUser.id);
      post.likes = post.likes.filter(id => id !== currentUser.id);
    }

    setPosts(updatedPosts);
  };

  const heartPost = (postId: string) => {
    if (!currentUser) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const updatedPosts = [...posts];
    const post = updatedPosts[postIndex];

    if (post.hearts.includes(currentUser.id)) {
      post.hearts = post.hearts.filter(id => id !== currentUser.id);
    } else {
      post.hearts.push(currentUser.id);
    }

    setPosts(updatedPosts);
  };

  const addComment = (postId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const updatedPosts = [...posts];
    const post = updatedPosts[postIndex];

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
            comments[i].replies.push(newComment);
            return true;
          }
          if (comments[i].replies && findAndAddReply(comments[i].replies)) {
            return true;
          }
        }
        return false;
      };

      findAndAddReply(post.comments);
    } else {
      post.comments.push(newComment);
    }

    setPosts(updatedPosts);
  };

  const filterGroupPosts = (groupId: string) => {
    return posts.filter(post => post.group.id === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getUserStats = (userId: string, groupId?: string) => {
    let filteredPosts = posts;
    if (groupId) {
      filteredPosts = posts.filter(post => post.group.id === groupId);
    }

    const userPosts = filteredPosts.filter(post => post.user.id === userId);

    const stats = {
      uploads: userPosts.length,
      likes: filteredPosts.reduce((count, post) => 
        post.likes.includes(userId) ? count + 1 : count, 0),
      dislikes: filteredPosts.reduce((count, post) => 
        post.dislikes.includes(userId) ? count + 1 : count, 0),
      hearts: filteredPosts.reduce((count, post) => 
        post.hearts.includes(userId) ? count + 1 : count, 0),
      commentCount: filteredPosts.reduce((count, post) => {
        const userComments = post.comments.filter(c => c.user.id === userId).length;
        
        const userReplies = post.comments.reduce((replyCount, comment) => {
          if (!comment.replies) return replyCount;
          return replyCount + comment.replies.filter(r => r.user.id === userId).length;
        }, 0);
        
        return count + userComments + userReplies;
      }, 0),
      receivedLikes: userPosts.reduce((count, post) => count + post.likes.length, 0),
      receivedDislikes: userPosts.reduce((count, post) => count + post.dislikes.length, 0),
      receivedHearts: userPosts.reduce((count, post) => count + post.hearts.length, 0)
    };

    return stats;
  };

  const getGroupStats = (groupId: string) => {
    const groupPosts = posts.filter(post => post.group.id === groupId);
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;

    const members = group.members;

    const memberStats = members.map(member => {
      const stats = getUserStats(member.id, groupId);
      return {
        user: member,
        stats
      };
    });

    const mostUploads = [...memberStats]
      .sort((a, b) => b.stats.uploads - a.stats.uploads)
      .slice(0, 5)
      .map(m => ({ user: m.user, count: m.stats.uploads }));

    const mostLiked = [...memberStats]
      .sort((a, b) => b.stats.receivedLikes - a.stats.receivedLikes)
      .slice(0, 5)
      .map(m => ({ user: m.user, count: m.stats.receivedLikes }));

    const mostDisliked = [...memberStats]
      .sort((a, b) => b.stats.receivedDislikes - a.stats.receivedDislikes)
      .slice(0, 5)
      .map(m => ({ user: m.user, count: m.stats.receivedDislikes }));

    const mostHearted = [...memberStats]
      .sort((a, b) => b.stats.receivedHearts - a.stats.receivedHearts)
      .slice(0, 5)
      .map(m => ({ user: m.user, count: m.stats.receivedHearts }));

    const mostCommented = [...memberStats]
      .sort((a, b) => b.stats.commentCount - a.stats.commentCount)
      .slice(0, 5)
      .map(m => ({ user: m.user, count: m.stats.commentCount }));

    const sortedPosts = [...groupPosts]
      .sort((a, b) => b.hearts.length - a.hearts.length)
      .slice(0, 5)
      .map(post => ({ post, count: post.hearts.length }));

    return {
      mostUploads,
      mostLiked,
      mostDisliked,
      mostHearted,
      mostCommented,
      mostSavedPosts: sortedPosts
    };
  };

  const getSavedPosts = () => {
    if (!currentUser) return [];
    return posts.filter(post => post.hearts.includes(currentUser.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        groups,
        posts,
        activeGroup,
        setActiveGroup,
        login,
        logout,
        createGroup,
        joinGroup,
        leaveGroup,
        addPost,
        deletePost,
        likePost,
        dislikePost,
        heartPost,
        addComment,
        filterGroupPosts,
        getUserStats,
        getGroupStats,
        getSavedPosts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

