-- ============================================
-- Make user_id nullable in likes table
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

-- Step 2: Make user_id nullable
ALTER TABLE public.likes
ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Re-add the foreign key constraint (now allowing NULL)
ALTER TABLE public.likes
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Step 4: Update the unique constraint to allow multiple NULL values
-- PostgreSQL allows multiple NULLs in unique constraints by default,
-- but we need to make sure the constraint handles NULLs properly
-- Drop the existing unique constraint
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS unique_like;

-- Recreate the unique constraint (NULLs are allowed and don't conflict)
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_index 
ON public.likes (listing_id, user_id)
WHERE user_id IS NOT NULL;

-- For NULL user_id, we can have multiple likes per listing
-- (anonymous likes don't need to be unique)

-- ============================================
-- Notes:
-- ============================================
-- 1. user_id can now be NULL, allowing anonymous likes
-- 2. Authenticated users with profiles will have user_id set
-- 3. Users without profiles can still like (with user_id = NULL)
-- 4. The unique constraint only applies when user_id IS NOT NULL
-- 5. Multiple anonymous likes for the same listing are allowed
-- ============================================

