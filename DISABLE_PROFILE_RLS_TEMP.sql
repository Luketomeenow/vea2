-- Temporarily disable RLS on profiles to allow login
-- Run this in Supabase SQL Editor

-- Disable RLS entirely on profiles (TEMPORARY - for testing only)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows everything for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users" ON profiles;
CREATE POLICY "Allow all for authenticated users"
ON profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Re-enable RLS with the permissive policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT 'Profile RLS temporarily disabled - you should be able to login now' as status;





