
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

interface CommentListProps {
  comments: Comment[];
  postId: string;
}

export function CommentList({ comments, postId }: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
        />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

function CommentItem({ comment, postId }: CommentItemProps) {
  const { addComment } = useApp();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    
    addComment(postId, replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="rounded-md bg-secondary p-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{comment.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
          <div className="flex gap-4 mt-1">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies
                  ? `Hide Replies (${comment.replies.length})`
                  : `Show Replies (${comment.replies.length})`}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmitReply}>
                  Reply
                </Button>
              </div>
            </div>
          )}

          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                    <AvatarFallback>
                      {reply.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="rounded-md bg-secondary p-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">
                          {reply.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <p className="text-xs mt-1">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
