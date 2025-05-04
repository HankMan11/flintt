
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we have Supabase storage buckets
import { supabase } from './integrations/supabase/client';

// This function will create essential buckets if they don't exist
async function ensureStorageBuckets() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return; // Continue with app initialization even if bucket creation fails
    }
    
    // Check for avatars bucket
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
    
    // Check for posts bucket
    const postsBucketExists = buckets?.some(bucket => bucket.name === 'posts');
    
    if (!postsBucketExists) {
      console.log("Creating posts bucket...");
      try {
        const { error } = await supabase.storage.createBucket('posts', {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
        
        if (error) {
          console.error("Error creating posts bucket:", error);
        } else {
          console.log("Posts bucket created successfully");
        }
      } catch (bucketError) {
        console.error("Exception creating posts bucket:", bucketError);
      }
    }
  } catch (error) {
    console.error("Error checking storage buckets:", error);
  }
}

// Call the function before rendering the app but don't wait for it
// This prevents the app from blocking if bucket creation fails
ensureStorageBuckets().catch(e => {
  console.error("Failed to ensure storage buckets exist:", e);
}).finally(() => {
  // Always render the app, even if bucket setup fails
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
