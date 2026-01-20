-- ============================================
-- Auto-Create Profile Trigger
-- ============================================
-- This automatically creates a profile when a new user signs up
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create a function that creates a profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at)
  VALUES (
    NEW.id,
    'user'::text,  -- default role for new users
    now()
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't error if profile already exists
  RETURN NEW;
END;
$$;

-- Step 2: Create a trigger that fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Notes:
-- ============================================
-- 1. This trigger will automatically create a profile for every new user
-- 2. The profile will have role = 'user' by default
-- 3. You can manually update the role to 'admin' for specific users
-- 4. The function uses SECURITY DEFINER to bypass RLS
-- 5. ON CONFLICT prevents errors if profile already exists
-- ============================================

-- ============================================
-- To update a user's role to admin:
-- ============================================
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'user-id-here';

-- ============================================
-- To verify the trigger works:
-- ============================================
-- 1. Create a new user in Supabase Auth
-- 2. Check if a profile was automatically created:
--    SELECT * FROM public.profiles WHERE id = 'new-user-id';
-- ============================================

