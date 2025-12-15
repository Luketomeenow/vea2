# Database Schema Reference

Complete reference for all database tables, relationships, and features.

## Table of Contents
- [Core Tables](#core-tables)
- [AI Assistant](#ai-assistant)
- [Project Management](#project-management)
- [Business Tools](#business-tools)
- [Analytics](#analytics)
- [System Tables](#system-tables)
- [Database Views](#database-views)
- [Relationships Diagram](#relationships-diagram)

---

## Core Tables

### `profiles`
Extended user profiles linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (references auth.users) |
| `email` | TEXT | User email (unique) |
| `full_name` | TEXT | User's full name |
| `avatar_url` | TEXT | Profile picture URL |
| `role` | TEXT | User role: 'user', 'admin', 'manager' |
| `organization_id` | UUID | Foreign key to organizations |
| `phone` | TEXT | Phone number |
| `timezone` | TEXT | User timezone (IANA format) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `email`
- Foreign key to `organizations(id)`

---

### `organizations`
Multi-tenant organizations for data isolation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Organization name |
| `slug` | TEXT | URL-friendly slug (unique) |
| `logo_url` | TEXT | Logo image URL |
| `subscription_tier` | TEXT | 'free', 'pro', 'enterprise' |
| `subscription_status` | TEXT | 'active', 'cancelled', 'expired' |
| `settings` | JSONB | Custom settings object |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `slug`

---

## AI Assistant

### `chat_sessions`
Chat conversation sessions per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to profiles |
| `title` | TEXT | Session title |
| `context` | JSONB | Session context/metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id`

---

### `chat_messages`
Individual messages within chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to chat_sessions |
| `user_id` | UUID | Foreign key to profiles |
| `role` | TEXT | 'user', 'assistant', 'system' |
| `content` | TEXT | Message content |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `session_id`
- Index on `user_id`

---

## Project Management

### `projects`
Project information with budget tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `name` | TEXT | Project name |
| `description` | TEXT | Project description |
| `status` | TEXT | 'active', 'on_hold', 'completed', 'cancelled' |
| `priority` | TEXT | 'low', 'medium', 'high', 'urgent' |
| `start_date` | DATE | Project start date |
| `end_date` | DATE | Project end date |
| `budget` | DECIMAL(15,2) | Project budget |
| `spent` | DECIMAL(15,2) | Amount spent (auto-calculated) |
| `progress` | INTEGER | Progress percentage (0-100) |
| `owner_id` | UUID | Foreign key to profiles |
| `color` | TEXT | Display color (hex code) |
| `tags` | TEXT[] | Array of tags |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `owner_id`

---

### `project_members`
Many-to-many relationship for project team members.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `user_id` | UUID | Foreign key to profiles |
| `role` | TEXT | 'owner', 'manager', 'member', 'viewer' |
| `joined_at` | TIMESTAMPTZ | Join timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `(project_id, user_id)`
- Index on `project_id`
- Index on `user_id`

---

### `tasks`
Task management with time tracking integration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `project_id` | UUID | Foreign key to projects |
| `title` | TEXT | Task title |
| `description` | TEXT | Task description |
| `status` | TEXT | 'todo', 'in_progress', 'review', 'done', 'blocked' |
| `priority` | TEXT | 'low', 'medium', 'high', 'urgent' |
| `assigned_to` | UUID | Foreign key to profiles |
| `created_by` | UUID | Foreign key to profiles |
| `due_date` | TIMESTAMPTZ | Due date |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |
| `estimated_hours` | DECIMAL(5,2) | Estimated hours |
| `actual_hours` | DECIMAL(5,2) | Actual hours (auto-calculated) |
| `parent_task_id` | UUID | Foreign key to tasks (for subtasks) |
| `order_index` | INTEGER | Display order |
| `tags` | TEXT[] | Array of tags |
| `attachments` | JSONB | File attachments metadata |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `project_id`
- Index on `assigned_to`
- Index on `status`

---

### `task_comments`
Comments on tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `task_id` | UUID | Foreign key to tasks |
| `user_id` | UUID | Foreign key to profiles |
| `comment` | TEXT | Comment content |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `task_id`

---

## Business Tools

### `customers`
Customer/Client information (CRM).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `name` | TEXT | Customer name |
| `email` | TEXT | Email address |
| `phone` | TEXT | Phone number |
| `company` | TEXT | Company name |
| `address` | TEXT | Street address |
| `city` | TEXT | City |
| `state` | TEXT | State/Province |
| `postal_code` | TEXT | Postal/ZIP code |
| `country` | TEXT | Country |
| `website` | TEXT | Website URL |
| `tax_id` | TEXT | Tax ID/VAT number |
| `customer_type` | TEXT | 'individual', 'business' |
| `status` | TEXT | 'active', 'inactive', 'lead', 'prospect' |
| `notes` | TEXT | Additional notes |
| `tags` | TEXT[] | Array of tags |
| `custom_fields` | JSONB | Custom fields |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`

---

### `customer_contacts`
Contact persons for business customers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_id` | UUID | Foreign key to customers |
| `name` | TEXT | Contact name |
| `email` | TEXT | Email address |
| `phone` | TEXT | Phone number |
| `position` | TEXT | Job position |
| `is_primary` | BOOLEAN | Primary contact flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `customer_id`

---

### `invoices`
Invoice management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `customer_id` | UUID | Foreign key to customers |
| `project_id` | UUID | Foreign key to projects |
| `invoice_number` | TEXT | Invoice number (unique) |
| `status` | TEXT | 'draft', 'sent', 'paid', 'overdue', 'cancelled' |
| `issue_date` | DATE | Issue date |
| `due_date` | DATE | Due date |
| `paid_date` | DATE | Payment date |
| `subtotal` | DECIMAL(15,2) | Subtotal amount |
| `tax_amount` | DECIMAL(15,2) | Tax amount |
| `discount_amount` | DECIMAL(15,2) | Discount amount |
| `total_amount` | DECIMAL(15,2) | Total amount (auto-calculated) |
| `currency` | TEXT | Currency code (ISO 4217) |
| `notes` | TEXT | Invoice notes |
| `terms` | TEXT | Payment terms |
| `payment_method` | TEXT | Payment method |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `invoice_number`
- Index on `organization_id`
- Index on `customer_id`
- Index on `status`

---

### `invoice_items`
Line items for invoices.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `invoice_id` | UUID | Foreign key to invoices |
| `description` | TEXT | Item description |
| `quantity` | DECIMAL(10,2) | Quantity |
| `unit_price` | DECIMAL(15,2) | Price per unit |
| `tax_rate` | DECIMAL(5,2) | Tax rate percentage |
| `amount` | DECIMAL(15,2) | Total amount |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `invoice_id`

**Triggers:**
- Auto-calculates invoice totals on insert/update/delete

---

### `expenses`
Expense tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `project_id` | UUID | Foreign key to projects |
| `user_id` | UUID | Foreign key to profiles |
| `category` | TEXT | Expense category |
| `description` | TEXT | Expense description |
| `amount` | DECIMAL(15,2) | Expense amount |
| `currency` | TEXT | Currency code |
| `expense_date` | DATE | Expense date |
| `payment_method` | TEXT | Payment method |
| `receipt_url` | TEXT | Receipt image URL |
| `status` | TEXT | 'pending', 'approved', 'rejected', 'reimbursed' |
| `tags` | TEXT[] | Array of tags |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `project_id`

**Triggers:**
- Auto-updates project spent amount on approval

---

### `cash_flow_entries`
Cash flow tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `type` | TEXT | 'income', 'expense' |
| `category` | TEXT | Transaction category |
| `description` | TEXT | Description |
| `amount` | DECIMAL(15,2) | Amount |
| `currency` | TEXT | Currency code |
| `transaction_date` | DATE | Transaction date |
| `payment_method` | TEXT | Payment method |
| `reference_id` | UUID | Reference to invoice/expense |
| `reference_type` | TEXT | 'invoice', 'expense', 'other' |
| `account` | TEXT | Bank account |
| `status` | TEXT | 'pending', 'completed', 'cancelled' |
| `tags` | TEXT[] | Array of tags |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `transaction_date`
- Index on `type`

---

### `time_entries`
Time tracking entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `user_id` | UUID | Foreign key to profiles |
| `project_id` | UUID | Foreign key to projects |
| `task_id` | UUID | Foreign key to tasks |
| `description` | TEXT | Time entry description |
| `start_time` | TIMESTAMPTZ | Start time |
| `end_time` | TIMESTAMPTZ | End time |
| `duration` | INTEGER | Duration in seconds (auto-calculated) |
| `billable` | BOOLEAN | Billable flag |
| `hourly_rate` | DECIMAL(10,2) | Hourly rate |
| `tags` | TEXT[] | Array of tags |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `project_id`
- Index on `task_id`
- Index on `start_time`

**Triggers:**
- Auto-calculates duration from start_time and end_time
- Updates task actual_hours

---

### `calendar_events`
Calendar events and meetings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `user_id` | UUID | Foreign key to profiles |
| `title` | TEXT | Event title |
| `description` | TEXT | Event description |
| `location` | TEXT | Event location |
| `event_type` | TEXT | 'meeting', 'task', 'reminder', 'deadline', 'other' |
| `start_time` | TIMESTAMPTZ | Start time |
| `end_time` | TIMESTAMPTZ | End time |
| `all_day` | BOOLEAN | All-day event flag |
| `recurrence_rule` | TEXT | iCal RRULE for recurring events |
| `project_id` | UUID | Foreign key to projects |
| `task_id` | UUID | Foreign key to tasks |
| `color` | TEXT | Display color |
| `reminder_minutes` | INTEGER | Reminder before event (minutes) |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `organization_id`
- Index on `start_time`

---

### `event_attendees`
Event participants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Foreign key to calendar_events |
| `user_id` | UUID | Foreign key to profiles |
| `email` | TEXT | Email for external attendees |
| `status` | TEXT | 'pending', 'accepted', 'declined', 'tentative' |

**Indexes:**
- Primary key on `id`
- Unique on `(event_id, user_id)`
- Index on `event_id`

---

### `documents`
Document metadata and storage references.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `uploaded_by` | UUID | Foreign key to profiles |
| `project_id` | UUID | Foreign key to projects |
| `task_id` | UUID | Foreign key to tasks |
| `customer_id` | UUID | Foreign key to customers |
| `name` | TEXT | Document name |
| `description` | TEXT | Document description |
| `file_type` | TEXT | MIME type |
| `file_size` | BIGINT | File size in bytes |
| `file_url` | TEXT | Public URL |
| `storage_path` | TEXT | Storage path |
| `folder_path` | TEXT | Virtual folder path |
| `version` | INTEGER | Version number |
| `status` | TEXT | 'active', 'archived', 'deleted' |
| `tags` | TEXT[] | Array of tags |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `project_id`
- Index on `uploaded_by`

---

### `document_versions`
Document version control.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `document_id` | UUID | Foreign key to documents |
| `version_number` | INTEGER | Version number |
| `file_url` | TEXT | Version file URL |
| `storage_path` | TEXT | Version storage path |
| `uploaded_by` | UUID | Foreign key to profiles |
| `change_notes` | TEXT | Version notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `(document_id, version_number)`
- Index on `document_id`

---

### `document_shares`
Document sharing permissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `document_id` | UUID | Foreign key to documents |
| `shared_with_user_id` | UUID | Foreign key to profiles |
| `permission` | TEXT | 'view', 'edit', 'admin' |
| `shared_by` | UUID | Foreign key to profiles |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique on `(document_id, shared_with_user_id)`
- Index on `document_id`

---

## Analytics

### `analytics_events`
Event tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `user_id` | UUID | Foreign key to profiles |
| `event_type` | TEXT | Event type/category |
| `event_name` | TEXT | Event name |
| `properties` | JSONB | Event properties |
| `session_id` | TEXT | Session identifier |
| `ip_address` | TEXT | IP address |
| `user_agent` | TEXT | User agent string |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `user_id`
- Index on `created_at`

---

### `analytics_metrics`
Pre-aggregated metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `metric_name` | TEXT | Metric name |
| `metric_type` | TEXT | 'counter', 'gauge', 'histogram' |
| `value` | DECIMAL(15,2) | Metric value |
| `dimensions` | JSONB | Metric dimensions/tags |
| `date` | DATE | Date for the metric |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `date`

---

## System Tables

### `notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to profiles |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification message |
| `type` | TEXT | 'info', 'success', 'warning', 'error' |
| `action_url` | TEXT | Action URL (optional) |
| `read` | BOOLEAN | Read status |
| `metadata` | JSONB | Custom metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `read`
- Index on `created_at`

---

### `activity_logs`
System-wide activity logging.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | Foreign key to organizations |
| `user_id` | UUID | Foreign key to profiles |
| `action` | TEXT | Action performed |
| `entity_type` | TEXT | Entity type (table name) |
| `entity_id` | UUID | Entity ID |
| `description` | TEXT | Action description |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `organization_id`
- Index on `user_id`
- Index on `entity_type`
- Index on `created_at`

**Triggers:**
- Auto-creates logs for major entity changes

---

## Database Views

### `project_statistics`
Aggregated project metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Project ID |
| `name` | TEXT | Project name |
| `organization_id` | UUID | Organization ID |
| `status` | TEXT | Project status |
| `budget` | DECIMAL(15,2) | Project budget |
| `spent` | DECIMAL(15,2) | Amount spent |
| `progress` | INTEGER | Progress percentage |
| `total_tasks` | BIGINT | Total task count |
| `completed_tasks` | BIGINT | Completed task count |
| `team_members` | BIGINT | Team member count |
| `total_hours` | DECIMAL | Total hours logged |

---

### `user_productivity`
User productivity metrics.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | User ID |
| `full_name` | TEXT | User name |
| `organization_id` | UUID | Organization ID |
| `assigned_tasks` | BIGINT | Assigned task count |
| `completed_tasks` | BIGINT | Completed task count |
| `total_hours` | DECIMAL | Total hours logged |
| `projects_worked_on` | BIGINT | Project count |

---

### `financial_overview`
Financial summary per organization.

| Column | Type | Description |
|--------|------|-------------|
| `organization_id` | UUID | Organization ID |
| `organization_name` | TEXT | Organization name |
| `total_revenue` | DECIMAL(15,2) | Total paid invoices |
| `outstanding_invoices` | DECIMAL(15,2) | Unpaid invoices |
| `total_expenses` | DECIMAL(15,2) | Total approved expenses |
| `net_profit` | DECIMAL(15,2) | Revenue - expenses |

---

### `cash_flow_summary`
Monthly cash flow aggregation.

| Column | Type | Description |
|--------|------|-------------|
| `organization_id` | UUID | Organization ID |
| `month` | TIMESTAMPTZ | Month (truncated) |
| `total_income` | DECIMAL(15,2) | Total income for month |
| `total_expenses` | DECIMAL(15,2) | Total expenses for month |
| `net_flow` | DECIMAL(15,2) | Net cash flow |

---

### `task_analytics`
Task completion analytics.

| Column | Type | Description |
|--------|------|-------------|
| `organization_id` | UUID | Organization ID |
| `project_id` | UUID | Project ID |
| `status` | TEXT | Task status |
| `priority` | TEXT | Task priority |
| `task_count` | BIGINT | Number of tasks |
| `avg_hours` | DECIMAL | Average hours per task |
| `avg_completion_days` | DECIMAL | Average days to complete |

---

## Relationships Diagram

```
organizations
├── profiles (many users)
│   ├── chat_sessions
│   │   └── chat_messages
│   ├── notifications
│   ├── time_entries
│   └── calendar_events
├── projects
│   ├── project_members (many-to-many with profiles)
│   ├── tasks
│   │   ├── task_comments
│   │   └── time_entries
│   ├── invoices
│   ├── expenses
│   ├── time_entries
│   ├── calendar_events
│   └── documents
├── customers
│   ├── customer_contacts
│   └── invoices
│       └── invoice_items
├── expenses
├── cash_flow_entries
├── documents
│   ├── document_versions
│   └── document_shares
├── analytics_events
├── analytics_metrics
└── activity_logs
```

---

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Organization-based isolation** - users only see data in their org
✅ **Role-based permissions** - admin, manager, user roles
✅ **Owner-based access** - users can edit their own data
✅ **Project member access** - team-based permissions
✅ **Activity logging** - all major actions are logged
✅ **Notification system** - auto-notify users of relevant events

---

## Auto-calculated Fields

Several fields are automatically calculated by database triggers:

- `invoices.total_amount` - Auto-calculated from invoice items
- `invoices.subtotal` - Sum of invoice item amounts
- `time_entries.duration` - Calculated from start_time and end_time
- `tasks.actual_hours` - Sum of related time entries
- `projects.spent` - Sum of approved expenses

---

## Common Queries

### Get User's Projects
```sql
SELECT p.*, 
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT pm.user_id) as member_count
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN project_members pm ON pm.project_id = p.id
WHERE p.organization_id = $1
GROUP BY p.id;
```

### Get Project Tasks with Assignees
```sql
SELECT t.*,
  p.name as assigned_to_name,
  p.avatar_url as assigned_to_avatar
FROM tasks t
LEFT JOIN profiles p ON p.id = t.assigned_to
WHERE t.project_id = $1
ORDER BY t.order_index;
```

### Get Financial Summary
```sql
SELECT
  COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount END), 0) as revenue,
  COALESCE(SUM(CASE WHEN status != 'paid' THEN total_amount END), 0) as outstanding
FROM invoices
WHERE organization_id = $1;
```

### Get Time Logged Today
```sql
SELECT 
  SUM(duration) / 3600.0 as hours
FROM time_entries
WHERE user_id = $1
  AND DATE(start_time) = CURRENT_DATE;
```

---

## Version History

- **v1.0** - Initial schema with all core features
  - User authentication & profiles
  - Organization multi-tenancy
  - AI Assistant chat memory
  - Project & task management
  - Business tools (CRM, invoices, expenses)
  - Time tracking & calendar
  - Document management
  - Analytics & activity logs

---

For implementation details, see:
- `supabase/migrations/` - SQL migration files
- `src/lib/supabase.ts` - TypeScript client
- `src/services/api.ts` - API service layer
- `supabase/README.md` - Setup documentation























