
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
    
    // Create essential buckets if they don't exist
    const bucketsToCreate = [
      {
        name: 'avatars',
        public: true,
        fileSizeLimit: 1024 * 1024 // 1MB
      },
      {
        name: 'posts',
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      }
    ];
    
    for (const bucketConfig of bucketsToCreate) {
      const bucketExists = buckets?.some(bucket => bucket.name === bucketConfig.name);
      
      if (!bucketExists) {
        console.log(`Creating ${bucketConfig.name} bucket...`);
        try {
          const { error } = await supabase.storage.createBucket(bucketConfig.name, {
            public: bucketConfig.public,
            fileSizeLimit: bucketConfig.fileSizeLimit
          });
          
          if (error) {
            console.error(`Error creating ${bucketConfig.name} bucket:`, error);
          } else {
            console.log(`${bucketConfig.name} bucket created successfully`);
          }
        } catch (bucketError) {
          console.error(`Exception creating ${bucketConfig.name} bucket:`, bucketError);
        }
      } else {
        console.log(`${bucketConfig.name} bucket already exists`);
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
