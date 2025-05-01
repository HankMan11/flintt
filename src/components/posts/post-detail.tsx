
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { PostCard } from "./post-card";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { posts, activeGroup, setActiveGroup } = useApp();
  const navigate = useNavigate();

  const post = posts.find(p => p.id === postId);

  useEffect(() => {
    // Set active group based on post
    if (post && (!activeGroup || activeGroup.id !== post.group.id)) {
      setActiveGroup(post.group);
    }
  }, [post, activeGroup, setActiveGroup]);

  if (!post) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
            <CardDescription>
              This post may have been deleted or doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="ml-2 text-xl font-bold">Post from {post.user.name}</h2>
          <p className="ml-2 text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} in {post.group.name}
          </p>
        </div>
      </div>
      
      <PostCard post={post} isDetailView />
    </div>
  );
}
