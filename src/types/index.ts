
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
}

export interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  activeGroup: Group | null;
  setActiveGroup: (group: Group | null) => void;
  loadingGroups: boolean;
  setLoadingGroups: React.Dispatch<React.SetStateAction<boolean>>;
  fetchGroups: () => Promise<void>;
  uploadGroupImage: (file: File) => Promise<string | null>;
  uploadingImage: boolean;
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

export interface PostsContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (groupId: string, caption: string, mediaUrl: string, mediaType: "image" | "video") => Promise<void>;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => Promise<void>;
  dislikePost: (postId: string) => Promise<void>;
  heartPost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>;
}
