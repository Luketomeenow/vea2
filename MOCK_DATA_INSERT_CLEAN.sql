-- =====================================================
-- MOCK DATA FOR VEA DASHBOARD (CLEAN VERSION)
-- This version cleans up existing mock data first
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  current_user_id UUID;
  org_id UUID;
  org_name TEXT := 'VEA Technologies';
  proj1_id UUID;
  proj2_id UUID;
  cust1_id UUID;
  cust2_id UUID;
  cust3_id UUID;
BEGIN

-- =====================================================
-- AUTO-DETECT USER ID
-- =====================================================

SELECT id INTO current_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

IF current_user_id IS NULL THEN
  RAISE EXCEPTION 'No user found. Please sign up first at http://localhost:8080/signup';
END IF;

RAISE NOTICE 'Using user ID: %', current_user_id;

-- =====================================================
-- CLEANUP: Delete existing mock data for this user
-- =====================================================

-- Check if organization exists for this user
SELECT organization_id INTO org_id FROM profiles WHERE id = current_user_id;

IF org_id IS NOT NULL THEN
  RAISE NOTICE 'Cleaning up existing data for organization: %', org_id;
  
  -- Delete in correct order (respecting foreign keys)
  DELETE FROM notifications WHERE user_id = current_user_id;
  DELETE FROM activity_logs WHERE organization_id = org_id;
  DELETE FROM analytics_metrics WHERE organization_id = org_id;
  DELETE FROM analytics_events WHERE organization_id = org_id;
  DELETE FROM event_attendees WHERE event_id IN (SELECT id FROM calendar_events WHERE organization_id = org_id);
  DELETE FROM calendar_events WHERE organization_id = org_id;
  DELETE FROM time_entries WHERE organization_id = org_id;
  DELETE FROM cash_flow_entries WHERE organization_id = org_id;
  DELETE FROM expenses WHERE organization_id = org_id;
  DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = org_id);
  DELETE FROM invoices WHERE organization_id = org_id;
  DELETE FROM customer_contacts WHERE customer_id IN (SELECT id FROM customers WHERE organization_id = org_id);
  DELETE FROM customers WHERE organization_id = org_id;
  DELETE FROM task_comments WHERE task_id IN (SELECT id FROM tasks WHERE organization_id = org_id);
  DELETE FROM tasks WHERE organization_id = org_id;
  DELETE FROM project_members WHERE project_id IN (SELECT id FROM projects WHERE organization_id = org_id);
  DELETE FROM projects WHERE organization_id = org_id;
  DELETE FROM chat_messages WHERE user_id = current_user_id;
  DELETE FROM chat_sessions WHERE user_id = current_user_id;
  
  -- Don't delete the organization, just reuse it
  RAISE NOTICE 'Cleanup completed';
ELSE
  -- Create new organization
  INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status)
  VALUES (uuid_generate_v4(), org_name, 'vea-tech', 'pro', 'active')
  RETURNING id INTO org_id;
  
  RAISE NOTICE 'Created new organization: %', org_id;
END IF;

-- Update user profile with organization
UPDATE profiles 
SET organization_id = org_id, 
    full_name = COALESCE(full_name, 'Demo User'),
    role = 'admin'
WHERE id = current_user_id;

-- =====================================================
-- CREATE PROJECTS
-- =====================================================

INSERT INTO projects (id, organization_id, name, description, status, priority, start_date, end_date, budget, spent, progress, owner_id, color, tags)
VALUES 
  (uuid_generate_v4(), org_id, 'Website Redesign', 'Complete overhaul of company website with modern UI/UX', 'active', 'high', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 50000.00, 32000.00, 65, current_user_id, '#3B82F6', ARRAY['web', 'design', 'frontend']),
  (uuid_generate_v4(), org_id, 'Mobile App Development', 'Native iOS and Android app for customer portal', 'active', 'urgent', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '90 days', 120000.00, 45000.00, 38, current_user_id, '#10B981', ARRAY['mobile', 'ios', 'android']),
  (uuid_generate_v4(), org_id, 'Marketing Campaign Q4', 'Social media and content marketing campaign', 'on_hold', 'medium', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '120 days', 30000.00, 5000.00, 15, current_user_id, '#F59E0B', ARRAY['marketing', 'social-media']);

