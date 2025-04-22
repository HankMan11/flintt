import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GroupSettingsPage() {
  const { activeGroup, updateGroup, currentUser } = useApp();
  const [groupName, setGroupName] = useState(activeGroup?.name || "");
  const [description, setDescription] = useState(activeGroup?.description || "");
  const [settings, setSettings] = useState({
    allowInvites: true,
    requireApproval: false,
    enableNotifications: true,
    allowComments: true,
  });

  const [selectedMember, setSelectedMember] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  if (!activeGroup || !currentUser) {
    return <div>Loading...</div>;
  }

  const isAdmin = activeGroup.admins?.includes(currentUser.id);

  const handleSave = async () => {
    await updateGroup(activeGroup.id, {
      name: groupName,
      description,
      settings,
    });
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const updatedAdmins = newRole === 'admin' 
      ? [...activeGroup.admins, userId]
      : activeGroup.admins.filter(id => id !== userId);

    await updateGroup(activeGroup.id, {
      admins: updatedAdmins,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your group's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <Button onClick={handleSave} disabled={!isAdmin}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Manage roles and permissions for group members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGroup.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                  <Select
                    disabled={!isAdmin || member.id === currentUser.id}
                    value={activeGroup.admins.includes(member.id) ? 'admin' : 'member'}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your group's privacy and interaction settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Invites</p>
                  <p className="text-sm text-muted-foreground">
                    Let members invite others to join
                  </p>
                </div>
                <Switch
                  checked={settings.allowInvites}
                  onCheckedChange={(checked) => 
                    setSettings(s => ({ ...s, allowInvites: checked }))}
                  disabled={!isAdmin}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Approval</p>
                  <p className="text-sm text-muted-foreground">
                    Admins must approve new members
                  </p>
                </div>
                <Switch
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) => 
                    setSettings(s => ({ ...s, requireApproval: checked }))}
                  disabled={!isAdmin}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}