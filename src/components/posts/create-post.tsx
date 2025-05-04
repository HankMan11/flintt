
import { useState, useRef, useEffect } from "react";
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
  const [bucketReady, setBucketReady] = useState(false);
  const [isBucketChecking, setIsBucketChecking] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Verify and create bucket on component mount
  useEffect(() => {
    async function ensurePostsBucket() {
      setIsBucketChecking(true);
      try {
        // Check if posts bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error checking buckets:", bucketsError);
          toast({
            title: "Storage Error",
            description: "Unable to check storage buckets. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        const postsBucketExists = buckets?.some(bucket => bucket.name === 'posts');
        
        if (!postsBucketExists) {
          // Create bucket with public access
          const { error: createError } = await supabase.storage.createBucket('posts', {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
          });
          
          if (createError) {
            console.error("Error creating posts bucket:", createError);
            toast({
              title: "Storage Setup Failed",
              description: "Failed to set up storage for posts. Please contact support.",
              variant: "destructive",
            });
            return;
          }
          
          console.log("Posts bucket created successfully");
        }
        
        setBucketReady(true);
      } catch (error) {
        console.error("Error ensuring posts bucket exists:", error);
        toast({
          title: "Storage Error",
          description: "Failed to set up storage. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsBucketChecking(false);
      }
    }
    
    if (currentUser && activeGroup) {
      ensurePostsBucket();
    }
  }, [currentUser, activeGroup, toast]);

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
    if (!caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please add a caption to your post",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedMedia) {
      toast({
        title: "No media selected",
        description: "Please upload an image or video",
        variant: "destructive",
      });
      return;
    }

    if (!bucketReady) {
      toast({
        title: "Storage not ready",
        description: "Please wait while we set up storage for your post",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedMedia.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedMedia);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Create post with the file URL
      await addPost(activeGroup.id, caption, urlData.publicUrl, mediaType);

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
        description: error instanceof Error ? error.message : "Failed to create post. Please try again.",
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
              disabled={isUploading || isBucketChecking}
            >
              <Image className="mr-2 h-4 w-4" />
              Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isBucketChecking}
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
            disabled={!caption.trim() || !selectedMedia || isUploading || isBucketChecking || !bucketReady}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : isBucketChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
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
