
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
  icon: string;
  members: User[];
  createdAt: string;
  description?: string;
  inviteCode?: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  replies?: Comment[];
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
  isPinned?: boolean;
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
    streak?: number;
  };
}

export interface WeeklyStats {
  startDate: string;
  endDate: string;
  mostPosts: {
    user: User;
    count: number;
  }[];
  mostLikes: {
    user: User;
    count: number;
  }[];
  mostReactions: {
    user: User;
    count: number;
  }[];
  groupId: string;
}

export interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedPostId?: string;
  relatedGroupId?: string;
  actorId?: string;
}
