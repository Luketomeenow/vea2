-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice total
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(15, 2);
BEGIN
  SELECT 
    COALESCE(SUM(amount), 0) 
  INTO total 
  FROM invoice_items 
  WHERE invoice_id = NEW.invoice_id;
  
  UPDATE invoices 
  SET 
    subtotal = total,
    total_amount = total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate time entry duration
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update task actual hours from time entries
CREATE OR REPLACE FUNCTION update_task_hours()
RETURNS TRIGGER AS $$
DECLARE
  total_hours DECIMAL(5, 2);
BEGIN
  IF NEW.task_id IS NOT NULL THEN
    SELECT 
      COALESCE(SUM(duration), 0) / 3600.0
    INTO total_hours
    FROM time_entries
    WHERE task_id = NEW.task_id;
    
    UPDATE tasks
    SET actual_hours = total_hours
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update project spent amount
CREATE OR REPLACE FUNCTION update_project_spent()
RETURNS TRIGGER AS $$
DECLARE
  total_spent DECIMAL(15, 2);
BEGIN
  SELECT 
    COALESCE(SUM(amount), 0)
  INTO total_spent
  FROM expenses
  WHERE project_id = NEW.project_id AND status = 'approved';
  
  UPDATE projects
  SET spent = total_spent
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create activity log
CREATE OR REPLACE FUNCTION create_activity_log()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  action_text TEXT;
  entity_type_text TEXT;
BEGIN
  -- Determine organization_id based on table
  CASE TG_TABLE_NAME
    WHEN 'projects' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'project';
    WHEN 'tasks' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'task';
    WHEN 'customers' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'customer';
    WHEN 'invoices' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'invoice';
    WHEN 'expenses' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'expense';
    WHEN 'documents' THEN 
      org_id := NEW.organization_id;
      entity_type_text := 'document';
    ELSE 
      RETURN NEW;
  END CASE;

  -- Determine action
  CASE TG_OP
    WHEN 'INSERT' THEN action_text := 'created';
    WHEN 'UPDATE' THEN action_text := 'updated';
    WHEN 'DELETE' THEN action_text := 'deleted';
  END CASE;

  -- Insert activity log
  INSERT INTO activity_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    description
  ) VALUES (
    org_id,
    auth.uid(),
    action_text,
    entity_type_text,
    COALESCE(NEW.id, OLD.id),
    format('%s %s', action_text, entity_type_text)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    action_url
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_action_url
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify task assignment
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    PERFORM create_notification(
      NEW.assigned_to,
      'New Task Assignment',
      format('You have been assigned to task: %s', NEW.title),
      'info',
      format('/tasks?id=%s', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify project member addition
CREATE OR REPLACE FUNCTION notify_project_member()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  SELECT name INTO project_name FROM projects WHERE id = NEW.project_id;
  
  PERFORM create_notification(
    NEW.user_id,
    'Added to Project',
    format('You have been added to project: %s', project_name),
    'info',
    format('/projects?id=%s', NEW.project_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_entries_updated_at BEFORE UPDATE ON cash_flow_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoice calculation triggers
CREATE TRIGGER calculate_invoice_total_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_total();

-- Time entry duration trigger
CREATE TRIGGER calculate_time_entry_duration_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- Update task hours trigger
CREATE TRIGGER update_task_hours_trigger
  AFTER INSERT OR UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_task_hours();

-- Update project spent trigger
CREATE TRIGGER update_project_spent_trigger
  AFTER INSERT OR UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_project_spent();

-- Activity log triggers
CREATE TRIGGER log_project_activity
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER log_task_activity
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER log_customer_activity
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER log_invoice_activity
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER log_expense_activity
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

CREATE TRIGGER log_document_activity
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION create_activity_log();

-- Notification triggers
CREATE TRIGGER notify_task_assignment_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

CREATE TRIGGER notify_project_member_trigger
  AFTER INSERT ON project_members
  FOR EACH ROW EXECUTE FUNCTION notify_project_member();

-- Handle new user signup trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for project statistics
CREATE OR REPLACE VIEW project_statistics AS
SELECT 
  p.id,
  p.name,
  p.organization_id,
  p.status,
  p.budget,
  p.spent,
  p.progress,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT pm.user_id) as team_members,
  COALESCE(SUM(te.duration) / 3600.0, 0) as total_hours
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN time_entries te ON te.project_id = p.id
GROUP BY p.id, p.name, p.organization_id, p.status, p.budget, p.spent, p.progress;

-- View for user productivity
CREATE OR REPLACE VIEW user_productivity AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.organization_id,
  COUNT(DISTINCT t.id) as assigned_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
  COALESCE(SUM(te.duration) / 3600.0, 0) as total_hours,
  COUNT(DISTINCT te.project_id) as projects_worked_on
FROM profiles p
LEFT JOIN tasks t ON t.assigned_to = p.id
LEFT JOIN time_entries te ON te.user_id = p.id
GROUP BY p.id, p.full_name, p.organization_id;

-- View for financial overview
CREATE OR REPLACE VIEW financial_overview AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN i.total_amount END), 0) as outstanding_invoices,
  COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount END), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount END), 0) - 
    COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount END), 0) as net_profit
FROM organizations o
LEFT JOIN invoices i ON i.organization_id = o.id
LEFT JOIN expenses e ON e.organization_id = o.id
GROUP BY o.id, o.name;

-- View for cash flow summary
CREATE OR REPLACE VIEW cash_flow_summary AS
SELECT 
  organization_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_flow
FROM cash_flow_entries
WHERE status = 'completed'
GROUP BY organization_id, DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- View for task analytics
CREATE OR REPLACE VIEW task_analytics AS
SELECT 
  t.organization_id,
  t.project_id,
  t.status,
  t.priority,
  COUNT(*) as task_count,
  AVG(t.actual_hours) as avg_hours,
  AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 86400.0) as avg_completion_days
FROM tasks t
WHERE t.completed_at IS NOT NULL
GROUP BY t.organization_id, t.project_id, t.status, t.priority;


