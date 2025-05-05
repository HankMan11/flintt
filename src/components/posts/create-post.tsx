
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, FilmIcon, X, Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function CreatePost() {
  const { currentUser, activeGroup, addPost } = useApp();
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Verify bucket exists on component mount
  useEffect(() => {
    checkPostsBucket();
  }, [currentUser, activeGroup]);

  const checkPostsBucket = async () => {
    if (!currentUser || !activeGroup) return;
    
    setBucketStatus("checking");
    setErrorMessage(null);
    
    try {
      // Check if the posts bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error checking buckets:", bucketsError);
        setErrorMessage("Unable to verify storage status. You might need to log in again.");
        setBucketStatus("error");
        return;
      }
      
      const postsBucketExists = buckets?.some(bucket => bucket.name === 'posts');
      
      if (!postsBucketExists) {
        setErrorMessage("Storage not configured. Please contact support to set up the required storage buckets.");
        setBucketStatus("error");
        return;
      }
      
      setBucketStatus("ready");
    } catch (error) {
      console.error("Error checking posts bucket:", error);
      setErrorMessage("Could not connect to storage service. Please try again later.");
      setBucketStatus("error");
    }
  };

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
    if (bucketStatus === "error") {
      toast({
        title: "Storage error",
        description: errorMessage || "Storage is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    if (bucketStatus === "checking") {
      toast({
        title: "Please wait",
        description: "Storage status is being verified. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

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

    setIsUploading(true);

    try {
      // Verify bucket exists again before uploading
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError || !buckets?.some(bucket => bucket.name === 'posts')) {
        throw new Error("Storage bucket is unavailable. Please try again later or contact support.");
      }

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
        {bucketStatus === "error" && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive flex-1">{errorMessage || "Storage not configured properly."}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2" 
              onClick={checkPostsBucket}
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}
        
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
              disabled={isUploading || bucketStatus !== "ready"}
              className={isMobile ? "px-3 py-1 h-8" : ""}
            >
              <Image className="mr-2 h-4 w-4" />
              Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || bucketStatus !== "ready"}
              className={isMobile ? "px-3 py-1 h-8" : ""}
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
            disabled={!caption.trim() || !selectedMedia || isUploading || bucketStatus !== "ready"}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : bucketStatus === "checking" ? (
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
