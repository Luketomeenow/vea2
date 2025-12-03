# 🎯 VEA Dashboard - Real Data Integration Guide

## ✅ What's Been Completed

### 1. **Dashboard Components Connected to Supabase**
- ✅ **KPI Cards** - Now showing real data:
  - YTD Revenue (from cash_flow_entries)
  - Active Projects (from projects table)
  - Total Customers (from customers table)
  - Open Invoices (from invoices table)
- ✅ **Revenue Chart** - Displays last 6 months of revenue vs targets
- ✅ **Task Distribution Chart** - Shows tasks by status (To Do, In Progress, Review, Done, Blocked)

### 2. **Mock Data SQL Script Created**
- Location: `MOCK_DATA_INSERT.sql`
- Includes sample data for all tables:
  - Organizations
  - Projects (3 projects)
  - Tasks (8 tasks)
  - Customers (5 customers)
  - Invoices (5 invoices)
  - Expenses (5 expenses)
  - Cash Flow Entries (10 entries)
  - Time Entries (6 entries)
  - Calendar Events (5 events)
  - Notifications (5 notifications)
  - Analytics Metrics

### 3. **API Services Created**
- `src/services/dashboardService.ts` - Functions to fetch:
  - KPI data
  - Revenue data
  - Task statistics
  - Recent activity

---

## 📋 How to Use the Mock Data

### Step 1: Get Your User ID

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project
3. Click **SQL Editor** in the left sidebar
4. Run this query:

```sql
SELECT id, email FROM auth.users;
```

5. Copy your user ID (the UUID)

### Step 2: Insert Mock Data

1. Open `MOCK_DATA_INSERT.sql`
2. **Replace `YOUR_USER_ID`** on line 7 with your actual user ID:

```sql
DECLARE
  current_user_id UUID := 'YOUR_USER_ID'; -- REPLACE THIS
```

Example:
```sql
DECLARE
  current_user_id UUID := 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8';
```

3. **Copy the entire SQL script**
4. Paste into **Supabase SQL Editor**
5. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Data Was Inserted

Run these verification queries in SQL Editor:

```sql
-- Check projects
SELECT COUNT(*) AS project_count FROM projects;

-- Check tasks
SELECT COUNT(*) AS task_count FROM tasks;

-- Check customers
SELECT COUNT(*) AS customer_count FROM customers;

-- Check revenue
SELECT 
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
FROM cash_flow_entries;
```

You should see:
- 3 projects
- 8 tasks
- 5 customers
- Revenue data

---

## 🧪 Testing the Dashboard

### 1. Refresh Your Dashboard

1. Go to http://localhost:8080/dashboard
2. You should see:
   - **KPI Cards** with real numbers
   - **Revenue Chart** with 6 months of data
   - **Task Distribution** pie chart

### 2. What to Expect

**KPI Cards:**
- YTD Revenue: ~$88,380 (from mock income entries)
- Active Projects: 2 (Website Redesign, Mobile App)
- Total Customers: 5
- Open Invoices: ~$49,595 (2 unpaid invoices)

**Revenue Chart:**
- Should show revenue trends for last 6 months
- Targets are automatically calculated as 110% of revenue

**Task Distribution:**
- To Do: 2 tasks
- In Progress: 2 tasks
- Review: 1 task
- Done: 3 tasks

---

## 🚀 What's Next (Remaining Pages)

These pages still need to be connected to real data:

### Pending:
1. ⏳ **Projects Page** - Show all projects from database
2. ⏳ **Tasks Page** - Full task management
3. ⏳ **Customers Page** - Customer list and details
4. ⏳ **Finances Page** - Invoices and expenses
5. ⏳ **Cash Flow Page** - Income/expense tracking
6. ⏳ **Time Tracking Page** - Time entries
7. ⏳ **Documents Page** - Document management

---

## 🔧 Troubleshooting

### Issue: No Data Showing

**Check 1: Profile Has Organization**
```sql
SELECT id, email, organization_id FROM profiles WHERE id = 'YOUR_USER_ID';
```
- If `organization_id` is NULL, the mock data script didn't run correctly

**Check 2: Data Exists**
```sql
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM cash_flow_entries;
```
- Should return numbers > 0

**Check 3: Console Errors**
- Press `F12` → Console tab
- Look for Supabase errors

### Issue: "infinite recursion detected in policy"

This was already fixed! But if you see it:

```sql
-- Run this in SQL Editor
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

---

## 📊 Database Schema Reference

### Main Tables:
- `organizations` - Company/organization data
- `profiles` - User profiles (extends auth.users)
- `projects` - Projects with budgets, progress, status
- `tasks` - Tasks linked to projects
- `customers` - Customer/client information
- `invoices` - Billing and invoices
- `expenses` - Business expenses
- `cash_flow_entries` - Income and expense transactions
- `time_entries` - Time tracking for billable hours
- `calendar_events` - Calendar and meetings
- `documents` - File storage metadata
- `chat_sessions` & `chat_messages` - AI Assistant memory

### Relationships:
- Users belong to Organizations
- Projects belong to Organizations
- Tasks can belong to Projects
- Everything is filtered by organization_id

---

## 🎨 Customizing Mock Data

You can edit `MOCK_DATA_INSERT.sql` to add more:

### Add More Projects:
```sql
INSERT INTO projects (organization_id, name, description, status, budget, progress, owner_id)
VALUES (org_id, 'Your Project Name', 'Description', 'active', 75000.00, 25, current_user_id);
```

### Add More Revenue:
```sql
INSERT INTO cash_flow_entries (organization_id, type, category, amount, transaction_date, status)
VALUES (org_id, 'income', 'Sales', 10000.00, CURRENT_DATE, 'completed');
```

---

## 💡 Next Steps

1. ✅ Run the mock data script
2. ✅ Test the dashboard
3. 📊 **Tell me if you want me to continue connecting the remaining pages!**

**Would you like me to:**
- A) Continue connecting Projects, Tasks, Customers pages?
- B) Fix any issues you're seeing?
- C) Add more features to the current dashboard?

Let me know! 🚀
















