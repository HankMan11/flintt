
import React, { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Trash2, UserPlus, UserMinus, Copy, Check, ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GroupSettingsPage = () => {
  const { activeGroup, currentUser, uploadGroupImage } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupName, setGroupName] = useState(activeGroup?.name || "");
  const [groupDescription, setGroupDescription] = useState(activeGroup?.description || "");
  const [inviteCode, setInviteCode] = useState(activeGroup?.inviteCode || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if current user is admin
  React.useEffect(() => {
    if (activeGroup && currentUser) {
      const userMembership = activeGroup.members.find(m => m.userId === currentUser.id);
      setIsAdmin(userMembership?.role === 'admin' || false);
    }
  }, [activeGroup, currentUser]);
  
  // Redirect if no active group
  React.useEffect(() => {
    if (!activeGroup) {
      navigate('/');
    }
  }, [activeGroup, navigate]);

  if (!activeGroup || !currentUser) {
    return null;
  }

  const handleSaveSettings = async () => {
    // In a real app, implement saving group settings to backend
    toast({
      title: "Settings updated",
      description: "Group settings have been saved successfully"
    });
  };
  
  const handleImageUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      const imageUrl = await uploadGroupImage(selectedFile);
      
      if (imageUrl) {
        toast({
          title: "Image uploaded",
          description: "Group image has been updated successfully"
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload group image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleCopyInviteCode = () => {
    if (!activeGroup.inviteCode) return;
    
    navigator.clipboard.writeText(activeGroup.inviteCode);
    setInviteCopied(true);
    toast({
      title: "Invite code copied",
      description: "The invite code has been copied to clipboard"
    });
    
    setTimeout(() => setInviteCopied(false), 2000);
  };
  
  const toggleUserRole = (userId: string) => {
    // In a real app, implement changing user role
    toast({
      title: "Role updated",
      description: "User role has been updated successfully"
    });
  };
  
  const removeUser = (userId: string) => {
    // In a real app, implement removing user from group
    if (window.confirm("Are you sure you want to remove this user from the group?")) {
      toast({
        title: "User removed",
        description: "User has been removed from the group"
      });
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <div className="container py-6">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{activeGroup.name} Settings</h1>
          </div>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invites">Invitations</TabsTrigger>
            </TabsList>
          
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage the basic information about your group
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="group-name">
                      Group Name
                    </label>
                    <Input
                      id="group-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="group-description">
                      Description
                    </label>
                    <Textarea
                      id="group-description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      disabled={!isAdmin}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Group Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                        <img 
                          src={activeGroup.icon || activeGroup.imageUrl || "https://via.placeholder.com/150"} 
                          alt={activeGroup.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                          </Button>
                          {selectedFile && (
                            <Button
                              onClick={handleImageUpload}
                              disabled={uploading}
                            >
                              {uploading ? "Uploading..." : "Upload"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveSettings}>
                        Save Changes
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to archive this group? This action can't be undone.")) {
                            toast({
                              title: "Group archived",
                              description: "This group has been archived"
                            });
                            navigate("/");
                          }
                        }}
                      >
                        Archive Group
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>
                    {activeGroup.members.length} members in this group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeGroup.members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatar} alt={member.user.name} />
                            <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.user.name}</div>
                            <div className="text-sm text-muted-foreground">@{member.user.username}</div>
                          </div>
                          <div className="ml-2">
                            <div className="text-xs inline-block px-2 py-1 rounded bg-muted">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        
                        {isAdmin && member.userId !== currentUser.id && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserRole(member.userId)}
                            >
                              {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeUser(member.userId)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invites">
              <Card>
                <CardHeader>
                  <CardTitle>Invitation Code</CardTitle>
                  <CardDescription>
                    Share this code to invite others to your group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={activeGroup.inviteCode || "No invite code available"}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyInviteCode}
                      disabled={!activeGroup.inviteCode}
                    >
                      {inviteCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-6">
                      <Button 
                        onClick={() => {
                          // In a real app, implement generating a new invite code
                          toast({
                            title: "New code generated",
                            description: "A new invitation code has been generated"
                          });
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Generate New Code
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default GroupSettingsPage;
