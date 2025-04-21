
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we have a Supabase storage bucket named 'avatars'
import { supabase } from './integrations/supabase/client';

// This function will create the avatars bucket if it doesn't exist
async function ensureAvatarsBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log("Creating avatars bucket...");
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024, // 1MB
      });
      
      if (error) {
        console.error("Error creating avatars bucket:", error);
      } else {
        console.log("Avatars bucket created successfully");
      }
    }
  } catch (error) {
    console.error("Error checking avatars bucket:", error);
  }
}

// Call the function before rendering the app
ensureAvatarsBucket().then(() => {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
