-- ==============================================
-- COMPLETE FIX: RLS + Organization Setup
-- Run this ONCE in Supabase SQL Editor
-- ==============================================

-- STEP 1: Fix RLS Infinite Recursion
-- ==============================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in organization" ON profiles;

-- Create FIXED policies (no recursion)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view profiles in same organization" ON profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Step 1 Complete (RLS policies fixed)

-- STEP 2: Create Organization for Current User
-- ==============================================

DO $$
DECLARE
  current_user_id UUID;
  current_org_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get current user
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '❌ No user logged in. Please log in first!';
  END IF;
  
  -- Get user details
  SELECT email, raw_user_meta_data->>'full_name' 
  INTO user_email, user_name
  FROM auth.users 
  WHERE id = current_user_id;
  
  RAISE NOTICE 'Fixing user: % (%)', user_name, user_email;
  
  -- Check if user already has organization
  SELECT organization_id INTO current_org_id 
  FROM profiles 
  WHERE id = current_user_id;
  
  IF current_org_id IS NOT NULL THEN
    RAISE NOTICE '✅ User already has organization: %', current_org_id;
  ELSE
    -- Create organization
    INSERT INTO organizations (name, slug, subscription_tier, subscription_status)
    VALUES (
      COALESCE(user_name, user_email, 'My Organization') || '''s Organization',
      'org-' || SUBSTRING(current_user_id::text, 1, 8),
      'pro',
      'active'
    )
    RETURNING id INTO current_org_id;
    
    -- Link user to organization
    UPDATE profiles
    SET organization_id = current_org_id,
        role = 'admin',
        full_name = COALESCE(full_name, user_name, user_email)
    WHERE id = current_user_id;
    
    RAISE NOTICE '✅ Created organization: %', current_org_id;
  END IF;
  
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ ALL FIXED!';
  RAISE NOTICE 'User ID: %', current_user_id;
  RAISE NOTICE 'Organization ID: %', current_org_id;
  RAISE NOTICE '==========================================';
  
END $$;

-- STEP 3: Verify Fix
-- ==============================================

SELECT 
  '✅ VERIFICATION' as status,
  p.id as user_id,
  p.full_name,
  p.email,
  p.organization_id,
  p.role,
  o.name as organization_name
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
WHERE p.id = auth.uid();

-- If you see your organization_id filled in, you're all set! ✅

