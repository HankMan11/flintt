
import { useState } from "react";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, Edit, Trash2, Pin } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Post } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { CommentList } from "./comment-list";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { currentUser, likePost, dislikePost, heartPost, addComment, deletePost } = useApp();
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || "");
  const [fullScreenImage, setFullScreenImage] = useState(false);
  const { toast } = useToast();

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

  const handleDeletePost = () => {
    deletePost(post.id);
    toast({
      title: "Post deleted",
      description: "Your post has been successfully deleted",
    });
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    }
    return formatDistanceToNow(postDate, { addSuffix: true });
  };

  const isLiked = currentUser && post.likes.includes(currentUser.id);
  const isDisliked = currentUser && post.dislikes.includes(currentUser.id);
  const isHearted = currentUser && post.hearts.includes(currentUser.id);
  const isOwnPost = currentUser && post.user.id === currentUser.id;

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
                {formatTimestamp(post.createdAt)}
              </p>
            </div>
            {isOwnPost && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={handleDeletePost}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {post.mediaType === "image" ? (
          <img 
            src={post.mediaUrl} 
            alt={post.caption || "Post image"} 
            className="aspect-video w-full object-cover cursor-pointer"
            onClick={() => setFullScreenImage(true)}
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

      {/* Full screen image dialog */}
      <Dialog open={fullScreenImage} onOpenChange={setFullScreenImage}>
        <DialogContent className="max-w-screen-lg p-0 overflow-hidden">
          <div className="relative">
            <img 
              src={post.mediaUrl} 
              alt={post.caption || "Post image"} 
              className="w-full h-auto"
            />
            <Button 
              className="absolute top-2 right-2" 
              variant="outline"
              onClick={() => setFullScreenImage(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
