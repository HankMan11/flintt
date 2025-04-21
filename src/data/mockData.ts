
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

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: "group1",
    name: "Photography Club",
    icon: "https://source.unsplash.com/random/100x100/?camera",
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    createdAt: "2023-01-15T14:30:00Z",
    description: "A group for photography enthusiasts to share their best shots.",
    inviteCode: "PHOTO23"
  },
  {
    id: "group2",
    name: "Foodie Friends",
    icon: "https://source.unsplash.com/random/100x100/?food",
    members: [mockUsers[0], mockUsers[3], mockUsers[4]],
    createdAt: "2023-02-10T09:15:00Z",
    description: "Share your culinary adventures and food discoveries.",
    inviteCode: "FOOD22"
  },
  {
    id: "group3",
    name: "Travel Buddies",
    icon: "https://source.unsplash.com/random/100x100/?travel",
    members: [mockUsers[1], mockUsers[2], mockUsers[4]],
    createdAt: "2023-03-05T16:45:00Z",
    description: "For those with wanderlust to share their journey.",
    inviteCode: "TRVL21"
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: "post1",
    user: mockUsers[0],
    group: mockGroups[0],
    caption: "A perfect sunset capture on my recent hiking trip.",
    mediaUrl: "https://source.unsplash.com/random/800x600/?sunset",
    mediaType: "image",
    createdAt: "2023-01-20T18:30:00Z",
    likes: ["user2", "user3"],
    dislikes: [],
    hearts: ["user2"],
    comments: [
      {
        id: "comment1",
        user: mockUsers[1],
        content: "Stunning view! Where was this taken?",
        createdAt: "2023-01-20T19:15:00Z",
        replies: [
          {
            id: "reply1",
            user: mockUsers[0],
            content: "Thanks! It was at Eagle Peak.",
            createdAt: "2023-01-20T19:30:00Z"
          }
        ]
      }
    ]
  },
  {
    id: "post2",
    user: mockUsers[3],
    group: mockGroups[1],
    caption: "Homemade pasta night - turned out delicious!",
    mediaUrl: "https://source.unsplash.com/random/800x600/?pasta",
    mediaType: "image",
    createdAt: "2023-02-15T20:00:00Z",
    likes: ["user1", "user4", "user5"],
    dislikes: [],
    hearts: ["user1", "user5"],
    comments: [
      {
        id: "comment2",
        user: mockUsers[4],
        content: "That looks amazing! Recipe please?",
        createdAt: "2023-02-15T20:30:00Z"
      }
    ]
  },
  {
    id: "post3",
    user: mockUsers[2],
    group: mockGroups[2],
    caption: "Time-lapse of my road trip through the mountains.",
    mediaUrl: "https://source.unsplash.com/random/800x600/?mountains",
    mediaType: "video",
    createdAt: "2023-03-10T12:45:00Z",
    likes: ["user1", "user5"],
    dislikes: ["user4"],
    hearts: ["user1"],
    comments: []
  },
  {
    id: "post4",
    user: mockUsers[1],
    group: mockGroups[0],
    caption: "Macro photography experiment with water droplets.",
    mediaUrl: "https://source.unsplash.com/random/800x600/?macro",
    mediaType: "image",
    createdAt: "2023-01-25T10:20:00Z",
    likes: ["user3"],
    dislikes: [],
    hearts: ["user3"],
    comments: [
      {
        id: "comment3",
        user: mockUsers[2],
        content: "The detail is incredible! What lens did you use?",
        createdAt: "2023-01-25T11:00:00Z"
      }
    ]
  },
  {
    id: "post5",
    user: mockUsers[4],
    group: mockGroups[1],
    caption: "My attempt at baking sourdough bread.",
    mediaUrl: "https://source.unsplash.com/random/800x600/?bread",
    mediaType: "image",
    createdAt: "2023-02-18T15:10:00Z",
    likes: ["user2", "user3"],
    dislikes: [],
    hearts: [],
    comments: [
      {
        id: "comment4",
        user: mockUsers[3],
        content: "The crust looks perfect!",
        createdAt: "2023-02-18T15:30:00Z"
      }
    ]
  },
  {
    id: "post6",
    user: mockUsers[2],
    group: mockGroups[2],
    caption: "Beach sunset in Bali. One of the most peaceful moments of my trip.",
    mediaUrl: "https://source.unsplash.com/random/800x600/?bali",
    mediaType: "image",
    createdAt: "2023-03-15T17:30:00Z",
    likes: ["user1", "user4", "user5"],
    dislikes: [],
    hearts: ["user1", "user4"],
    comments: [
      {
        id: "comment5",
        user: mockUsers[4],
        content: "This makes me want to book a flight right now!",
        createdAt: "2023-03-15T18:00:00Z"
      }
    ]
  }
];
