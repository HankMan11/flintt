
import { useApp } from "@/contexts/AppContext";
import { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function GroupSidebar() {
  const { groups, activeGroup, setActiveGroup, createGroup, joinGroup, loadingGroups, fetchGroups } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Load groups on component mount if not already loading
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
      // For demo purposes, if no icon provided, use a random one
      const icon = newGroupIcon || `https://source.unsplash.com/random/100x100/?${newGroupName.toLowerCase()}`;
      
      const newGroup = await createGroup(newGroupName, icon, newGroupDescription);
      
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

  return (
    <div className="hidden w-72 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">Your Groups</h2>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleRefreshGroups}
          disabled={refreshing || loadingGroups}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing || loadingGroups ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loadingGroups ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No groups yet</p>
              <p className="text-sm text-muted-foreground">Create or join a group to get started</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={handleRefreshGroups}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          ) : (
            groups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                isActive={activeGroup?.id === group.id}
                onClick={() => setActiveGroup(group)}
              />
            ))
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex flex-col gap-2">
          {/* Create group dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Group Icon URL (optional)</Label>
                  <Input
                    id="icon"
                    value={newGroupIcon}
                    onChange={(e) => setNewGroupIcon(e.target.value)}
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

          {/* Join group dialog */}
          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Join with Code
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
    </div>
  );
}

interface GroupItemProps {
  group: Group;
  isActive: boolean;
  onClick: () => void;
}

function GroupItem({ group, isActive, onClick }: GroupItemProps) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <img
        src={group.icon}
        alt={group.name}
        className="h-10 w-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-medium">{group.name}</span>
        <span className="text-xs text-muted-foreground">
          {group.members.length} {group.members.length === 1 ? "member" : "members"}
        </span>
      </div>
    </button>
  );
}
