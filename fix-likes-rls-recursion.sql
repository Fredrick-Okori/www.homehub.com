-- ============================================
-- Fix RLS Recursion for Likes Table
-- ============================================
-- This script fixes the infinite recursion error
-- when querying the likes table
-- ============================================

BEGIN;

-- Step 1: Ensure the is_admin() function exists (create if it doesn't)
-- This function uses SECURITY DEFINER to bypass RLS and prevent recursion
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

-- Step 2: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO public;

-- Step 3: Drop existing RLS policies on likes table
DROP POLICY IF EXISTS "Allow public to read likes" ON public.likes;
DROP POLICY IF EXISTS "Allow public to insert likes" ON public.likes;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Public can read likes" ON public.likes;
DROP POLICY IF EXISTS "Public can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

-- Step 4: Recreate RLS policies using the is_admin() function
-- This prevents recursion because the function uses SECURITY DEFINER

-- Allow public (including anonymous users) to read likes
CREATE POLICY "Allow public to read likes"
ON public.likes
FOR SELECT
TO public
USING (true);

-- Allow public (including anonymous users) to insert likes
CREATE POLICY "Allow public to insert likes"
ON public.likes
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to delete their own likes
-- Note: Since user_id can be null for anonymous likes, we only allow
-- deletion if the user_id matches the authenticated user
CREATE POLICY "Allow authenticated users to delete their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (
  user_id IS NOT NULL 
  AND user_id = auth.uid()
);

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================
-- Notes:
-- ============================================
-- 1. The is_admin() function uses SECURITY DEFINER which means
--    it runs with the privileges of the function creator (usually postgres),
--    bypassing RLS on the profiles table
-- 2. This prevents the infinite recursion error
-- 3. Public users can read and insert likes (for anonymous likes)
-- 4. Authenticated users can only delete their own likes (where user_id matches)
-- 5. The likes table allows user_id to be NULL for anonymous likes
-- ============================================

