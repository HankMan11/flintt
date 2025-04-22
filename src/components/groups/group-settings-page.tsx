
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/contexts/GroupsContext";
import { useNavigate } from "react-router-dom";

export function GroupSettingsPage() {
  const { activeGroup, uploadGroupImage } = useGroups();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    <div className="max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>Manage settings for <span className="font-semibold">{activeGroup.name}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={activeGroup.imageUrl || activeGroup.icon} 
                alt={activeGroup.name} 
                className="h-14 w-14 rounded-full border object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 shadow-lg hover:bg-primary/90"
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
            <div>
              <div className="font-bold text-lg">{activeGroup.name}</div>
              <div className="text-muted-foreground">{activeGroup.description}</div>
            </div>
          </div>
          {/* You can expand this section: add forms to update group details, manage members, etc. */}
          <Button variant="outline" onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardContent>
      </Card>
    </div>
  );
}
