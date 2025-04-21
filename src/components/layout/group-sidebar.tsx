
import { useApp } from "@/contexts/AppContext";
import { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GroupSidebar() {
  const { groups, activeGroup, setActiveGroup, createGroup, joinGroup } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") return;
    
    // For demo purposes, if no icon provided, use a random one
    const icon = newGroupIcon || `https://source.unsplash.com/random/100x100/?${newGroupName.toLowerCase()}`;
    
    createGroup(newGroupName, icon, newGroupDescription);
    setNewGroupName("");
    setNewGroupIcon("");
    setNewGroupDescription("");
    setIsCreateOpen(false);
  };

  const handleJoinGroup = () => {
    if (inviteCode.trim() === "") return;
    
    const success = joinGroup(inviteCode);
    if (!success) {
      setJoinError("Invalid invite code. Please try again.");
      return;
    }
    
    setInviteCode("");
    setJoinError("");
    setIsJoinOpen(false);
  };

  return (
    <div className="hidden w-72 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Your Groups</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              isActive={activeGroup?.id === group.id}
              onClick={() => setActiveGroup(group)}
            />
          ))}
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
                <Button onClick={handleCreateGroup}>Create Group</Button>
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
                <Button onClick={handleJoinGroup}>Join Group</Button>
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
