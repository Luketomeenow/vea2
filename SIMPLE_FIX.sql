-- ==============================================
-- SIMPLE FIX: RLS + Organization Setup
-- Run in Supabase SQL Editor (works without auth context)
-- ==============================================

-- STEP 1: Fix RLS Infinite Recursion
-- ==============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in organization" ON profiles;

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

-- STEP 2: Fix ALL users without organizations
-- ==============================================
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  -- Loop through ALL users without an organization
  FOR user_record IN 
    SELECT 
      p.id,
      p.full_name,
      p.email,
      au.email as auth_email,
      au.raw_user_meta_data->>'full_name' as meta_name
    FROM profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    WHERE p.organization_id IS NULL
  LOOP
    RAISE NOTICE 'Fixing user: % (%)', 
      COALESCE(user_record.full_name, user_record.meta_name, user_record.auth_email), 
      user_record.id;
    
    -- Create an organization for this user
    INSERT INTO organizations (name, slug, subscription_tier, subscription_status)
    VALUES (
      COALESCE(
        user_record.full_name, 
        user_record.meta_name, 
        user_record.auth_email, 
        'My Organization'
      ) || '''s Organization',
      'org-' || SUBSTRING(user_record.id::text, 1, 8),
      'pro',
      'active'
    )
    RETURNING id INTO org_id;
    
    -- Link user to organization
    UPDATE profiles
    SET 
      organization_id = org_id,
      role = 'admin',
      full_name = COALESCE(
        full_name, 
        user_record.meta_name, 
        user_record.auth_email
      )
    WHERE id = user_record.id;
    
    RAISE NOTICE '✅ Created organization % for user %', org_id, user_record.id;
  END LOOP;
  
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ ALL USERS FIXED!';
  RAISE NOTICE '==========================================';
END $$;

-- STEP 3: Verify - Show all users and their organizations
-- ==============================================
SELECT 
  '✅ ALL USERS' as status,
  p.id as user_id,
  p.full_name,
  p.email,
  p.organization_id,
  p.role,
  o.name as organization_name,
  CASE 
    WHEN p.organization_id IS NULL THEN '❌ NO ORG'
    ELSE '✅ HAS ORG'
  END as org_status
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
ORDER BY p.created_at DESC;
















