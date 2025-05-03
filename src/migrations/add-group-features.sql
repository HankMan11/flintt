
-- Add a is_admin column to group_members table
ALTER TABLE IF EXISTS public.group_members 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add is_pinned column to posts table
ALTER TABLE IF EXISTS public.posts 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Make sure we have a group-images storage bucket
CREATE OR REPLACE FUNCTION create_group_images_bucket()
RETURNS void AS $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('group-images', 'group-images', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Add policy to allow authenticated users to upload images
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES (
    'Allow authenticated uploads',
    'CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''group-images'')',
    'group-images'
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  -- Add policy to allow public access to images
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES (
    'Allow public access',
    'CREATE POLICY "Allow public access" ON storage.objects FOR SELECT TO public USING (bucket_id = ''group-images'')',
    'group-images'
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create posts storage bucket
CREATE OR REPLACE FUNCTION create_posts_bucket()
RETURNS void AS $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('posts', 'posts', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Add policy to allow authenticated users to upload
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES (
    'Allow authenticated uploads',
    'CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''posts'')',
    'posts'
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;
  
  -- Add policy to allow public access
  INSERT INTO storage.policies (name, definition, bucket_id)
  VALUES (
    'Allow public access',
    'CREATE POLICY "Allow public access" ON storage.objects FOR SELECT TO public USING (bucket_id = ''posts'')',
    'posts'
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute the functions
SELECT create_group_images_bucket();
SELECT create_posts_bucket();

-- Make the original creator of a group an admin automatically
UPDATE public.group_members
SET is_admin = true
WHERE (group_id, user_id, joined_at) IN (
  SELECT gm.group_id, gm.user_id, MIN(gm.joined_at)
  FROM public.group_members gm
  GROUP BY gm.group_id, gm.user_id
);
