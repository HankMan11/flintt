
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we have a Supabase storage bucket named 'avatars'
import { supabase } from './integrations/supabase/client';

// This function will create the avatars bucket if it doesn't exist
async function ensureAvatarsBucket() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return; // Continue with app initialization even if bucket creation fails
    }
    
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log("Creating avatars bucket...");
      try {
        const { error } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024, // 1MB
        });
        
        if (error) {
          console.error("Error creating avatars bucket:", error);
        } else {
          console.log("Avatars bucket created successfully");
        }
      } catch (bucketError) {
        console.error("Exception creating avatars bucket:", bucketError);
      }
    }
  } catch (error) {
    console.error("Error checking avatars bucket:", error);
  }
}

// Call the function before rendering the app but don't wait for it
// This prevents the app from blocking if bucket creation fails
ensureAvatarsBucket().catch(e => {
  console.error("Failed to ensure avatars bucket exists:", e);
}).finally(() => {
  // Always render the app, even if bucket setup fails
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
