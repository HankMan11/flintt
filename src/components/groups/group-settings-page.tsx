
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/contexts/GroupsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Copy, Archive, Trash2, UserMinus, Settings, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export function GroupSettingsPage() {
  const { activeGroup, updateGroup, deleteGroup, removeGroupMember } = useGroups();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [groupSettings, setGroupSettings] = useState({
    name: activeGroup?.name || "",
    description: activeGroup?.description || "",
    isPrivate: activeGroup?.isPrivate || false,
    allowInvites: activeGroup?.allowInvites || true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isAdmin = activeGroup?.members.find(
    m => m.userId === currentUser?.id && m.role === 'admin'
  );

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

  const handleUpdateSettings = async () => {
    try {
      await updateGroup(activeGroup.id, groupSettings);
      toast({
        title: "Success",
        description: "Group settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group settings",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await deleteGroup(activeGroup.id);
        navigate("/groups");
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete group",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your group's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Group Name</Label>
                  <Input
                    value={groupSettings.name}
                    onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={groupSettings.description}
                    onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleUpdateSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Manage Members</CardTitle>
              <CardDescription>View and manage group members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGroup.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    {member.userId !== currentUser?.id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeGroupMember(activeGroup.id, member.userId)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Group Permissions</CardTitle>
              <CardDescription>Configure group privacy and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Private Group</p>
                    <p className="text-sm text-muted-foreground">
                      Only invited members can join
                    </p>
                  </div>
                  <Switch
                    checked={groupSettings.isPrivate}
                    onCheckedChange={(checked) =>
                      setGroupSettings({ ...groupSettings, isPrivate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Member Invites</p>
                    <p className="text-sm text-muted-foreground">
                      Let members invite others
                    </p>
                  </div>
                  <Switch
                    checked={groupSettings.allowInvites}
                    onCheckedChange={(checked) =>
                      setGroupSettings({ ...groupSettings, allowInvites: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for this group</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteGroup}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
