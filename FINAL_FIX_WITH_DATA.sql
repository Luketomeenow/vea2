-- ==============================================
-- FINAL FIX: Organization + Mock Data for lukejason05@gmail.com
-- Run this in Supabase SQL Editor
-- ==============================================

-- STEP 1: Fix RLS Policies
-- ==============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in organization" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON profiles;

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

-- STEP 2: Setup Organization for lukejason05@gmail.com
-- ==============================================
DO $$
DECLARE
  target_user_id UUID;
  target_org_id UUID;
  user_name TEXT;
BEGIN
  -- Find the user by email
  SELECT id, raw_user_meta_data->>'full_name'
  INTO target_user_id, user_name
  FROM auth.users 
  WHERE email = 'lukejason05@gmail.com';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION '❌ User lukejason05@gmail.com not found!';
  END IF;
  
  RAISE NOTICE 'Found user: % (%)', target_user_id, user_name;
  
  -- Check if user already has organization
  SELECT organization_id INTO target_org_id 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF target_org_id IS NULL THEN
    -- Create organization
    INSERT INTO organizations (name, slug, subscription_tier, subscription_status)
    VALUES (
      COALESCE(user_name, 'Luke Jason') || '''s Organization',
      'lukejason-org',
      'pro',
      'active'
    )
    RETURNING id INTO target_org_id;
    
    -- Link user to organization
    UPDATE profiles
    SET organization_id = target_org_id,
        role = 'admin',
        full_name = COALESCE(full_name, user_name, 'Luke Jason')
    WHERE id = target_user_id;
    
    RAISE NOTICE '✅ Created NEW organization: %', target_org_id;
  ELSE
    RAISE NOTICE '✅ User already has organization: %', target_org_id;
  END IF;
  
  -- STEP 3: Clean old mock data (if any)
  RAISE NOTICE 'Cleaning old data...';
  DELETE FROM notifications WHERE user_id = target_user_id;
  DELETE FROM activity_logs WHERE organization_id = target_org_id;
  DELETE FROM analytics_metrics WHERE organization_id = target_org_id;
  DELETE FROM analytics_events WHERE organization_id = target_org_id;
  DELETE FROM event_attendees WHERE event_id IN (SELECT id FROM calendar_events WHERE organization_id = target_org_id);
  DELETE FROM calendar_events WHERE organization_id = target_org_id;
  DELETE FROM time_entries WHERE organization_id = target_org_id;
  DELETE FROM cash_flow_entries WHERE organization_id = target_org_id;
  DELETE FROM expenses WHERE organization_id = target_org_id;
  DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = target_org_id);
  DELETE FROM invoices WHERE organization_id = target_org_id;
  DELETE FROM customer_contacts WHERE customer_id IN (SELECT id FROM customers WHERE organization_id = target_org_id);
  DELETE FROM customers WHERE organization_id = target_org_id;
  DELETE FROM task_comments WHERE task_id IN (SELECT id FROM tasks WHERE organization_id = target_org_id);
  DELETE FROM tasks WHERE organization_id = target_org_id;
  DELETE FROM project_members WHERE project_id IN (SELECT id FROM projects WHERE organization_id = target_org_id);
  DELETE FROM projects WHERE organization_id = target_org_id;
  DELETE FROM chat_messages WHERE user_id = target_user_id;
  DELETE FROM chat_sessions WHERE user_id = target_user_id;
  
  RAISE NOTICE '✅ Cleaned old data';
  
  -- STEP 4: Insert Fresh Mock Data
  RAISE NOTICE 'Inserting fresh mock data...';
  
  -- Projects
  INSERT INTO projects (organization_id, name, description, status, priority, start_date, end_date, budget, spent, progress, owner_id, color, tags)
  VALUES 
    (target_org_id, 'Website Redesign', 'Complete overhaul of company website', 'active', 'high', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 50000.00, 32000.00, 65, target_user_id, '#3B82F6', ARRAY['web', 'design']),
    (target_org_id, 'Mobile App Development', 'Native iOS and Android app', 'active', 'urgent', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '90 days', 120000.00, 45000.00, 38, target_user_id, '#10B981', ARRAY['mobile', 'app']);
  
  -- Tasks
  INSERT INTO tasks (organization_id, title, description, status, priority, assigned_to, created_by, due_date, tags)
  VALUES
    (target_org_id, 'Design homepage mockups', 'Create wireframes for homepage', 'done', 'high', target_user_id, target_user_id, CURRENT_DATE + INTERVAL '5 days', ARRAY['design']),
    (target_org_id, 'Implement navigation', 'Build responsive navigation', 'in_progress', 'high', target_user_id, target_user_id, CURRENT_DATE + INTERVAL '3 days', ARRAY['frontend']),
    (target_org_id, 'Setup deployment', 'Configure CI/CD pipeline', 'todo', 'medium', target_user_id, target_user_id, CURRENT_DATE + INTERVAL '15 days', ARRAY['devops']);
  
  -- Customers
  INSERT INTO customers (organization_id, name, email, phone, company, city, state, country, customer_type, status, tags)
  VALUES
    (target_org_id, 'Acme Corporation', 'contact@acmecorp.com', '+1-555-0101', 'Acme Corporation', 'San Francisco', 'CA', 'USA', 'business', 'active', ARRAY['enterprise']),
    (target_org_id, 'TechStart Inc', 'hello@techstart.io', '+1-555-0202', 'TechStart Inc', 'Austin', 'TX', 'USA', 'business', 'active', ARRAY['startup']);
  
  -- Invoices
  INSERT INTO invoices (organization_id, invoice_number, status, issue_date, due_date, paid_date, subtotal, tax_amount, total_amount, currency)
  VALUES
    (target_org_id, 'INV-2024-001', 'paid', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days', 15000.00, 1350.00, 16350.00, 'USD'),
    (target_org_id, 'INV-2024-002', 'sent', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', NULL, 25000.00, 2250.00, 27250.00, 'USD');
  
  -- Cash Flow Entries
  INSERT INTO cash_flow_entries (organization_id, type, category, description, amount, transaction_date, payment_method, status, tags)
  VALUES
    (target_org_id, 'income', 'Invoice Payment', 'Payment from Acme Corp', 16350.00, CURRENT_DATE - INTERVAL '25 days', 'Bank Transfer', 'completed', ARRAY['invoice']),
    (target_org_id, 'income', 'Consulting', 'Consulting services', 3500.00, CURRENT_DATE - INTERVAL '10 days', 'PayPal', 'completed', ARRAY['consulting']),
    (target_org_id, 'expense', 'Software', 'Adobe Creative Cloud', 52.99, CURRENT_DATE - INTERVAL '5 days', 'Company Card', 'completed', ARRAY['software']),
    (target_org_id, 'expense', 'Office', 'Office rent', 2500.00, CURRENT_DATE - INTERVAL '1 days', 'Bank Transfer', 'completed', ARRAY['office']);
  
  -- Notifications
  INSERT INTO notifications (user_id, type, title, message, read, created_at)
  VALUES
    (target_user_id, 'warning', 'Project Deadline', 'Website Redesign project is due in 2 days', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (target_user_id, 'success', 'Payment Received', '$16,350 payment from Acme Corp received', FALSE, CURRENT_TIMESTAMP - INTERVAL '25 days'),
    (target_user_id, 'info', 'New Task', 'You have been assigned to "Implement navigation"', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (target_user_id, 'info', 'Welcome', 'Welcome to VEA Dashboard! Get started by exploring your projects and tasks.', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days');
  
  RAISE NOTICE '✅ Mock data inserted!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ COMPLETE!';
  RAISE NOTICE 'User: lukejason05@gmail.com';
  RAISE NOTICE 'User ID: %', target_user_id;
  RAISE NOTICE 'Organization ID: %', target_org_id;
  RAISE NOTICE '- 2 Projects';
  RAISE NOTICE '- 3 Tasks';
  RAISE NOTICE '- 2 Customers';
  RAISE NOTICE '- 2 Invoices';
  RAISE NOTICE '- 4 Cash Flow Entries';
  RAISE NOTICE '- 4 Notifications (2 unread)';
  RAISE NOTICE '==========================================';
END $$;

-- STEP 5: Verify Everything
-- ==============================================
SELECT 
  '✅ VERIFICATION FOR lukejason05@gmail.com' as status,
  p.id as user_id,
  p.full_name,
  p.email,
  p.organization_id,
  p.role,
  o.name as organization_name,
  (SELECT COUNT(*) FROM projects WHERE organization_id = p.organization_id) as project_count,
  (SELECT COUNT(*) FROM tasks WHERE organization_id = p.organization_id) as task_count,
  (SELECT COUNT(*) FROM customers WHERE organization_id = p.organization_id) as customer_count
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.email = 'lukejason05@gmail.com';

