
import { useApp } from "@/contexts/AppContext";
import { CreatePost } from "./create-post";
import { PostCard } from "./post-card";
import { PostSearch, PostFilters } from "./post-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, BarChart2, Search, Pin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { WeeklyStats } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Feed() {
  const { activeGroup, filterGroupPosts, currentUser, pinPost } = useApp();
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PostFilters>({
    onlyImages: false,
    onlyVideos: false,
    onlyLiked: false,
    onlySaved: false
  });
  const [showWeeklyStats, setShowWeeklyStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // IMPORTANT: Always define useMemo hooks unconditionally, even if they might not be used
  // This ensures React hook order is consistent between renders
  const allPosts = activeGroup ? filterGroupPosts(activeGroup.id) : [];
  
  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Skip filtering if post is undefined
      if (!post) return false;
      
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

  // Split posts into pinned and regular
  const pinnedPosts = useMemo(() => {
    return filteredPosts.filter(post => post.isPinned);
  }, [filteredPosts]);

  const regularPosts = useMemo(() => {
    return filteredPosts.filter(post => !post.isPinned);
  }, [filteredPosts]);

  // Generate weekly stats
  const weeklyStats = useMemo((): WeeklyStats | null => {
    if (!activeGroup || !filteredPosts.length) return null;
    
    const startDate = startOfWeek(new Date());
    const endDate = endOfWeek(new Date());
    const weekPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= startDate && postDate <= endDate;
    });
    
    if (!weekPosts.length) return null;
    
    // Track user activity
    const postCounts: Record<string, number> = {};
    const likeCounts: Record<string, number> = {};
    const reactionCounts: Record<string, number> = {};
    
    weekPosts.forEach(post => {
      // Count posts
      postCounts[post.user.id] = (postCounts[post.user.id] || 0) + 1;
      
      // Count likes received
      post.likes.forEach(userId => {
        reactionCounts[userId] = (reactionCounts[userId] || 0) + 1;
      });
      
      post.dislikes.forEach(userId => {
        reactionCounts[userId] = (reactionCounts[userId] || 0) + 1;
      });
      
      post.hearts.forEach(userId => {
        reactionCounts[userId] = (reactionCounts[userId] || 0) + 1;
      });
      
      // Count likes on posts
      likeCounts[post.user.id] = (likeCounts[post.user.id] || 0) + post.likes.length;
    });
    
    // Convert to arrays and sort
    const mostPosts = Object.entries(postCounts)
      .map(([userId, count]) => {
        const user = activeGroup.members.find(m => m.id === userId);
        return user ? { user, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.count - a!.count)
      .slice(0, 5) as { user: User; count: number }[];
      
    const mostLikes = Object.entries(likeCounts)
      .map(([userId, count]) => {
        const user = activeGroup.members.find(m => m.id === userId);
        return user ? { user, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.count - a!.count)
      .slice(0, 5) as { user: User; count: number }[];
      
    const mostReactions = Object.entries(reactionCounts)
      .map(([userId, count]) => {
        const user = activeGroup.members.find(m => m.id === userId);
        return user ? { user, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.count - a!.count)
      .slice(0, 5) as { user: User; count: number }[];
    
    return {
      startDate: format(startDate, 'MMM dd, yyyy'),
      endDate: format(endDate, 'MMM dd, yyyy'),
      mostPosts,
      mostLikes,
      mostReactions,
      groupId: activeGroup.id
    };
  }, [activeGroup, filteredPosts]);

  // Function to copy invite code
  const copyInviteCode = () => {
    if (!activeGroup?.inviteCode) return;
    
    navigator.clipboard.writeText(activeGroup.inviteCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <ScrollArea className="h-[calc(100vh-3.5rem)]">
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{activeGroup.name} Feed</h2>
            <p className="text-muted-foreground">
              {activeGroup.members.length} members • {activeGroup.description || 'Share moments with your group'}
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
                onClick={copyInviteCode}
                title="Copy invite code"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            {weeklyStats && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowWeeklyStats(true)}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Weekly Stats
              </Button>
            )}
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
            {pinnedPosts.length > 0 && (
              <div>
                <h3 className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                  <Pin className="h-4 w-4 mr-1" /> Pinned Posts
                </h3>
                {pinnedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {regularPosts.length > 0 && (
                  <h3 className="flex items-center text-sm font-medium text-muted-foreground my-4">
                    Recent Posts
                  </h3>
                )}
              </div>
            )}
            
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {/* Weekly Stats Dialog */}
      <Dialog open={showWeeklyStats} onOpenChange={setShowWeeklyStats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Weekly Stats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Stats for week of {weeklyStats?.startDate} - {weeklyStats?.endDate}
            </p>
            
            {weeklyStats?.mostPosts.length ? (
              <div>
                <h3 className="text-sm font-medium">Most Posts</h3>
                <ul className="mt-2">
                  {weeklyStats.mostPosts.map((item, i) => (
                    <li key={item.user.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">#{i+1}</span>
                        <img 
                          src={item.user.avatar} 
                          alt={item.user.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span>{item.user.name}</span>
                      </div>
                      <span>{item.count} posts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            
            {weeklyStats?.mostLikes.length ? (
              <div>
                <h3 className="text-sm font-medium">Most Likes Received</h3>
                <ul className="mt-2">
                  {weeklyStats.mostLikes.map((item, i) => (
                    <li key={item.user.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">#{i+1}</span>
                        <img 
                          src={item.user.avatar} 
                          alt={item.user.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span>{item.user.name}</span>
                      </div>
                      <span>{item.count} likes</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            
            {weeklyStats?.mostReactions.length ? (
              <div>
                <h3 className="text-sm font-medium">Most Active</h3>
                <ul className="mt-2">
                  {weeklyStats.mostReactions.map((item, i) => (
                    <li key={item.user.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">#{i+1}</span>
                        <img 
                          src={item.user.avatar} 
                          alt={item.user.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span>{item.user.name}</span>
                      </div>
                      <span>{item.count} reactions</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => setShowWeeklyStats(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
