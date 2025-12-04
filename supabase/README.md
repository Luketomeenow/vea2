# Supabase Database Setup

This directory contains all the database migrations and configuration for the VEA Dashboard application.

## Overview

The database schema supports:
- ✅ User authentication and profiles
- ✅ Organizations/Multi-tenancy
- ✅ AI Assistant with chat memory per user
- ✅ Projects and Tasks management
- ✅ Customer relationship management (CRM)
- ✅ Financial management (Invoices, Expenses)
- ✅ Cash flow tracking
- ✅ Time tracking
- ✅ Calendar and events
- ✅ Document management
- ✅ Analytics and activity logs
- ✅ Notifications

## Database Structure

### Core Tables

#### Authentication & Users
- `profiles` - Extended user profiles (linked to auth.users)
- `organizations` - Multi-tenant organizations
- `notifications` - User notifications

#### AI Assistant
- `chat_sessions` - Chat conversation sessions per user
- `chat_messages` - Individual messages in chat sessions

#### Project Management
- `projects` - Projects with budget tracking
- `project_members` - Many-to-many relationship for team members
- `tasks` - Tasks with status, priority, and time tracking
- `task_comments` - Comments on tasks

#### Business Tools
- `customers` - Customer/client information
- `customer_contacts` - Contact persons for business customers
- `invoices` - Invoice management
- `invoice_items` - Line items for invoices
- `expenses` - Expense tracking
- `cash_flow_entries` - Cash flow records
- `time_entries` - Time tracking entries
- `calendar_events` - Calendar events and meetings
- `event_attendees` - Event participants
- `documents` - Document storage metadata
- `document_versions` - Version control for documents
- `document_shares` - Document sharing permissions

#### Analytics
- `analytics_events` - Track user actions and events
- `analytics_metrics` - Pre-aggregated metrics
- `activity_logs` - System-wide activity logging

### Views

- `project_statistics` - Aggregated project metrics
- `user_productivity` - User productivity metrics
- `financial_overview` - Financial summary per organization
- `cash_flow_summary` - Monthly cash flow aggregation
- `task_analytics` - Task completion analytics

### Functions

- `update_updated_at_column()` - Auto-update timestamp trigger
- `calculate_invoice_total()` - Auto-calculate invoice totals
- `calculate_time_entry_duration()` - Calculate time duration
- `update_task_hours()` - Update task hours from time entries
- `update_project_spent()` - Update project expenses
- `create_activity_log()` - Log user activities
- `create_notification()` - Create user notifications
- `handle_new_user()` - Handle new user signup

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings under **Settings → API**.

### 3. Run Migrations

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Push migrations:
```bash
supabase db push
```

#### Option B: Manual Migration via Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_and_triggers.sql`
   - `004_seed_data.sql` (optional)

### 4. Configure Storage (for Documents)

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `documents`
3. Set the bucket to **Private**
4. Add storage policies:

```sql
-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to view documents in their organization
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow document owners to delete
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access data within their organization
- Project members can only see projects they're part of
- Users can manage their own data (tasks, time entries, etc.)
- Admins have elevated permissions within their organization

## Data Relationships

```
organizations
    ├── profiles (users)
    ├── projects
    │   ├── project_members
    │   ├── tasks
    │   ├── time_entries
    │   └── documents
    ├── customers
    │   ├── customer_contacts
    │   └── invoices
    ├── expenses
    ├── cash_flow_entries
    └── analytics_events

profiles (users)
    ├── chat_sessions
    │   └── chat_messages
    ├── tasks (assigned)
    ├── time_entries
    ├── calendar_events
    ├── notifications
    └── documents (uploaded)
```

## Usage Examples

### Query Projects

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    owner:profiles!owner_id(full_name),
    project_members(
      user:profiles(full_name, email)
    )
  `)
  .eq('status', 'active');
```

### Create Task

```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Implement feature',
    description: 'Add new dashboard widget',
    status: 'todo',
    priority: 'high',
    project_id: 'project-uuid',
    assigned_to: 'user-uuid'
  })
  .select();
```

### Track Time

```typescript
const { data, error } = await supabase
  .from('time_entries')
  .insert({
    project_id: 'project-uuid',
    task_id: 'task-uuid',
    start_time: new Date().toISOString(),
    description: 'Working on feature'
  })
  .select();

// Later, to end the time entry
await supabase
  .from('time_entries')
  .update({ end_time: new Date().toISOString() })
  .eq('id', 'time-entry-uuid');
```

### Get Chat History

```typescript
const { data: session, error } = await supabase
  .from('chat_sessions')
  .select(`
    *,
    chat_messages(*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

## Real-time Subscriptions

Subscribe to changes in real-time:

```typescript
const subscription = supabase
  .channel('tasks_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
    },
    (payload) => {
      console.log('Task changed:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Analytics Queries

### Get Project Statistics

```typescript
const { data, error } = await supabase
  .from('project_statistics')
  .select('*')
  .eq('organization_id', orgId);
```

### Get Financial Overview

```typescript
const { data, error } = await supabase
  .from('financial_overview')
  .select('*')
  .eq('organization_id', orgId)
  .single();
```

## Maintenance

### Backup

Regular backups are handled by Supabase automatically. You can also create manual backups:

```bash
supabase db dump -f backup.sql
```

### Monitoring

Monitor database performance in the Supabase Dashboard under **Database → Query Performance**.

## Security Best Practices

1. ✅ Never expose your `service_role` key in client code
2. ✅ Always use the `anon` key for client-side operations
3. ✅ RLS policies are enabled on all tables
4. ✅ Use environment variables for sensitive data
5. ✅ Validate user input before database operations
6. ✅ Regularly review and update RLS policies
7. ✅ Monitor for unusual activity in logs

## Troubleshooting

### Common Issues

1. **RLS Blocking Queries**: Make sure user is authenticated and has proper organization_id
2. **Missing Data**: Check if RLS policies allow access
3. **Foreign Key Errors**: Ensure referenced records exist
4. **Trigger Errors**: Check function definitions in migration 003

### Debug Queries

```sql
-- Check user's organization
SELECT organization_id FROM profiles WHERE id = auth.uid();

-- Test RLS policy
SET ROLE authenticated;
SELECT * FROM projects;
```

## Migration History

- `001_initial_schema.sql` - Core database structure
- `002_rls_policies.sql` - Row Level Security policies
- `003_functions_and_triggers.sql` - Database functions and triggers
- `004_seed_data.sql` - Sample/seed data (optional)

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review RLS policies in migration files
3. Check Supabase logs in dashboard
4. Verify environment variables are set correctly


















