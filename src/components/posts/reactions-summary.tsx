
import { Heart, ThumbsDown, ThumbsUp } from "lucide-react";
import { Post } from "@/types";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReactionsSummaryProps {
  post: Post;
}

export function ReactionsSummary({ post }: ReactionsSummaryProps) {
  const totalReactions = post.likes.length + post.hearts.length + post.dislikes.length;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="flex -space-x-1">
            {post.likes.length > 0 && (
              <div className="rounded-full bg-blue-500 p-1">
                <ThumbsUp className="h-3 w-3 text-white" />
              </div>
            )}
            {post.hearts.length > 0 && (
              <div className="rounded-full bg-red-500 p-1">
                <Heart className="h-3 w-3 text-white" />
              </div>
            )}
            {post.dislikes.length > 0 && (
              <div className="rounded-full bg-gray-500 p-1">
                <ThumbsDown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          {post.likes.length > 0 && (
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-blue-500" />
              <span>{post.likes.length} likes</span>
            </div>
          )}
          {post.hearts.length > 0 && (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>{post.hearts.length} hearts</span>
            </div>
          )}
          {post.dislikes.length > 0 && (
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-gray-500" />
              <span>{post.dislikes.length} dislikes</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
