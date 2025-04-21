
import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CreatePost() {
  const { currentUser, activeGroup, addPost } = useApp();
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    setMediaUrl("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return null;
    setUploading(true);
    const ext = selectedFile.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${mediaType}s/${filename}`;
    const { data, error } = await supabase.storage.from("uploads").upload(path, selectedFile, {
      cacheControl: "3600",
      upsert: true,
    });
    setUploading(false);
    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    // Now get public url
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    return urlData?.publicUrl ?? null;
  };

  const handleSubmit = async () => {
    if (!currentUser || !activeGroup) return;

    setIsSubmitting(true);

    let urlToUse = mediaUrl;
    if (selectedFile) {
      urlToUse = await handleUpload();
      if (!urlToUse) {
        setIsSubmitting(false);
        return;
      }
    }
    if (!urlToUse) {
      toast({
        title: "Missing media",
        description: "Please provide an image or video.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await addPost(activeGroup.id, caption, urlToUse, mediaType);
      toast({
        title: "Post created!",
        description: "Your post has been shared with the group.",
      });
      setCaption("");
      setMediaUrl("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create post",
        variant: "destructive",
      });
    }
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

            <Tabs defaultValue="image" onValueChange={(v) => {
              setMediaType(v as "image" | "video");
              setSelectedFile(null);
              setPreviewUrl(null);
              setMediaUrl("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}>
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
                  <Label htmlFor="image-file">Upload Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-file"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-auto"
                    />
                    {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                  </div>
                  {previewUrl && (
                    <img src={previewUrl} alt="Image Preview" className="max-h-40 rounded-md mt-2" />
                  )}
                  <div className="text-xs text-muted-foreground">
                    Or enter a URL
                  </div>
                  <Input
                    id="image-url"
                    placeholder="Enter image URL"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="video" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="video-file">Upload Video</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="video-file"
                      type="file"
                      ref={fileInputRef}
                      accept="video/*"
                      onChange={handleFileChange}
                      className="w-auto"
                    />
                    {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                  </div>
                  {previewUrl && (
                    <video src={previewUrl} controls className="max-h-40 rounded-md mt-2" />
                  )}
                  <div className="text-xs text-muted-foreground">
                    Or enter a URL
                  </div>
                  <Input
                    id="video-url"
                    placeholder="Enter video URL"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
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
          disabled={(!selectedFile && !mediaUrl) || isSubmitting || uploading}
        >
          {isSubmitting ? "Posting..." : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
