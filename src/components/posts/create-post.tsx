
import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, FilmIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CreatePost() {
  const { currentUser, activeGroup, addPost } = useApp();
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!currentUser || !activeGroup) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const fileType = file.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedMedia(file);
    setMediaType(fileType as "image" | "video");

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedMedia) {
      toast({
        title: "No media selected",
        description: "Please upload an image or video",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Check if the bucket exists first
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(bucket => bucket.name === 'posts')) {
        // Create bucket if it doesn't exist
        await supabase.storage.createBucket('posts', {
          public: true
        });
      }
      
      // Upload file to Supabase Storage
      const fileExt = selectedMedia.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedMedia);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      // Create post with the file URL
      await addPost(activeGroup.id, caption, data.publicUrl, mediaType);

      // Reset form
      setCaption("");
      handleRemoveMedia();
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-8" id="create-post">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">
            Sharing with {activeGroup.name}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <Textarea
          placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="min-h-24 resize-none"
        />

        {mediaPreview && (
          <div className="relative">
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Upload preview"
                className="aspect-video w-full object-cover rounded-md"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="aspect-video w-full object-cover rounded-md"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full"
              onClick={handleRemoveMedia}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image className="mr-2 h-4 w-4" />
              Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <FilmIcon className="mr-2 h-4 w-4" />
              Video
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!selectedMedia || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
