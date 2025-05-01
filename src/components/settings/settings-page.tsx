
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "../posts/post-card";

export function SettingsPage() {
  const { currentUser, getSavedPosts } = useApp();
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    avatar: currentUser?.avatar || "",
    bio: "Photography enthusiast and foodie"
  });

  const [preferences, setPreferences] = useState({
    hideStats: false,
    allowComments: true,
    notifications: true,
    darkMode: false
  });

  const savedPosts = getSavedPosts();

  if (!currentUser) return null;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and profile
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="saved">Saved Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileForm.avatar} alt={profileForm.name} />
                  <AvatarFallback>{profileForm.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Preferences</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Hide Personal Stats</p>
                    <p className="text-sm text-muted-foreground">
                      Hide your statistics from other group members
                    </p>
                  </div>
                  <Switch
                    checked={preferences.hideStats}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, hideStats: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Comments</p>
                    <p className="text-sm text-muted-foreground">
                      Allow others to comment on your posts
                    </p>
                  </div>
                  <Switch
                    checked={preferences.allowComments}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, allowComments: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for interactions
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Posts</CardTitle>
              <CardDescription>
                Posts you've hearted across all groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedPosts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">You haven't saved any posts yet.</p>
                  <p className="text-sm">Heart a post to save it here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {savedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
