
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GroupImageUploadProps {
  defaultImage?: string;
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
}

export function GroupImageUpload({ defaultImage, onImageUploaded, disabled = false }: GroupImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(defaultImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;

    const file = event.target.files[0];
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Only image files are allowed");
      return;
    }
    
    setUploading(true);
    
    try {
      // First, check if the bucket exists
      let { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.some(bucket => bucket.name === 'group-images')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('group-images', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase
        .storage
        .from('group-images')
        .getPublicUrl(filePath);

      // Set the image URL and call the callback
      setImageUrl(data.publicUrl);
      onImageUploaded(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-20 w-20">
        <AvatarImage src={imageUrl} />
        <AvatarFallback>
          <Image className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={disabled || uploading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <>Uploading...</>
        ) : imageUrl ? (
          <>Change Image</>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
    </div>
  );
}
