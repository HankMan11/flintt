export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

export interface Group {
  id: string;
  name: string;
  imageUrl?: string;
  members: User[];
  createdAt: string;
  description?: string;
  inviteCode?: string;
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