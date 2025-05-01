
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { CommentList } from "./comment-list";
import { useNotifications } from "@/contexts/NotificationsContext";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { currentUser, addComment, reactToPost, activeGroup } = useApp();
  const { addNotification } = useNotifications();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  if (!currentUser) return null;

  const hasLiked = post.likes?.includes(currentUser.id);
  const hasDisliked = post.dislikes?.includes(currentUser.id);
  const hasHearted = post.hearts?.includes(currentUser.id);

  const likesCount = post.likes?.length || 0;
  const dislikesCount = post.dislikes?.length || 0;
  const heartsCount = post.hearts?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleReact = (reaction: "like" | "dislike" | "heart") => {
    reactToPost(post.id, reaction);
    
    // Don't send notification if user reacts to their own post
    if (post.user.id !== currentUser.id) {
      const reactionText = reaction === "like" ? "liked" : reaction === "dislike" ? "disliked" : "loved";
      
      // Add notification for post owner
      addNotification({
        content: `${currentUser.name} ${reactionText} your post`,
        type: 'reaction',
        related_post_id: post.id,
        actor_id: currentUser.id,
        user_id: post.user.id
      });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment(post.id, commentText);
    setCommentText("");
    setIsCommenting(false);

    // Don't send notification if user comments on their own post
    if (post.user.id !== currentUser.id) {
      // Add notification for post owner
      addNotification({
        content: `${currentUser.name} commented on your post`,
        type: 'comment',
        related_post_id: post.id,
        actor_id: currentUser.id,
        user_id: post.user.id
      });
    }
  };

  // Format timestamp with "Just now" for < 1 minute
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatar} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.user.name}</span>
            <span className="text-xs text-muted-foreground">
              @{post.user.username}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(new Date(post.createdAt))}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full object-cover max-h-[500px]"
          />
        ) : post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full object-cover max-h-[500px]"
          />
        ) : null}
        {post.caption && <p className="p-4">{post.caption}</p>}
      </CardContent>
      <CardFooter className="flex flex-col p-4 pt-0">
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button
              variant={hasLiked ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReact("like")}
              className={hasLiked ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {likesCount > 0 && likesCount}
            </Button>
            <Button
              variant={hasDisliked ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReact("dislike")}
              className={hasDisliked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {dislikesCount > 0 && dislikesCount}
            </Button>
            <Button
              variant={hasHearted ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReact("heart")}
              className={hasHearted ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              <Heart className="h-4 w-4 mr-1" />
              {heartsCount > 0 && heartsCount}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {commentsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {commentsCount}
              </Badge>
            )}
            <span className="ml-1">{showComments ? "Hide" : "Show"} comments</span>
          </Button>
        </div>

        {isCommenting && (
          <div className="mt-4 w-full">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCommenting(false);
                  setCommentText("");
                }}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleAddComment}>
                Comment
              </Button>
            </div>
          </div>
        )}

        {!isCommenting && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-center"
            onClick={() => setIsCommenting(true)}
          >
            Write a comment...
          </Button>
        )}

        {showComments && post.comments && post.comments.length > 0 && (
          <div className="mt-4 w-full">
            <CommentList comments={post.comments} postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
