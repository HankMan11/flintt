
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, UserPlus, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GroupImageUpload } from "./group-image-upload";

export function GroupsPage() {
  const { groups, createGroup, joinGroup, setActiveGroup, loadingGroups, fetchGroups } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const navigate = useNavigate();

  // Load groups on component mount
  useEffect(() => {
    if (!loadingGroups) {
      fetchGroups();
    }
  }, []);

  const handleRefreshGroups = async () => {
    setRefreshing(true);
    try {
      await fetchGroups();
      toast({
        title: "Groups Refreshed",
        description: "Your groups list has been updated",
      });
    } catch (error) {
      console.error("Error refreshing groups:", error);
      toast({
        title: "Error",
        description: "Failed to refresh groups",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim() === "") return;
    
    setIsCreating(true);
    
    try {
      const newGroup = await createGroup(newGroupName, newGroupIcon, newGroupDescription);
      
      if (newGroup) {
        toast({
          title: "Group Created",
          description: `You've successfully created ${newGroupName}`,
        });
        
        setNewGroupName("");
        setNewGroupIcon("");
        setNewGroupDescription("");
        setIsCreateOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create group. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (inviteCode.trim() === "") return;
    
    setIsJoining(true);
    setJoinError("");
    
    try {
      const success = await joinGroup(inviteCode);
      
      if (success) {
        toast({
          title: "Group Joined",
          description: "You've successfully joined the group",
        });
        
        setInviteCode("");
        setIsJoinOpen(false);
      } else {
        setJoinError("Invalid invite code. Please try again.");
        toast({
          title: "Error", 
          description: "Failed to join group. Invalid invite code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setJoinError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleCopyInviteCode = (code: string, groupId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodes({ ...copiedCodes, [groupId]: true });
    
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedCodes(prev => ({ ...prev, [groupId]: false }));
    }, 2000);
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Groups</h2>
          <p className="text-muted-foreground">View and manage your groups</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshGroups} 
            disabled={refreshing || loadingGroups}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing || loadingGroups ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <GroupImageUpload 
                  onImageUploaded={(url) => setNewGroupIcon(url)} 
                />
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreateGroup}
                  disabled={isCreating || newGroupName.trim() === ""}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Join
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a group</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Invitation Code</Label>
                  <Input
                    id="code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  {joinError && <p className="text-sm text-destructive">{joinError}</p>}
                </div>
                <Button 
                  onClick={handleJoinGroup}
                  disabled={isJoining || inviteCode.trim() === ""}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loadingGroups ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading your groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>No Groups Found</CardTitle>
            <CardDescription>
              {searchTerm ? "Try a different search term" : "Join or create a group to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)}>Create Group</Button>
            <Button variant="outline" onClick={() => setIsJoinOpen(true)}>Join Group</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => (
            <Card key={group.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={group.icon}
                  alt={group.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {group.description || `A group with ${group.members.length} members`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mb-4">
                  <Label htmlFor={`invite-${group.id}`} className="text-xs">Invite Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`invite-${group.id}`}
                      value={group.inviteCode || ""}
                      readOnly
                      className="text-xs h-8"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyInviteCode(group.inviteCode || "", group.id)}
                    >
                      {copiedCodes[group.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map(member => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        className="h-6 w-6 rounded-full border-2 border-background"
                      />
                    ))}
                    {group.members.length > 3 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setActiveGroup(group)}>
                      View Feed
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setActiveGroup(group);
                      navigate("/group-settings");
                    }}>
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
