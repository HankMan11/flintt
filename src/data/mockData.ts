
import { User, Group, Post } from "../types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alex Johnson",
    username: "alexj",
    avatar: "https://i.pravatar.cc/150?img=1",
    isAdmin: true
  },
  {
    id: "user2",
    name: "Samantha Wilson",
    username: "samw",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: "user3",
    name: "Michael Chen",
    username: "mikec",
    avatar: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: "user4",
    name: "Taylor Swift",
    username: "taylors",
    avatar: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: "user5",
    name: "Jordan Lee",
    username: "jlee",
    avatar: "https://i.pravatar.cc/150?img=12"
  }
];

// Removed all mock groups

// Mock Posts - Since posts depend on groups, we remove them as well.
export const mockPosts: Post[] = []; 

