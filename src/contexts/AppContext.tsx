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
  createGroup: (name: string, icon: string, description?: string) => Promise<Group | null>;
  joinGroup: (inviteCode: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
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
  loadingGroups: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useSupabaseAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Set up current user when auth changes
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
      
      // Load user's groups when user changes
      loadUserGroups(authUser.id);
    } else {
      setCurrentUser(null);
      setGroups([]);
      setActiveGroup(null);
    }
  }, [authUser]);

  // Load user's groups from Supabase
  const loadUserGroups = async (userId: string) => {
    setLoadingGroups(true);
    try {
      // Fetch groups the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (membershipError) {
        console.error('Error loading group memberships:', membershipError);
        setLoadingGroups(false);
        return;
      }

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        setLoadingGroups(false);
        return;
      }

      const groupIds = memberships.map(m => m.group_id);

      // Fetch the actual group details
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupsError) {
        console.error('Error loading groups:', groupsError);
        setLoadingGroups(false);
        return;
      }

      // For each group, get all members
      const loadedGroups: Group[] = [];
      
      for (const groupData of groupsData || []) {
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupData.id);
          
        if (memberError) {
          console.error(`Error loading members for group ${groupData.id}:`, memberError);
          continue;
        }
        
        // For simplicity, we'll use mockUsers for member data
        // In a real app, you'd fetch the actual profile data for each member
        const members = memberData.map(m => {
          const mockUser = mockUsers.find(u => u.id === m.user_id) || {
            id: m.user_id,
            name: 'User',
            username: 'user',
            avatar: 'https://source.unsplash.com/random/100x100/?avatar'
          };
          return mockUser;
        });
        
        // Make sure the current user is included in members
        if (!members.some(m => m.id === userId)) {
          if (currentUser) {
            members.push(currentUser);
          }
        }
        
        loadedGroups.push({
          id: groupData.id,
          name: groupData.name,
          icon: groupData.icon,
          description: groupData.description || undefined,
          members,
          createdAt: groupData.created_at,
          inviteCode: groupData.invite_code
        });
      }
      
      setGroups(loadedGroups);
      
      // Set active group to the first one if none is selected
      if (loadedGroups.length > 0 && !activeGroup) {
        setActiveGroup(loadedGroups[0]);
      } else if (activeGroup) {
        // Update active group if it's in the loaded groups
        const updatedActiveGroup = loadedGroups.find(g => g.id === activeGroup.id);
        if (updatedActiveGroup) {
          setActiveGroup(updatedActiveGroup);
        } else if (loadedGroups.length > 0) {
          setActiveGroup(loadedGroups[0]);
        } else {
          setActiveGroup(null);
        }
      }
    } catch (error) {
      console.error('Error in loadUserGroups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    return true;
  };

  const logout = () => {
    setActiveGroup(null);
    setGroups([]);
  };

  const createGroup = async (name: string, icon: string, description?: string): Promise<Group | null> => {
    if (!currentUser) return null;

    try {
      // Generate a random invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Insert the new group into Supabase
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          icon,
          description,
          invite_code: inviteCode
        })
        .select()
        .single();
      
      if (groupError) {
        console.error('Error creating group:', groupError);
        return null;
      }
      
      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: currentUser.id
        });
      
      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Try to clean up the created group
        await supabase.from('groups').delete().eq('id', groupData.id);
        return null;
      }
      
      // Create the group object
      const newGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        icon: groupData.icon,
        description: groupData.description || undefined,
        members: [currentUser],
        createdAt: groupData.created_at,
        inviteCode: groupData.invite_code
      };
      
      // Update state
      setGroups([...groups, newGroup]);
      setActiveGroup(newGroup);
      
      return newGroup;
    } catch (error) {
      console.error('Error in createGroup:', error);
      return null;
    }
  };

  const joinGroup = async (inviteCode: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Find the group with the given invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      
      if (groupError || !groupData) {
        console.error('Error finding group:', groupError);
        return false;
      }
      
      // Check if the user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', currentUser.id)
        .single();
      
      if (existingMembership) {
        // User is already a member, just update the state
        await loadUserGroups(currentUser.id);
        return true;
      }
      
      // Add the user to the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: currentUser.id
        });
      
      if (joinError) {
        console.error('Error joining group:', joinError);
        return false;
      }
      
      // Reload groups to get updated list
      await loadUserGroups(currentUser.id);
      return true;
    } catch (error) {
      console.error('Error in joinGroup:', error);
      return false;
    }
  };

  const leaveGroup = async (groupId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Remove the user from the group
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Error leaving group:', error);
        return false;
      }
      
      // Update state
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      
      if (activeGroup?.id === groupId) {
        setActiveGroup(updatedGroups.length > 0 ? updatedGroups[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error in leaveGroup:', error);
      return false;
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
        getSavedPosts,
        loadingGroups
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
