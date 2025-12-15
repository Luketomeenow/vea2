# Quick Reference Guide

## 🚀 Environment Setup

```bash
# Create .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📦 Common Imports

```typescript
// Authentication
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/supabase';

// Data Fetching
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase';

// API Services
import { 
  projectsApi, 
  tasksApi, 
  customersApi, 
  invoicesApi,
  expensesApi,
  timeTrackingApi,
  calendarApi,
  documentsApi,
  chatApi,
  analyticsApi 
} from '@/services/api';

// Direct Client
import { supabase } from '@/lib/supabase';
```

## 🔐 Authentication

```typescript
// In your component
const { 
  user,           // Current user object
  profile,        // User profile with role & org
  loading,        // Loading state
  signUp,         // Sign up function
  signIn,         // Sign in function
  signOut,        // Sign out function
  isAuthenticated,// Boolean
  isAdmin,        // Boolean
  isManager       // Boolean
} = useAuth();

// Sign up
const { data, error } = await signUp(email, password, fullName);

// Sign in
const { data, error } = await signIn(email, password);

// Sign out
await signOut();
```

## 📊 Data Fetching

```typescript
// Simple query with real-time updates
const { data, loading, error, refetch } = useSupabaseQuery({
  table: 'projects',
  filter: [
    { column: 'organization_id', value: orgId },
    { column: 'status', value: 'active' }
  ],
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
  realtime: true // Enable real-time updates
});

// Mutation (insert/update/delete)
const { insert, update, remove, loading } = useSupabaseMutation({
  table: 'tasks',
  onSuccess: (data) => console.log('Success!', data),
  onError: (error) => console.error('Error:', error)
});

await insert({ title: 'New Task', status: 'todo' });
await update(taskId, { status: 'done' });
await remove(taskId);
```

## 🗂️ Projects API

```typescript
// Get all projects
const { data, error } = await projectsApi.getAll(organizationId);

// Get single project
const { data, error } = await projectsApi.getById(projectId);

// Create project
const { data, error } = await projectsApi.create({
  name: 'New Project',
  organization_id: orgId,
  budget: 50000,
  status: 'active'
});

// Update project
const { data, error } = await projectsApi.update(projectId, {
  status: 'completed',
  progress: 100
});

// Delete project
await projectsApi.delete(projectId);

// Add member
await projectsApi.addMember(projectId, userId, 'member');

// Remove member
await projectsApi.removeMember(projectId, userId);
```

## ✅ Tasks API

```typescript
// Get all tasks
const { data } = await tasksApi.getAll(organizationId, {
  projectId: 'xxx',  // optional filter
  status: 'todo',    // optional filter
  assignedTo: userId // optional filter
});

// Create task
const { data } = await tasksApi.create({
  title: 'Implement feature',
  project_id: projectId,
  assigned_to: userId,
  status: 'todo',
  priority: 'high',
  due_date: '2025-12-31'
});

// Update task
await tasksApi.update(taskId, { status: 'done' });

// Add comment
await tasksApi.addComment(taskId, 'Great work!');
```

## 👥 Customers API

```typescript
// Get all customers
const { data } = await customersApi.getAll(organizationId);

// Create customer
const { data } = await customersApi.create({
  name: 'Acme Corp',
  email: 'contact@acme.com',
  organization_id: orgId,
  customer_type: 'business',
  status: 'active'
});

// Add contact person
await customersApi.addContact(customerId, {
  name: 'John Doe',
  email: 'john@acme.com',
  position: 'CEO',
  is_primary: true
});
```

## 💰 Invoices API

```typescript
// Get all invoices
const { data } = await invoicesApi.getAll(organizationId);

// Create invoice with items
const { data } = await invoicesApi.create(
  {
    customer_id: customerId,
    invoice_number: 'INV-001',
    issue_date: '2025-01-01',
    due_date: '2025-01-31',
    status: 'draft',
    organization_id: orgId
  },
  [
    { description: 'Service 1', quantity: 1, unit_price: 1000, amount: 1000 },
    { description: 'Service 2', quantity: 2, unit_price: 500, amount: 1000 }
  ]
);

// Mark as paid
await invoicesApi.markAsPaid(invoiceId);
```

## 💸 Expenses API

```typescript
// Get all expenses
const { data } = await expensesApi.getAll(organizationId, {
  projectId: 'xxx',  // optional
  status: 'pending'  // optional
});

// Create expense
const { data } = await expensesApi.create({
  category: 'Office Supplies',
  amount: 150.00,
  expense_date: '2025-01-15',
  organization_id: orgId,
  user_id: userId,
  status: 'pending'
});

// Approve expense
await expensesApi.approve(expenseId);

// Reject expense
await expensesApi.reject(expenseId);
```

## ⏱️ Time Tracking API

```typescript
// Start timer
const { data: entry } = await timeTrackingApi.start({
  user_id: userId,
  project_id: projectId,
  task_id: taskId,
  description: 'Working on feature'
});

// Stop timer
await timeTrackingApi.stop(entry.id);