-- Get project IDs (with LIMIT to avoid errors)
SELECT id INTO STRICT proj1_id FROM projects WHERE organization_id = org_id ORDER BY created_at LIMIT 1;
SELECT id INTO STRICT proj2_id FROM projects WHERE organization_id = org_id ORDER BY created_at OFFSET 1 LIMIT 1;

RAISE NOTICE 'Created 3 projects';

-- =====================================================
-- CREATE TASKS
-- =====================================================

INSERT INTO tasks (organization_id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, actual_hours, tags)
VALUES
  (org_id, proj1_id, 'Design homepage mockups', 'Create wireframes and high-fidelity mockups for homepage', 'done', 'high', current_user_id, current_user_id, CURRENT_DATE - INTERVAL '5 days', 16, 14, ARRAY['design', 'homepage']),
  (org_id, proj1_id, 'Implement responsive navigation', 'Build responsive navigation menu with mobile support', 'in_progress', 'high', current_user_id, current_user_id, CURRENT_DATE + INTERVAL '3 days', 12, 8, ARRAY['frontend', 'responsive']),
  (org_id, proj1_id, 'Setup hosting and deployment', 'Configure CI/CD pipeline and hosting', 'todo', 'medium', current_user_id, current_user_id, CURRENT_DATE + INTERVAL '15 days', 8, 0, ARRAY['devops', 'deployment']),
  (org_id, proj2_id, 'Setup React Native project', 'Initialize React Native project with TypeScript', 'done', 'urgent', current_user_id, current_user_id, CURRENT_DATE - INTERVAL '10 days', 6, 6, ARRAY['mobile', 'setup']),
  (org_id, proj2_id, 'Build authentication flow', 'Implement login, signup, and password reset', 'in_progress', 'urgent', current_user_id, current_user_id, CURRENT_DATE + INTERVAL '2 days', 20, 12, ARRAY['auth', 'security']),
  (org_id, proj2_id, 'Design app UI components', 'Create reusable UI component library', 'todo', 'high', current_user_id, current_user_id, CURRENT_DATE + INTERVAL '10 days', 24, 0, ARRAY['ui', 'components']),
  (org_id, NULL, 'Update company documentation', 'Review and update all technical documentation', 'review', 'low', current_user_id, current_user_id, CURRENT_DATE + INTERVAL '20 days', 10, 8, ARRAY['documentation']),
  (org_id, NULL, 'Client meeting preparation', 'Prepare presentation slides for Q4 review', 'done', 'high', current_user_id, current_user_id, CURRENT_DATE - INTERVAL '2 days', 4, 3, ARRAY['meeting', 'presentation']);

RAISE NOTICE 'Created 8 tasks';

-- =====================================================
-- CREATE CUSTOMERS
-- =====================================================

