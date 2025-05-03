
import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Link, Settings, Copy, Check, Crown, UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Group } from "@/types";

export function GroupSettingsPage() {
  const { activeGroup, currentUser, fetchGroups } = useApp();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState<File | null>(null);
  const [groupIconUrl, setGroupIconUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (activeGroup) {
      setGroupName(activeGroup.name);
      setGroupDescription(activeGroup.description || "");
      setGroupIconUrl(activeGroup.icon);
      setMembers(activeGroup.members);
      
      // Check if current user is admin
      checkUserRole();
    }
  }, [activeGroup]);
  
  const checkUserRole = async () => {
    if (!activeGroup || !currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*') // Use select * to get all columns including the newly added is_admin
        .eq('group_id', activeGroup.id)
        .eq('user_id', currentUser.id)
        .single();
        
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGroupIcon(file);
      
      // Create local URL for preview
      const objectUrl = URL.createObjectURL(file);
      setGroupIconUrl(objectUrl);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeGroup || !currentUser) return;
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only group admins can update group settings",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let updatedIconUrl = activeGroup.icon;
      
      // If there's a new image, upload it first
      if (groupIcon) {
        const fileName = `${Date.now()}-${groupIcon.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('group-images')
          .upload(fileName, groupIcon);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('group-images')
          .getPublicUrl(fileName);
          
        updatedIconUrl = publicUrlData.publicUrl;
      }
      
      // Update group info
      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: groupName,
          description: groupDescription,
          icon: updatedIconUrl
        })
        .eq('id', activeGroup.id);
        
      if (updateError) throw updateError;
      
      await fetchGroups();
      
      toast({
        title: "Group updated",
        description: "The group settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!activeGroup || !isAdmin) return;
    
    if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      setLoading(true);
      
      try {
        const { error } = await supabase
          .from('groups')
          .delete()
          .eq('id', activeGroup.id);
          
        if (error) throw error;
        
        toast({
          title: "Group deleted",
          description: "The group has been successfully deleted",
        });
        
        await fetchGroups();
        navigate('/groups');
      } catch (error) {
        console.error('Error deleting group:', error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the group",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const copyInviteCode = () => {
    if (!activeGroup?.inviteCode) return;
    
    navigator.clipboard.writeText(activeGroup.inviteCode);
    setCopiedInvite(true);
    
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
    
    setTimeout(() => setCopiedInvite(false), 2000);
  };
  
  const toggleUserRole = async (userId: string, currentIsAdmin: boolean) => {
    if (!activeGroup || !isAdmin) return;
    
    setRoleUpdating(true);
    
    try {
      // Update the is_admin field that we've just added in our SQL migration
      const { error } = await supabase
        .from('group_members')
        .update({ is_admin: !currentIsAdmin })
        .eq('group_id', activeGroup.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setMembers(members.map(member => 
        member.id === userId 
          ? { ...member, isAdmin: !currentIsAdmin } 
          : member
      ));
      
      toast({
        title: "Role updated",
        description: `User is now ${!currentIsAdmin ? 'an admin' : 'a member'}`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Failed to update role",
        description: "An error occurred while updating the user's role",
        variant: "destructive"
      });
    } finally {
      setRoleUpdating(false);
    }
  };
  
  const removeUser = async (userId: string) => {
    if (!activeGroup || !isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', activeGroup.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setMembers(members.filter(member => member.id !== userId));
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the group"
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Failed to remove member",
        description: "An error occurred while removing the member",
        variant: "destructive"
      });
    }
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Settings</CardTitle>
              <CardDescription>Manage settings for <span className="font-semibold">{activeGroup.name}</span></CardDescription>
            </div>
            <Avatar className="h-14 w-14">
              <AvatarImage src={groupIconUrl} alt={groupName} />
              <AvatarFallback>{groupName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Group Name</Label>
                <Input 
                  id="name" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Group Description</Label>
                <Input 
                  id="description" 
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="icon">Group Icon</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={groupIconUrl} alt={groupName} />
                    <AvatarFallback>{groupName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Input 
                    id="icon" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Invite Link</h3>
            <div className="flex items-center gap-2">
              <Input value={activeGroup.inviteCode || ""} readOnly />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyInviteCode}
                disabled={!activeGroup.inviteCode}
              >
                {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Members ({members.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                    {member.isAdmin && (
                      <Badge variant="secondary" className="ml-2">
                        <Crown className="mr-1 h-3 w-3" /> Admin
                      </Badge>
                    )}
                  </div>
                  
                  {isAdmin && member.id !== currentUser?.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={roleUpdating}
                        onClick={() => toggleUserRole(member.id, !!member.isAdmin)}
                        title={member.isAdmin ? "Remove admin" : "Make admin"}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeUser(member.id)}
                        title="Remove from group"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {isAdmin && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteGroup}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Group
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
