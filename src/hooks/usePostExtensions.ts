
import { Post } from "@/types";
import { PostsContextType } from "@/types";

/**
 * Hook for extended post functionality
 */
export const usePostExtensions = (
  posts: Post[],
  likePost: PostsContextType["likePost"],
  dislikePost: PostsContextType["dislikePost"],
  heartPost: PostsContextType["heartPost"]
) => {
  // React to a post with different reaction types
  const reactToPost = (postId: string, reaction: "like" | "dislike" | "heart") => {
    if (reaction === "like") {
      return likePost(postId);
    } else if (reaction === "dislike") {
      return dislikePost(postId);
    } else if (reaction === "heart") {
      return heartPost(postId);
    }
    return Promise.resolve();
  };

  // Filter posts by group ID
  const filterGroupPosts = (groupId: string): Post[] => {
    return posts.filter(post => post.group.id === groupId);
  };

  // Get saved posts (posts hearted by the current user)
  const getSavedPosts = (currentUserId: string | undefined): Post[] => {
    if (!currentUserId) return [];
    return posts.filter(post => post.hearts.includes(currentUserId));
  };

  return {
    reactToPost,
    filterGroupPosts,
    getSavedPosts
  };
};
