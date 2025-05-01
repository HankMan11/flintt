
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from 'date-fns';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // If less than a minute, show "Just now"
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  return formatDistanceToNow(date, { addSuffix: true });
}
