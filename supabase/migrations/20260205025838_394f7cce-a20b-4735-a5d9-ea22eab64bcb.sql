
-- Drop existing storage policies if any (to recreate with correct logic)
DROP POLICY IF EXISTS "Store admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Store admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Store admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Allow anyone to view product images (bucket is public)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow store admins to upload product images
CREATE POLICY "Store admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (
    -- User is a store admin (has entry in store_admins table)
    EXISTS (
      SELECT 1 FROM public.store_admins 
      WHERE user_id = auth.uid()
    )
    OR
    -- Or user is a SUPER_ADMIN
    public.has_role(auth.uid(), 'SUPER_ADMIN')
  )
);

-- Allow store admins to update their uploaded images
CREATE POLICY "Store admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.store_admins 
      WHERE user_id = auth.uid()
    )
    OR
    public.has_role(auth.uid(), 'SUPER_ADMIN')
  )
);

-- Allow store admins to delete product images
CREATE POLICY "Store admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.store_admins 
      WHERE user_id = auth.uid()
    )
    OR
    public.has_role(auth.uid(), 'SUPER_ADMIN')
  )
);
