-- Fix infinite recursion in profiles RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kofhwlmffnzpehaoplzx/sql

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create fixed policies that don't cause recursion
-- These use auth.uid() directly instead of querying profiles table

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Test the fix
SELECT 'RLS policies fixed successfully!' as status;























