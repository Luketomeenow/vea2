-- =====================================================
-- SEED DATA (FOR DEVELOPMENT/TESTING)
-- =====================================================

-- Note: This seed data is for development purposes only
-- You should remove or modify this for production

-- Insert sample organization
INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org', 'pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert expense categories (as reference data)
-- You might want to store these in a separate categories table

-- Insert sample project statuses and priorities
-- These are already defined in CHECK constraints, but you might want to document them

-- Insert sample calendar event types
-- These are already defined in CHECK constraints

-- =====================================================
-- SAMPLE DATA FOR DEMO (OPTIONAL - REMOVE IN PRODUCTION)
-- =====================================================

-- Note: You'll need to create actual users via Supabase Auth first
-- Then you can insert sample data linked to those user IDs

-- Example: Insert sample project (uncomment and modify user IDs)
-- INSERT INTO projects (organization_id, name, description, status, priority, budget, owner_id)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'Website Redesign',
--   'Redesign company website with modern UI/UX',
--   'active',
--   'high',
--   50000.00,
--   'YOUR_USER_ID_HERE'
-- );

-- =====================================================
-- REFERENCE DATA
-- =====================================================

-- Common expense categories (you might want to make this customizable per organization)
COMMENT ON COLUMN expenses.category IS 'Common categories: Office Supplies, Travel, Software, Marketing, Utilities, Payroll, Equipment, Professional Services, etc.';

-- Common invoice payment methods
COMMENT ON COLUMN invoices.payment_method IS 'Common methods: Bank Transfer, Credit Card, PayPal, Check, Cash, Cryptocurrency, etc.';

-- Common document types
COMMENT ON COLUMN documents.file_type IS 'MIME types: application/pdf, image/jpeg, image/png, application/msword, application/vnd.ms-excel, etc.';

-- Time zones reference
COMMENT ON COLUMN profiles.timezone IS 'Use IANA timezone format: America/New_York, Europe/London, Asia/Tokyo, etc.';

-- Currency codes
COMMENT ON COLUMN invoices.currency IS 'Use ISO 4217 currency codes: USD, EUR, GBP, JPY, etc.';

















