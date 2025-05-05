
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we have Supabase storage buckets
import { supabase } from './integrations/supabase/client';

// This function will check for essential buckets
async function checkStorageBuckets() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    // Check if essential buckets exist
    const requiredBuckets = ['avatars', 'posts'];
    const missingBuckets = requiredBuckets.filter(
      bucketName => !buckets?.some(bucket => bucket.name === bucketName)
    );
    
    if (missingBuckets.length > 0) {
      console.warn(`Missing required buckets: ${missingBuckets.join(', ')}`);
      console.warn("Please ensure these buckets are created in the Supabase dashboard");
      return false;
    }
    
    console.log("All required storage buckets exist");
    return true;
  } catch (error) {
    console.error("Error checking storage buckets:", error);
    return false;
  }
}

// Call the function before rendering the app but don't wait for it
checkStorageBuckets().catch(e => {
  console.error("Failed to check if storage buckets exist:", e);
}).finally(() => {
  // Always render the app, even if bucket setup fails
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
