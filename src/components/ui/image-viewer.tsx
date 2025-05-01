
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageViewer({ imageUrl, isOpen, onClose, alt = "Image" }: ImageViewerProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/80 flex items-center justify-center transition-opacity",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "relative max-h-[90vh] max-w-[90vw] transition-transform",
          isClosing ? "scale-95" : "scale-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <img 
          src={imageUrl} 
          alt={alt} 
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
        />
      </div>
    </div>
  );
}
