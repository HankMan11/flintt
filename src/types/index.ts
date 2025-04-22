export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

export type GroupRole = 'admin' | 'member';

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  user: User;
}

export interface Group {
  id: string;
  name: string;
  imageUrl?: string;
  icon?: string;
  members: GroupMember[];
  createdAt: string;
  description?: string;
  inviteCode?: string;
  isArchived?: boolean;
  pinnedPosts?: string[];
  weeklyStats?: {
    lastReset: string;
    topPosters: { userId: string; count: number }[];
    topReactors: { userId: string; count: number }[];
    topLiked: { userId: string; count: number }[];
  };
}

export interface GroupRole {
  type: 'admin' | 'member';
  permissions: {
    canManageSettings: boolean;
    canManageMembers: boolean;
    canPinPosts: boolean;
    canPost: boolean;
    canReact: boolean;
    canComment: boolean;
  };
}

export interface UserStats {
  streak: number;
  lastActive: string;
  totalPosts: number;
  totalReactions: number;
  totalComments: number;
}

export interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  loadingGroups: boolean;
  setLoadingGroups: React.Dispatch<React.SetStateAction<boolean>>;
  uploadingImage: boolean;
  uploadGroupImage: (file: File) => Promise<string | null>;
  fetchGroups: () => Promise<void>;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  user_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  type: 'like' | 'dislike' | 'heart' | 'comment';
  related_post_id?: string;
  related_group_id?: string;
  actor_id?: string;
}

export interface Post {
  id: string;
  user: User;
  group: Group;
  caption?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  likes: string[];
  dislikes: string[];
  hearts: string[];
  comments: Comment[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedPostId?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface BlockedUser {
  userId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface Stats {
  mostUploads: {
    user: User;
    count: number;
  }[];
  mostLiked: {
    user: User;
    count: number;
  }[];
  mostDisliked: {
    user: User;
    count: number;
  }[];
  mostHearted: {
    user: User;
    count: number;
  }[];
  mostComments: {
    user: User;
    count: number;
  }[];
  mostSaved: {
    post: Post;
    count: number;
  }[];
  personalStats: {
    likes: number;
    hearts: number;
    uploads: number;
    comments: number;
  };
}