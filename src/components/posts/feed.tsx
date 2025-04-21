
import { useApp } from "@/contexts/AppContext";
import { CreatePost } from "./create-post";
import { PostCard } from "./post-card";
import { PostSearch, PostFilters } from "./post-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export function Feed() {
  const { activeGroup, filterGroupPosts, currentUser } = useApp();
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PostFilters>({
    onlyImages: false,
    onlyVideos: false,
    onlyLiked: false,
    onlySaved: false
  });

  if (!activeGroup) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Select a Group</CardTitle>
            <CardDescription>
              Choose a group from the sidebar to view its feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You can create or join a group using the options at the bottom of the sidebar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all posts for the active group
  const allPosts = filterGroupPosts(activeGroup.id);
  
  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Apply search query filter
      if (searchQuery) {
        const matchesCaption = post.caption?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUsername = post.user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               post.user.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesCaption && !matchesUsername) return false;
      }
      
      // Apply media type filters
      if (filters.onlyImages && post.mediaType !== 'image') return false;
      if (filters.onlyVideos && post.mediaType !== 'video') return false;
      
      // Apply reaction filters (only if user is logged in)
      if (currentUser) {
        if (filters.onlyLiked && !post.likes.includes(currentUser.id)) return false;
        if (filters.onlySaved && !post.hearts.includes(currentUser.id)) return false;
      }
      
      return true;
    });
  }, [allPosts, searchQuery, filters, currentUser]);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{activeGroup.name} Feed</h2>
          <p className="text-muted-foreground">
            {activeGroup.members.length} members • Share moments with your group
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {activeGroup.members.slice(0, 5).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="h-8 w-8 rounded-full border-2 border-background"
              />
            ))}
          </div>
          <div className="relative">
            <Input
              className="w-40 pr-8"
              placeholder="Invite Code"
              value={activeGroup.inviteCode || inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              readOnly={!!activeGroup.inviteCode}
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <PostSearch 
        onSearch={setSearchQuery} 
        onFilterChange={setFilters}
      />

      <CreatePost />

      {filteredPosts.length === 0 ? (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>
              {searchQuery || Object.values(filters).some(v => v) 
                ? "No Matching Posts" 
                : "No Posts Yet"}
            </CardTitle>
            <CardDescription>
              {searchQuery || Object.values(filters).some(v => v) 
                ? "Try adjusting your search or filters" 
                : "Be the first to share something with the group!"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
