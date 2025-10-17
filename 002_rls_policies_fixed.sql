-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FIXED VERSION
-- This version drops existing policies first
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING POLICIES FIRST
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view organization profiles" ON profiles;

-- Organizations policies
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update organization" ON organizations;
DROP POLICY IF EXISTS "Admins can insert organization" ON organizations;

-- Chat policies
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;

-- Project policies
DROP POLICY IF EXISTS "Users can view organization projects" ON projects;
DROP POLICY IF EXISTS "Users can insert projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- Task policies
DROP POLICY IF EXISTS "Users can view organization tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Task creators can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can insert task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON task_comments;

-- Customer policies
DROP POLICY IF EXISTS "Users can view organization customers" ON customers;
DROP POLICY IF EXISTS "Users can manage customers" ON customers;
DROP POLICY IF EXISTS "Users can view customer contacts" ON customer_contacts;
DROP POLICY IF EXISTS "Users can manage customer contacts" ON customer_contacts;

-- Invoice policies
DROP POLICY IF EXISTS "Users can view organization invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can manage invoice items" ON invoice_items;

-- Expense policies
DROP POLICY IF EXISTS "Users can view organization expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;

-- Cash flow policies
DROP POLICY IF EXISTS "Users can view organization cash flow" ON cash_flow_entries;
DROP POLICY IF EXISTS "Users can manage cash flow" ON cash_flow_entries;

-- Time entry policies
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view project time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can manage own time entries" ON time_entries;

-- Calendar policies
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view events they're invited to" ON calendar_events;
DROP POLICY IF EXISTS "Users can manage own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view event attendees" ON event_attendees;
DROP POLICY IF EXISTS "Event owners can manage attendees" ON event_attendees;

-- Document policies
DROP POLICY IF EXISTS "Users can view organization documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Document owners can update documents" ON documents;
DROP POLICY IF EXISTS "Document owners can delete documents" ON documents;
DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can view document shares" ON document_shares;
DROP POLICY IF EXISTS "Document owners can manage shares" ON document_shares;

-- Analytics policies
DROP POLICY IF EXISTS "Users can view organization analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view analytics metrics" ON analytics_metrics;

-- Notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Activity log policies
DROP POLICY IF EXISTS "Users can view organization activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs" ON activity_logs;

-- =====================================================
-- NOW CREATE ALL POLICIES
-- =====================================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view organization profiles"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert organization"
  ON organizations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CHAT SESSIONS & MESSAGES POLICIES
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- PROJECTS POLICIES
CREATE POLICY "Users can view organization projects"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());

-- PROJECT MEMBERS POLICIES
CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can manage members"
  ON project_members FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- TASKS POLICIES
CREATE POLICY "Users can view organization tasks"
  ON tasks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tasks"
  ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid() OR 
    created_by = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Task creators can delete tasks"
  ON tasks FOR DELETE
  USING (created_by = auth.uid());

-- TASK COMMENTS POLICIES
CREATE POLICY "Users can view task comments"
  ON task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE
  USING (user_id = auth.uid());

-- CUSTOMERS POLICIES
CREATE POLICY "Users can view organization customers"
  ON customers FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage customers"
  ON customers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- CUSTOMER CONTACTS POLICIES
CREATE POLICY "Users can view customer contacts"
  ON customer_contacts FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage customer contacts"
  ON customer_contacts FOR ALL
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- INVOICES & EXPENSES POLICIES
CREATE POLICY "Users can view organization invoices"
  ON invoices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage invoices"
  ON invoices FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage invoice items"
  ON invoice_items FOR ALL
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view organization expenses"
  ON expenses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- CASH FLOW POLICIES
CREATE POLICY "Users can view organization cash flow"
  ON cash_flow_entries FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage cash flow"
  ON cash_flow_entries FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- TIME ENTRIES POLICIES
CREATE POLICY "Users can view own time entries"
  ON time_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view project time entries"
  ON time_entries FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own time entries"
  ON time_entries FOR ALL
  USING (user_id = auth.uid());

-- CALENDAR POLICIES
CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view events they're invited to"
  ON calendar_events FOR SELECT
  USING (
    id IN (
      SELECT event_id FROM event_attendees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own calendar events"
  ON calendar_events FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view event attendees"
  ON event_attendees FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM calendar_events WHERE user_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Event owners can manage attendees"
  ON event_attendees FOR ALL
  USING (
    event_id IN (
      SELECT id FROM calendar_events WHERE user_id = auth.uid()
    )
  );

-- DOCUMENTS POLICIES
CREATE POLICY "Users can view organization documents"
  ON documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) OR
    id IN (
      SELECT document_id FROM document_shares WHERE shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

CREATE POLICY "Document owners can update documents"
  ON documents FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Document owners can delete documents"
  ON documents FOR DELETE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view document shares"
  ON document_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid() OR
    document_id IN (
      SELECT id FROM documents WHERE uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Document owners can manage shares"
  ON document_shares FOR ALL
  USING (
    document_id IN (
      SELECT id FROM documents WHERE uploaded_by = auth.uid()
    )
  );

-- ANALYTICS POLICIES
CREATE POLICY "Users can view organization analytics"
  ON analytics_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view analytics metrics"
  ON analytics_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Users can view organization activity logs"
  ON activity_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies created successfully!';
  RAISE NOTICE '🔒 Security enabled on 24 tables';
  RAISE NOTICE 'Next step: Run functions & triggers migration (003_functions_and_triggers.sql)';
END $$;





