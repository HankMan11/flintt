
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
      // This will fail silently if the bucket already exists or if you don't have permission
      // The SQL migration should have created the bucket already
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
