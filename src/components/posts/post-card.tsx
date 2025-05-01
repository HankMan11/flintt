
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, ThumbsDown, ThumbsUp, MessageSquare, MoreHorizontal, Pin } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Post } from "@/types";
import { CommentList } from "./comment-list";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ImageViewer } from "@/components/ui/image-viewer";
import { formatTimeAgo } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

export const PostCard = ({ post, isDetailView = false }: PostCardProps) => {
  const { reactToPost, currentUser, addComment, pinPost, deletePost, editPost } = useApp();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(isDetailView);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || "");
  
  // Check if current user is admin of the group
  const isAdmin = post.group.members.some(
    m => m.userId === currentUser?.id && m.role === 'admin'
  );
  
  // Check if current user is the post owner
  const isOwner = currentUser && post.user.id === currentUser.id;
  
  const handleReact = async (reaction: "like" | "dislike" | "heart") => {
    if (!currentUser) return;
    await reactToPost(post.id, reaction);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment("");
  };
  
  const handlePinToggle = () => {
    if (pinPost) {
      pinPost(post.id, !post.isPinned);
    }
  };
  
  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      deletePost(post.id);
    }
  };
  
  const handleEditSubmit = () => {
    if (editPost) {
      editPost(post.id, editCaption);
      setIsEditing(false);
    }
  };
  
  // Format time for less than a minute to show "Just now"
  const formattedTime = formatTimeAgo(new Date(post.createdAt));
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{post.user.name}</span>
                <span className="text-muted-foreground text-xs">{formattedTime}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                in {post.group.name}
                {post.isPinned && (
                  <Badge variant="outline" className="ml-2 py-0">
                    <Pin className="h-3 w-3 mr-1" /> Pinned
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePinToggle}
                title={post.isPinned ? "Unpin post" : "Pin post"}
              >
                <Pin className={`h-4 w-4 ${post.isPinned ? 'text-blue-500' : 'text-muted-foreground'}`} />
              </Button>
            )}
            {isOwner && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} title="Edit post">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Caption */}
        {post.caption && !isEditing && (
          <div className="px-4 py-2">{post.caption}</div>
        )}
        
        {/* Edit caption form */}
        {isEditing && (
          <div className="px-4 py-2">
            <textarea 
              className="w-full border rounded p-2"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleEditSubmit}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsEditing(false);
                setEditCaption(post.caption || "");
              }}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={handleDeletePost}>Delete Post</Button>
            </div>
          </div>
        )}
        
        {/* Media content */}
        <div className="relative">
          {post.mediaType === "image" ? (
            <img 
              src={post.mediaUrl} 
              alt="Post image" 
              className="w-full cursor-pointer" 
              onClick={() => setIsImageViewerOpen(true)}
            />
          ) : (
            <video 
              src={post.mediaUrl} 
              controls 
              className="w-full"
            />
          )}
        </div>
        
        {/* Full-screen image viewer */}
        <ImageViewer 
          imageUrl={post.mediaUrl} 
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          alt={`Post by ${post.user.name}`}
        />
      </CardContent>

      <CardFooter className="p-4 flex flex-col">
        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            <button
              className={`flex items-center gap-1 ${
                currentUser && post.likes.includes(currentUser.id)
                  ? "text-blue-600"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleReact("like")}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{post.likes.length}</span>
            </button>
            <button
              className={`flex items-center gap-1 ${
                currentUser && post.dislikes.includes(currentUser.id)
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleReact("dislike")}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{post.dislikes.length}</span>
            </button>
            <button
              className={`flex items-center gap-1 ${
                currentUser && post.hearts.includes(currentUser.id)
                  ? "text-pink-600"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleReact("heart")}
            >
              <Heart className="h-4 w-4" />
              <span>{post.hearts.length}</span>
            </button>
          </div>
          <button
            className="flex items-center gap-1 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments.length}</span>
          </button>
        </div>
        {!isDetailView && (
          <Link 
            to={`/posts/${post.id}`} 
            className="text-xs text-blue-500 hover:underline mt-2 self-end"
          >
            View post details
          </Link>
        )}
        {showComments && (
          <div className="mt-4 w-full">
            <CommentList comments={post.comments} postId={post.id} />
            {currentUser && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button onClick={handleAddComment} disabled={!comment.trim()}>
                  Post
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
