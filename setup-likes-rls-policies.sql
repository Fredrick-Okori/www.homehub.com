-- ============================================
-- Setup RLS Policies for Likes Table
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create SECURITY DEFINER function to check if user is admin
-- This prevents RLS recursion issues (even if not used in likes policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO public;

-- Step 2: Enable RLS on likes table (if not already enabled)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read access to likes" ON public.likes;
DROP POLICY IF EXISTS "Allow authenticated users to insert likes" ON public.likes;
DROP POLICY IF EXISTS "Allow users to delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Allow public to insert likes" ON public.likes;

-- Step 3: Create policy for public read access (anyone can see like counts)
CREATE POLICY "Allow public read access to likes"
ON public.likes
FOR SELECT
TO public
USING (true);

-- Step 4: Create policy for public insert access (anyone can like)
CREATE POLICY "Allow public to insert likes"
ON public.likes
FOR INSERT
TO public
WITH CHECK (true);

-- Step 5: Create policy for users to delete their own likes (if they have a profile)
CREATE POLICY "Allow users to delete their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (
  user_id IS NULL 
  OR 
  user_id = auth.uid()
);

-- Step 6: Grant necessary permissions
GRANT SELECT ON public.likes TO public;
GRANT INSERT ON public.likes TO public;
GRANT DELETE ON public.likes TO authenticated;

-- ============================================
-- Notes:
-- ============================================
-- 1. Public users can read all likes (for like counts)
-- 2. Public users can insert likes (anonymous likes allowed)
-- 3. Authenticated users can delete their own likes
-- 4. user_id can be NULL for anonymous likes
-- ============================================

-- ============================================
-- To verify the policies work:
-- ============================================
-- Test as anonymous user:
-- SELECT COUNT(*) FROM public.likes WHERE listing_id = 'some-listing-id';
--
-- Test as authenticated user:
-- INSERT INTO public.likes (listing_id, user_id) 
-- VALUES ('some-listing-id', auth.uid());
-- ============================================

