-- ============================================
-- Fix RLS Policies to Avoid Infinite Recursion
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS and avoids recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with the privileges of the function creator
  -- and bypasses RLS, so it won't cause recursion
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Step 3: Drop ALL existing policies on listings table to start fresh
-- This ensures we remove any policies that might be causing recursion
DROP POLICY IF EXISTS "Enable users to view their own data only" ON "public"."listings";
DROP POLICY IF EXISTS "Enable authenticated users to insert listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable users to insert their own listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable admins to insert listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable users to update their own listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable users to delete their own listings" ON "public"."listings";
-- Drop any other policies that might exist (adjust names if needed)

-- Step 4: Create new SELECT policy using the function (avoids recursion)
CREATE POLICY "Enable users to view their own data only"
ON "public"."listings"
FOR SELECT
TO authenticated
USING (
  (auth.uid() = created_by)
  OR
  (public.is_admin(auth.uid()))
);

-- Step 5: Drop any existing INSERT policies that might cause recursion
DROP POLICY IF EXISTS "Enable authenticated users to insert listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable users to insert their own listings" ON "public"."listings";
DROP POLICY IF EXISTS "Enable admins to insert listings" ON "public"."listings";

-- Step 6: Create INSERT policy for authenticated users (simple, no profile checks)
-- This avoids recursion by not checking profiles table
CREATE POLICY "Enable authenticated users to insert listings"
ON "public"."listings"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 7: Create UPDATE policy (optional, for editing listings)
CREATE POLICY "Enable users to update their own listings"
ON "public"."listings"
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = created_by)
  OR
  (public.is_admin(auth.uid()))
)
WITH CHECK (
  (auth.uid() = created_by)
  OR
  (public.is_admin(auth.uid()))
);

-- Step 8: Create DELETE policy (optional, for deleting listings)
CREATE POLICY "Enable users to delete their own listings"
ON "public"."listings"
FOR DELETE
TO authenticated
USING (
  (auth.uid() = created_by)
  OR
  (public.is_admin(auth.uid()))
);

-- ============================================
-- Notes:
-- ============================================
-- 1. The is_admin() function uses SECURITY DEFINER which bypasses RLS
-- 2. This prevents infinite recursion when checking admin status
-- 3. The function is safe because it only checks the role, not sensitive data
-- 4. Make sure your profiles table has a 'role' column with 'admin' as a possible value
-- ============================================

