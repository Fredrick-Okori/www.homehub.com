-- ============================================
-- Create Profile for Existing User
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Option 1: If you know the user's email, use this:
-- Replace 'your-email@example.com' with the actual email
INSERT INTO public.profiles (id, role, created_at)
SELECT 
  id,
  'admin'::text,  -- or 'user' if you want regular user role
  now()
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;

-- Option 2: If you know the user's ID, use this:
-- Replace 'your-user-id-here' with the actual UUID
INSERT INTO public.profiles (id, role, created_at)
VALUES (
  'your-user-id-here'::uuid,
  'admin'::text,  -- or 'user' if you want regular user role
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Option 3: Create profiles for ALL users that don't have one yet
INSERT INTO public.profiles (id, role, created_at)
SELECT 
  id,
  'user'::text,  -- default role
  now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- To find your user ID, run this query:
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- ============================================
-- After creating the profile, verify it exists:
-- ============================================
SELECT * FROM public.profiles WHERE id = 'your-user-id-here';