INSERT INTO customers (id, organization_id, name, email, phone, company, city, state, country, customer_type, status, tags)
VALUES
  (uuid_generate_v4(), org_id, 'Acme Corporation', 'contact@acmecorp.com', '+1-555-0101', 'Acme Corporation', 'San Francisco', 'CA', 'USA', 'business', 'active', ARRAY['enterprise', 'priority']),
  (uuid_generate_v4(), org_id, 'TechStart Inc', 'hello@techstart.io', '+1-555-0202', 'TechStart Inc', 'Austin', 'TX', 'USA', 'business', 'active', ARRAY['startup', 'saas']),
  (uuid_generate_v4(), org_id, 'Global Industries', 'info@globalind.com', '+1-555-0303', 'Global Industries', 'New York', 'NY', 'USA', 'business', 'active', ARRAY['enterprise', 'manufacturing']),
  (uuid_generate_v4(), org_id, 'John Smith', 'john.smith@email.com', '+1-555-0404', NULL, 'Seattle', 'WA', 'USA', 'individual', 'active', ARRAY['freelance']),
  (uuid_generate_v4(), org_id, 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0505', 'Johnson Consulting', 'Boston', 'MA', 'USA', 'business', 'lead', ARRAY['consulting']);

-- Get customer IDs
SELECT id INTO STRICT cust1_id FROM customers WHERE organization_id = org_id ORDER BY created_at LIMIT 1;
SELECT id INTO STRICT cust2_id FROM customers WHERE organization_id = org_id ORDER BY created_at OFFSET 1 LIMIT 1;
SELECT id INTO STRICT cust3_id FROM customers WHERE organization_id = org_id ORDER BY created_at OFFSET 2 LIMIT 1;

RAISE NOTICE 'Created 5 customers';

-- =====================================================
-- CREATE INVOICES
-- =====================================================

INSERT INTO invoices (organization_id, customer_id, project_id, invoice_number, status, issue_date, due_date, paid_date, subtotal, tax_amount, total_amount, currency, payment_method)
VALUES
  (org_id, cust1_id, proj1_id, 'INV-2024-001', 'paid', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days', 15000.00, 1350.00, 16350.00, 'USD', 'Bank Transfer'),
  (org_id, cust1_id, proj1_id, 'INV-2024-002', 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '5 days', 17000.00, 1530.00, 18530.00, 'USD', 'Credit Card'),
  (org_id, cust2_id, proj2_id, 'INV-2024-003', 'sent', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', NULL, 25000.00, 2250.00, 27250.00, 'USD', NULL),
  (org_id, cust3_id, NULL, 'INV-2024-004', 'draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NULL, 8500.00, 765.00, 9265.00, 'USD', NULL),
  (org_id, cust2_id, proj2_id, 'INV-2024-005', 'overdue', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', NULL, 12000.00, 1080.00, 13080.00, 'USD', NULL);

RAISE NOTICE 'Created 5 invoices';

-- =====================================================
-- CREATE EXPENSES
-- =====================================================

INSERT INTO expenses (organization_id, project_id, user_id, category, description, amount, expense_date, payment_method, status, tags)
VALUES
  (org_id, proj1_id, current_user_id, 'Software', 'Adobe Creative Cloud subscription', 52.99, CURRENT_DATE - INTERVAL '5 days', 'Company Card', 'approved', ARRAY['recurring', 'software']),
  (org_id, proj1_id, current_user_id, 'Services', 'Stock photos and assets', 199.00, CURRENT_DATE - INTERVAL '12 days', 'Company Card', 'approved', ARRAY['design', 'assets']),
  (org_id, proj2_id, current_user_id, 'Services', 'Firebase hosting and services', 145.00, CURRENT_DATE - INTERVAL '8 days', 'Company Card', 'approved', ARRAY['hosting', 'cloud']),
  (org_id, NULL, current_user_id, 'Office', 'Office supplies', 87.50, CURRENT_DATE - INTERVAL '3 days', 'Cash', 'pending', ARRAY['office', 'supplies']),
  (org_id, proj1_id, current_user_id, 'Marketing', 'Google Ads campaign', 500.00, CURRENT_DATE - INTERVAL '15 days', 'Company Card', 'approved', ARRAY['marketing', 'ads']);

RAISE NOTICE 'Created 5 expenses';

-- =====================================================
-- CREATE CASH FLOW ENTRIES
-- =====================================================

INSERT INTO cash_flow_entries (organization_id, type, category, description, amount, transaction_date, payment_method, reference_type, status, tags)
VALUES
  (org_id, 'income', 'Invoice Payment', 'Payment from Acme Corporation - INV-2024-001', 16350.00, CURRENT_DATE - INTERVAL '25 days', 'Bank Transfer', 'invoice', 'completed', ARRAY['invoice', 'client-payment']),
  (org_id, 'income', 'Invoice Payment', 'Payment from Acme Corporation - INV-2024-002', 18530.00, CURRENT_DATE - INTERVAL '5 days', 'Credit Card', 'invoice', 'completed', ARRAY['invoice', 'client-payment']),
  (org_id, 'income', 'Consulting', 'Consulting services', 3500.00, CURRENT_DATE - INTERVAL '10 days', 'PayPal', 'other', 'completed', ARRAY['consulting']),
  (org_id, 'income', 'Investment', 'Investor funding', 50000.00, CURRENT_DATE - INTERVAL '45 days', 'Bank Transfer', 'other', 'completed', ARRAY['funding', 'investment']),
  (org_id, 'expense', 'Software', 'Adobe Creative Cloud', 52.99, CURRENT_DATE - INTERVAL '5 days', 'Company Card', 'expense', 'completed', ARRAY['software', 'recurring']),
  (org_id, 'expense', 'Services', 'Stock photos', 199.00, CURRENT_DATE - INTERVAL '12 days', 'Company Card', 'expense', 'completed', ARRAY['design']),
  (org_id, 'expense', 'Services', 'Firebase hosting', 145.00, CURRENT_DATE - INTERVAL '8 days', 'Company Card', 'expense', 'completed', ARRAY['hosting']),
  (org_id, 'expense', 'Marketing', 'Google Ads', 500.00, CURRENT_DATE - INTERVAL '15 days', 'Company Card', 'expense', 'completed', ARRAY['marketing']),
  (org_id, 'expense', 'Payroll', 'Monthly salaries', 15000.00, CURRENT_DATE - INTERVAL '2 days', 'Bank Transfer', 'other', 'completed', ARRAY['payroll', 'salaries']),
  (org_id, 'expense', 'Office', 'Office rent', 2500.00, CURRENT_DATE - INTERVAL '1 days', 'Bank Transfer', 'other', 'completed', ARRAY['office', 'rent']);

RAISE NOTICE 'Created 10 cash flow entries';

-- =====================================================
-- CREATE TIME ENTRIES
-- =====================================================

INSERT INTO time_entries (organization_id, user_id, project_id, description, start_time, end_time, duration, billable, hourly_rate, tags)
VALUES
  (org_id, current_user_id, proj1_id, 'Working on homepage design', CURRENT_DATE - INTERVAL '7 days' + TIME '09:00:00', CURRENT_DATE - INTERVAL '7 days' + TIME '12:30:00', 12600, TRUE, 85.00, ARRAY['design', 'frontend']),
  (org_id, current_user_id, proj1_id, 'Implementing navigation menu', CURRENT_DATE - INTERVAL '6 days' + TIME '09:00:00', CURRENT_DATE - INTERVAL '6 days' + TIME '17:00:00', 28800, TRUE, 85.00, ARRAY['frontend', 'coding']),
  (org_id, current_user_id, proj2_id, 'Mobile app code review', CURRENT_DATE - INTERVAL '5 days' + TIME '14:00:00', CURRENT_DATE - INTERVAL '5 days' + TIME '17:30:00', 12600, TRUE, 95.00, ARRAY['mobile', 'review']),
  (org_id, current_user_id, proj1_id, 'Client meeting and discussion', CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '11:30:00', 5400, TRUE, 85.00, ARRAY['meeting', 'client']),
  (org_id, current_user_id, proj2_id, 'Setting up React Native project', CURRENT_DATE - INTERVAL '2 days' + TIME '09:00:00', CURRENT_DATE - INTERVAL '2 days' + TIME '16:00:00', 25200, TRUE, 95.00, ARRAY['mobile', 'setup']),
  (org_id, current_user_id, NULL, 'Internal team meeting', CURRENT_DATE - INTERVAL '1 days' + TIME '13:00:00', CURRENT_DATE - INTERVAL '1 days' + TIME '14:00:00', 3600, FALSE, 0.00, ARRAY['meeting', 'internal']);

RAISE NOTICE 'Created 6 time entries';

-- =====================================================
-- CREATE CALENDAR EVENTS
-- =====================================================

INSERT INTO calendar_events (organization_id, user_id, title, description, location, event_type, start_time, end_time, project_id, color)
VALUES
  (org_id, current_user_id, 'Weekly Team Standup', 'Monday morning team sync', 'Conference Room A', 'meeting', CURRENT_DATE + INTERVAL '1 days' + TIME '09:00:00', CURRENT_DATE + INTERVAL '1 days' + TIME '09:30:00', NULL, '#3B82F6'),
  (org_id, current_user_id, 'Client Presentation', 'Q4 review presentation with Acme Corp', 'Zoom', 'meeting', CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '15:30:00', proj1_id, '#EF4444'),
  (org_id, current_user_id, 'Project Deadline', 'Website redesign milestone 1 due', NULL, 'deadline', CURRENT_DATE + INTERVAL '5 days' + TIME '17:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '17:00:00', proj1_id, '#F59E0B'),
  (org_id, current_user_id, 'Development Sprint Review', 'Review mobile app progress', 'Conference Room B', 'meeting', CURRENT_DATE + INTERVAL '7 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '7 days' + TIME '11:00:00', proj2_id, '#10B981'),
  (org_id, current_user_id, 'Interview: Frontend Developer', 'Technical interview with candidate', 'Zoom', 'meeting', CURRENT_DATE + INTERVAL '10 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '10 days' + TIME '16:00:00', NULL, '#8B5CF6');

RAISE NOTICE 'Created 5 calendar events';

-- =====================================================
-- CREATE ANALYTICS METRICS
-- =====================================================

INSERT INTO analytics_metrics (organization_id, metric_name, metric_type, value, date)
SELECT 
  org_id,
  'monthly_revenue',
  'gauge',
  (RANDOM() * 20000 + 30000)::DECIMAL(15,2),
  (CURRENT_DATE - (n || ' months')::INTERVAL)::DATE
FROM generate_series(0, 11) n;

INSERT INTO analytics_metrics (organization_id, metric_name, metric_type, value, date)
SELECT 
  org_id,
  'tasks_completed',
  'counter',
  (RANDOM() * 15 + 5)::DECIMAL(15,2),
  (CURRENT_DATE - (n || ' days')::INTERVAL)::DATE
FROM generate_series(0, 29) n;

RAISE NOTICE 'Created analytics metrics';

-- =====================================================
-- CREATE NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, title, message, type, action_url, read)
VALUES
  (current_user_id, 'Payment Received', 'Payment of $18,530.00 received from Acme Corporation', 'success', '/dashboard/finances', TRUE),
  (current_user_id, 'Task Overdue', 'Task "Implement responsive navigation" is now overdue', 'warning', '/dashboard/tasks', FALSE),
  (current_user_id, 'New Project Assigned', 'You have been assigned to "Marketing Campaign Q4"', 'info', '/dashboard/projects', FALSE),
  (current_user_id, 'Invoice Overdue', 'Invoice INV-2024-005 is 15 days overdue', 'error', '/dashboard/finances', FALSE),
  (current_user_id, 'Meeting Reminder', 'Client presentation starting in 1 hour', 'info', '/dashboard/calendar', TRUE);

RAISE NOTICE 'Created 5 notifications';

-- =====================================================
-- SUMMARY
-- =====================================================

RAISE NOTICE '==========================================';
RAISE NOTICE '✅ Mock data inserted successfully!';
RAISE NOTICE 'User ID: %', current_user_id;
RAISE NOTICE 'Organization ID: %', org_id;
RAISE NOTICE '==========================================';
RAISE NOTICE 'Data created:';
RAISE NOTICE '- 3 Projects';
RAISE NOTICE '- 8 Tasks';
RAISE NOTICE '- 5 Customers';
RAISE NOTICE '- 5 Invoices';
RAISE NOTICE '- 5 Expenses';
RAISE NOTICE '- 10 Cash Flow Entries';
RAISE NOTICE '- 6 Time Entries';
RAISE NOTICE '- 5 Calendar Events';
RAISE NOTICE '- 5 Notifications';
RAISE NOTICE '- Analytics Metrics (42 entries)';
RAISE NOTICE '==========================================';
RAISE NOTICE 'Next: Refresh your dashboard at http://localhost:8080/dashboard';
RAISE NOTICE '==========================================';

END $$;



