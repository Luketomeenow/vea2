# 🚀 VEA Dashboard Setup Guide

## ✅ Step-by-Step Setup

### 1️⃣ **Fix User Organization Issue**

If you get "No organization found" error when creating tasks/projects:

**Run this in Supabase SQL Editor:**

```sql
-- Open FIX_USER_ORGANIZATION.sql and run it
```

This will:
- ✅ Create an organization for your user
- ✅ Link your profile to the organization
- ✅ Set you as admin

---

### 2️⃣ **Insert Mock Data (Optional)**

To test with sample data:

**Run in Supabase SQL Editor:**

```sql
-- Open MOCK_DATA_INSERT_CLEAN.sql and run it
```

This will add:
- 3 Projects
- 8 Tasks
- 5 Customers
- 5 Invoices
- 10 Cash Flow Entries
- And more!

---

### 3️⃣ **Verify Setup**

Run this query to check your setup:

```sql
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.organization_id,
  o.name as organization_name,
  p.role
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
WHERE p.id = auth.uid();
```

You should see:
- ✅ Your user ID
- ✅ Organization ID (not NULL)
- ✅ Organization name
- ✅ Role: admin

---

### 4️⃣ **Test AI Assistant**

Go to **Dashboard → AI Assistant** and try:

```
✅ "Show me my projects"
✅ "How's my business health?"
✅ "What tasks do I have?"
✅ "Create a task: Review Q1 finances"
✅ "Show me pending invoices"
```

---

## 🐛 Troubleshooting

### Issue: "No organization found"

**Solution:**
1. Run `FIX_USER_ORGANIZATION.sql` in Supabase
2. Refresh your browser
3. Try again

### Issue: "No data showing"

**Solution:**
1. Run `MOCK_DATA_INSERT_CLEAN.sql` in Supabase
2. Refresh the dashboard pages
3. Check if data appears

### Issue: AI not responding

**Solution:**
1. Check browser console for errors (F12)
2. Verify Supabase URL and API key in `.env`
3. Check if Edge Function is deployed
4. Restart dev server: `npm run dev`

---

## 📊 Available Dashboard Pages

- ✅ **Dashboard** - KPIs, charts, overview
- ✅ **Projects** - Manage projects
- ✅ **Tasks** - Task management
- ✅ **Customers** - Customer database
- ✅ **Finances** - Invoices & expenses
- ✅ **Cash Flow** - Cash flow forecast
- ✅ **Time Tracking** - Time entries
- ✅ **AI Assistant** - Intelligent chat with database access

---

## 🤖 AI Assistant Capabilities

Your AI can:

**📊 Access Data:**
- Get dashboard overview
- List projects, tasks, customers
- Show financial summary
- Check cash flow
- View time tracking

**⚡ Take Actions:**
- Create tasks
- Create projects
- (More actions coming soon)

**🎨 Generate Media:**
- Images (4O Image API)
- Videos (Veo 3 API)

**💡 Analyze:**
- Business health
- Revenue trends
- Task completion rates
- Financial performance

---

## 📝 Next Steps

1. ✅ Run `FIX_USER_ORGANIZATION.sql`
2. ✅ Run `MOCK_DATA_INSERT_CLEAN.sql` (optional)
3. ✅ Verify setup with SQL query
4. ✅ Test AI Assistant
5. ✅ Explore dashboard pages

---

**🎉 You're all set! Your AI-powered dashboard is ready to use!**