// Get time entries
const { data } = await timeTrackingApi.getAll(userId, {
  projectId: 'xxx',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

## 📅 Calendar API

```typescript
// Get events
const { data } = await calendarApi.getEvents(
  userId,
  '2025-01-01',  // start date
  '2025-01-31'   // end date
);

// Create event
const { data } = await calendarApi.create(
  {
    user_id: userId,
    title: 'Team Meeting',
    start_time: '2025-01-15T10:00:00Z',
    end_time: '2025-01-15T11:00:00Z',
    event_type: 'meeting'
  },
  [userId1, userId2]  // attendees
);

// Update event
await calendarApi.update(eventId, { title: 'New Title' });
```

## 📄 Documents API

```typescript
// Get all documents
const { data } = await documentsApi.getAll(organizationId, {
  projectId: 'xxx',  // optional
  taskId: 'xxx'      // optional
});

// Upload document
const file = event.target.files[0];
const { data } = await documentsApi.upload(file, {
  name: file.name,
  organization_id: orgId,
  project_id: projectId
});

// Share document
await documentsApi.share(documentId, userId, 'view');

// Delete document (soft delete)
await documentsApi.delete(documentId);
```

## 💬 Chat API (AI Assistant)

```typescript
// Get sessions
const { data } = await chatApi.getSessions(userId);

// Create session
const { data: session } = await chatApi.createSession(
  userId, 
  'Marketing Strategy'
);

// Get messages
const { data } = await chatApi.getMessages(sessionId);

// Send message
await chatApi.sendMessage(sessionId, userId, 'Hello AI!', 'user');
await chatApi.sendMessage(sessionId, userId, 'Response', 'assistant');

// Delete session
await chatApi.deleteSession(sessionId);
```

## 📊 Analytics API

```typescript
// Get project stats
const { data } = await analyticsApi.getProjectStats(organizationId);

// Get user productivity
const { data } = await analyticsApi.getUserProductivity(organizationId);

// Get financial overview
const { data } = await analyticsApi.getFinancialOverview(organizationId);

// Get cash flow (last 12 months)
const { data } = await analyticsApi.getCashFlowSummary(organizationId, 12);

// Log custom event
await analyticsApi.logEvent({
  organization_id: orgId,
  user_id: userId,
  event_type: 'user_action',
  event_name: 'button_clicked',
  properties: { button: 'export' }
});
```

## 🔔 Notifications Hook

```typescript
const { 
  notifications,   // Array of notifications
  unreadCount,     // Number of unread
  loading,
  markAsRead,      // Mark single as read
  markAllAsRead,   // Mark all as read
  refetch          // Refresh notifications
} = useNotifications(userId);

// Mark as read
await markAsRead(notificationId);

// Mark all as read
await markAllAsRead();
```

## 💬 Chat Hook

```typescript
const { 
  messages,      // Array of messages
  loading,
  sendMessage,   // Send message function
  refetch        // Refresh messages
} = useChatMessages(sessionId);

// Send message
await sendMessage('Hello!', 'user');
```

## 🔍 Direct Queries

```typescript
// Direct Supabase query
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });

// With joins
const { data, error } = await supabase
  .from('tasks')
  .select(`
    *,
    project:projects(name, color),
    assigned_to_user:profiles!assigned_to(full_name, avatar_url)
  `)
  .eq('status', 'todo');

// Insert
const { data, error } = await supabase
  .from('tasks')
  .insert({ title: 'New Task' })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'done' })
  .eq('id', taskId);

// Delete
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

## 🔄 Real-time Subscriptions

```typescript
// Subscribe to table changes
const channel = supabase
  .channel('tasks_changes')
  .on(
    'postgres_changes',
    {
      event: '*',              // or 'INSERT', 'UPDATE', 'DELETE'
      schema: 'public',
      table: 'tasks',
      filter: 'project_id=eq.xxx' // optional
    },
    (payload) => {
      console.log('Change:', payload);
      // Update your UI
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## 🎨 Status & Priority Values

```typescript
// Project Status
'active' | 'on_hold' | 'completed' | 'cancelled'

// Task Status
'todo' | 'in_progress' | 'review' | 'done' | 'blocked'

// Priority
'low' | 'medium' | 'high' | 'urgent'

// Invoice Status
'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

// Expense Status
'pending' | 'approved' | 'rejected' | 'reimbursed'

// User Roles
'user' | 'admin' | 'manager'

// Document Status
'active' | 'archived' | 'deleted'
```

## 🔍 Common Filters

```typescript
// Organization filter (most important!)
.eq('organization_id', orgId)

// Status filter
.eq('status', 'active')

// Date range
.gte('created_at', '2025-01-01')
.lte('created_at', '2025-12-31')

// Multiple conditions
.or('status.eq.active,status.eq.pending')

// Search
.ilike('name', '%search%')

// Order & limit
.order('created_at', { ascending: false })
.limit(10)
```

## 🎯 Error Handling

```typescript
const { data, error } = await projectsApi.create({ ... });

if (error) {
  console.error('Error:', error);
  // Show error to user
  return;
}

// Success - use data
console.log('Created:', data);
```

## 📁 Table Names Reference

```typescript
'profiles'
'organizations'
'chat_sessions'
'chat_messages'
'projects'
'project_members'
'tasks'
'task_comments'
'customers'
'customer_contacts'
'invoices'
'invoice_items'
'expenses'
'cash_flow_entries'
'time_entries'
'calendar_events'
'event_attendees'
'documents'
'document_versions'
'document_shares'
'analytics_events'
'analytics_metrics'
'notifications'
'activity_logs'
```

## 📊 View Names

```typescript
'project_statistics'
'user_productivity'
'financial_overview'
'cash_flow_summary'
'task_analytics'
```

## 🚨 Common Issues

### Issue: RLS Policy Violation
**Solution:** Make sure user is authenticated and has `organization_id` in profile

### Issue: Foreign Key Constraint
**Solution:** Ensure referenced record exists (e.g., project exists before creating task)

### Issue: Real-time not working
**Solution:** Check that RLS policies allow SELECT on the table

### Issue: Can't upload documents
**Solution:** Verify storage bucket exists and policies are set

---

## 📚 More Help

- **SETUP_DATABASE.md** - Initial setup
- **DATABASE_SCHEMA.md** - Complete schema
- **IMPLEMENTATION_SUMMARY.md** - Feature overview
- **PROJECT_STRUCTURE.md** - File structure

---

**Keep this file open while coding! 🚀**























