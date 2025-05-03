
import { Post, User } from "@/types";

export const usePostExtensions = (currentUser: User | null, posts: Post[]) => {
  const filterGroupPosts = (groupId: string) => {
    return posts.filter(post => post.group?.id === groupId);
  };
  
  const getSavedPosts = () => {
    if (!currentUser) return [];
    return posts.filter(post => post.hearts.includes(currentUser.id));
  };

  return {
    filterGroupPosts,
    getSavedPosts
  };
};
