
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export function CreatePost() {
  const { currentUser, activeGroup, addPost } = useApp();
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!currentUser || !activeGroup || !mediaUrl) return;

    setIsSubmitting(true);
    addPost(activeGroup.id, caption, mediaUrl, mediaType);
    
    // Reset form
    setCaption("");
    setMediaUrl("");
    setIsSubmitting(false);
  };

  if (!currentUser || !activeGroup) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px]"
            />
            
            <Tabs defaultValue="image" onValueChange={(v) => setMediaType(v as "image" | "video")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Image</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    placeholder="Enter image URL"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For this demo, please enter a URL to an image
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="video" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder="Enter video URL"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For this demo, please enter a URL to a video
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">
          Posting in <span className="font-medium">{activeGroup.name}</span>
        </p>
        <Button 
          onClick={handleSubmit} 
          disabled={!mediaUrl || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
}
