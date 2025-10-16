-- Fix: Ensure all users have an organization
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  -- Loop through all users without an organization
  FOR user_record IN 
    SELECT p.id, p.full_name, p.email, au.email as auth_email
    FROM profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    WHERE p.organization_id IS NULL
  LOOP
    RAISE NOTICE 'Fixing user: % (%)', user_record.full_name, user_record.email;
    
    -- Create an organization for this user
    INSERT INTO organizations (name, slug, subscription_tier, subscription_status)
    VALUES (
      COALESCE(user_record.full_name, user_record.auth_email, 'My Organization') || '''s Organization',
      'org-' || SUBSTRING(user_record.id::text, 1, 8),
      'pro',
      'active'
    )
    RETURNING id INTO org_id;
    
    -- Link user to organization
    UPDATE profiles
    SET organization_id = org_id,
        role = 'admin'
    WHERE id = user_record.id;
    
    RAISE NOTICE '✅ Created organization % for user %', org_id, user_record.id;
  END LOOP;
  
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ All users now have organizations!';
  RAISE NOTICE '==========================================';
END $$;

-- Verify the fix
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.organization_id,
  o.name as organization_name
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
ORDER BY p.created_at DESC;



