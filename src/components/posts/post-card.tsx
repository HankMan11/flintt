import { useState } from "react";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { CommentList } from "./comment-list";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { currentUser, likePost, dislikePost, heartPost, addComment } = useApp();
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false); // Added state for image modal

  if (!post || !post.user) {
    return null; // Safely handle invalid posts
  }

  const handleLike = () => {
    likePost(post.id);
  };

  const handleDislike = () => {
    dislikePost(post.id);
  };

  const handleHeart = () => {
    heartPost(post.id);
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment("");
    setIsCommenting(false);
    setShowComments(true);
  };

  const isLiked = currentUser && post.likes.includes(currentUser.id);
  const isDisliked = currentUser && post.dislikes.includes(currentUser.id);
  const isHearted = currentUser && post.hearts.includes(currentUser.id);

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user.avatar} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{post.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {(() => {
  const now = new Date();
  const createdAt = new Date(post.createdAt);
  const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  return formatDistanceToNow(createdAt, { addSuffix: true });
})()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt={post.caption || "Post image"}
            className="aspect-video w-full object-cover cursor-pointer"
            onClick={() => setImageModalOpen(true)} // Added onClick handler
          />
        ) : (
          <video
            src={post.mediaUrl}
            controls
            className="aspect-video w-full object-cover"
          />
        )}
        {post.caption && (
          <div className="p-4 pt-3">
            <p>{post.caption}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isLiked ? "text-primary" : ""}`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{post.likes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isDisliked ? "text-primary" : ""}`}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{post.dislikes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isHearted ? "text-destructive" : ""}`}
              onClick={handleHeart}
            >
              <Heart className="h-4 w-4" />
              <span>{post.hearts.length}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments.length}</span>
          </Button>
        </div>

        {showComments && post.comments.length > 0 && (
          <div className="mt-4 w-full">
            <CommentList comments={post.comments} postId={post.id} />
          </div>
        )}

        {isCommenting ? (
          <div className="mt-4 w-full">
            <Textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCommenting(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>Post Comment</Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setIsCommenting(true)}
          >
            Add a comment...
          </Button>
        )}
      </CardFooter>
      <ImageModal // Added ImageModal component
        imageUrl={post.mediaType === "image" ? post.mediaUrl : ""}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />
    </Card>
  );
}


function ImageModal({ imageUrl, isOpen, onClose }: { imageUrl: string; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-md w-full bg-white rounded-lg shadow-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <img src={imageUrl} alt="Full Image" className="w-full h-auto max-h-[80vh] object-contain" />
      </div>
    </div>
  );
}