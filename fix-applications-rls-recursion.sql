-- ============================================
-- Fix RLS Recursion for Applications Table
-- ============================================
-- This script fixes the infinite recursion error
-- when inserting into the applications table
-- ============================================

BEGIN;

-- Step 1: Create a SECURITY DEFINER function to check if user is admin
-- This bypasses RLS and prevents recursion
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

-- Step 3: Drop existing RLS policies on applications table
DROP POLICY IF EXISTS "Allow public to insert applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to read all applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to update applications" ON public.applications;

-- Step 4: Recreate RLS policies using the is_admin() function
-- This prevents recursion because the function uses SECURITY DEFINER

-- Allow public (including anonymous users) to insert applications
CREATE POLICY "Allow public to insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to read all applications
CREATE POLICY "Allow admins to read all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Allow admins to update applications
CREATE POLICY "Allow admins to update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================
-- Notes:
-- ============================================
-- 1. The is_admin() function uses SECURITY DEFINER which means
--    it runs with the privileges of the function creator (usually postgres),
--    bypassing RLS on the profiles table
-- 2. This prevents the infinite recursion error
-- 3. Public users can insert applications (for anonymous applicants)
-- 4. Only authenticated admins can read and update applications
-- ============================================

