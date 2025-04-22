
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, isOpen, onClose }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-lg p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="w-full h-auto object-contain max-h-[90vh]"
        />
      </DialogContent>
    </Dialog>
  );
}
