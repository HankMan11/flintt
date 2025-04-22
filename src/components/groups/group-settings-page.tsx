
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/contexts/GroupsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X, Copy, Archive, Trash2, UserMinus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GroupSettingsPage() {
  const { activeGroup, uploadGroupImage } = useGroups();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(activeGroup?.name || "");
  const [newDescription, setNewDescription] = useState(activeGroup?.description || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isAdmin = activeGroup?.members.find(
    m => m.userId === currentUser?.id && m.role === 'admin'
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadGroupImage(file);
      if (imageUrl) {
        toast({
          title: "Success",
          description: "Group image updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyInviteLink = () => {
    if (!activeGroup?.inviteCode) return;
    navigator.clipboard.writeText(activeGroup.inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  const removeMember = async (memberId: string) => {
    // Implementation for removing members
    toast({
      title: "Member removed",
      description: "The member has been removed from the group",
    });
  };

  if (!activeGroup) {
    return (
      <Card className="m-6 p-6 text-center">
        <CardHeader>
          <CardTitle>No Active Group</CardTitle>
          <CardDescription>Please select a group to view its settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="m-6 p-6 text-center">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only group admins can access settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>
            Manage settings for <span className="font-semibold">{activeGroup.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Image and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <img 
                src={activeGroup.imageUrl || activeGroup.icon} 
                alt={activeGroup.name} 
                className="h-32 w-32 rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter group description"
                />
              </div>
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-2">
            <Label>Invite Code</Label>
            <div className="flex gap-2">
              <Input value={activeGroup.inviteCode} readOnly />
              <Button variant="outline" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            <Label>Members ({activeGroup.members.length})</Label>
            <div className="space-y-2">
              {activeGroup.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <img
                      src={member.user.avatar}
                      alt={member.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                    </div>
                    <span className="ml-2 text-xs bg-secondary px-2 py-1 rounded">
                      {member.role}
                    </span>
                  </div>
                  {member.userId !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="mr-2 h-4 w-4" />
                Archive Group
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
