
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, Upload } from "lucide-react";

type TimeRange = "all" | "month" | "week";

export function StatsPage() {
  const { activeGroup, getGroupStats, currentUser, getUserStats } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  if (!activeGroup || !currentUser) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Select a Group</CardTitle>
            <CardDescription>
              Choose a group from the sidebar to view its statistics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const groupStats = getGroupStats(activeGroup.id, timeRange);
  if (!groupStats) return null;
  
  const personalStats = getUserStats(currentUser.id, activeGroup.id, timeRange);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{activeGroup.name} Statistics</h2>
        <p className="text-muted-foreground">
          {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'All-time'} group engagement and contribution statistics
        </p>
      </div>

      <Tabs
        defaultValue="all"
        className="mb-8"
        onValueChange={(value) => setTimeRange(value as TimeRange)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Stats</CardTitle>
            <CardDescription>
              Your activity in {activeGroup.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Uploads"
                value={personalStats.uploads}
                icon={<Upload className="h-4 w-4" />}
                description="Posts you've shared"
                className="bg-primary/10"
              />
              <StatCard
                title="Likes Given"
                value={personalStats.likes}
                icon={<ThumbsUp className="h-4 w-4" />}
                description="Posts you've liked"
                className="bg-blue-100 dark:bg-blue-900/20"
              />
              <StatCard
                title="Hearts Given"
                value={personalStats.hearts}
                icon={<Heart className="h-4 w-4" />}
                description="Posts you've saved"
                className="bg-red-100 dark:bg-red-900/20"
              />
              <StatCard
                title="Comments"
                value={personalStats.commentCount}
                icon={<MessageCircle className="h-4 w-4" />}
                description="Comments you've made"
                className="bg-green-100 dark:bg-green-900/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Uploads</CardTitle>
            <CardDescription>
              Members with the most posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStatsList items={groupStats.mostUploads} emptyText="No uploads yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Liked</CardTitle>
            <CardDescription>
              Members with the most likes received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStatsList items={groupStats.mostLiked} emptyText="No likes yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Hearted</CardTitle>
            <CardDescription>
              Members with the most heart reactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStatsList items={groupStats.mostHearted} emptyText="No hearts yet" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Active Commenters</CardTitle>
            <CardDescription>
              Members who comment the most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStatsList items={groupStats.mostCommented} emptyText="No comments yet" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Saved Posts</CardTitle>
            <CardDescription>
              Posts with the most hearts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupStats.mostSavedPosts.length > 0 ? (
                groupStats.mostSavedPosts.map(({ post, count }) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={post.mediaUrl}
                          alt={post.caption || "Post"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{post.user.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {post.caption || "No caption"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <Heart className="h-4 w-4" />
                      <span>{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No saved posts yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <div className={`rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface UserStatsListProps {
  items: { user: any; count: number }[];
  emptyText: string;
}

function UserStatsList({ items, emptyText }: UserStatsListProps) {
  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map(({ user, count }) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-medium">{user.name}</p>
            </div>
            <p className="font-medium">{count}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">{emptyText}</p>
      )}
    </div>
  );
}
