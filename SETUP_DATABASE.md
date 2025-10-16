# Database Setup Guide for VEA Dashboard

## Quick Start

Follow these steps to set up your database for the VEA Admin Dashboard.

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in your project details:
   - **Name**: VEA Dashboard
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (2-3 minutes)

### Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project:
   ```bash
   # On Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # Or just create it manually
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace the values with your actual credentials from Step 2

### Step 4: Run Database Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the sidebar
3. Click **"New Query"**
4. Copy and paste the contents of each migration file in order:
   
   **Migration 1: Core Schema**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **"Run"** (or press F5)
   - Wait for "Success" message

   **Migration 2: Security Policies**
   - Open `supabase/migrations/002_rls_policies.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success" message

   **Migration 3: Functions & Triggers**
   - Open `supabase/migrations/003_functions_and_triggers.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success" message

   **Migration 4: Seed Data (Optional)**
   - Open `supabase/migrations/004_seed_data.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **"Run"**

#### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (get project ref from dashboard URL):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

### Step 5: Set Up Storage for Documents

1. In Supabase dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Enter bucket name: `documents`
4. Set to **Private**
5. Click **"Create bucket"**

6. Add storage policies:
   - Go to **Storage** → **Policies**
   - Click **"New Policy"**
   - Select **"For full customization"**
   - Add these three policies:

   **Policy 1: Upload Documents**
   ```sql
   CREATE POLICY "Users can upload documents"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'documents');
   ```

   **Policy 2: View Documents**
   ```sql
   CREATE POLICY "Users can view documents"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'documents');
   ```

   **Policy 3: Delete Documents**
   ```sql
   CREATE POLICY "Users can delete own documents"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'documents' AND owner = auth.uid());
   ```

### Step 6: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to the local URL (usually `http://localhost:5173`)

3. Try to sign up:
   - Should create a user in **Authentication** → **Users**
   - Should create a profile in **Database** → **profiles** table

### Step 7: Create Your First Organization (Optional)

Since you now have a working database, you can either:

**Option A: Via SQL (for testing)**
1. Go to SQL Editor in Supabase
2. Run this query (replace USER_ID with your actual user ID from Authentication):
   ```sql
   -- Insert test organization
   INSERT INTO organizations (name, slug, subscription_tier)
   VALUES ('My Company', 'my-company', 'pro')
   RETURNING id;
   
   -- Copy the returned ID and update your profile
   UPDATE profiles 
   SET organization_id = 'THE-ORGANIZATION-ID-FROM-ABOVE'
   WHERE id = 'YOUR-USER-ID';
   ```

**Option B: Build an Onboarding Flow**
Create a page in your app for users to create/join organizations.

## Troubleshooting

### Issue: "Cannot connect to Supabase"
- ✅ Check that `.env` file exists and has correct values
- ✅ Restart your dev server after creating `.env`
- ✅ Verify Project URL doesn't have trailing slash
- ✅ Make sure anon key is the **anon** key, not service_role

### Issue: "Row Level Security policy violation"
- ✅ Make sure you've run migration 002 (RLS policies)
- ✅ Check that user is authenticated
- ✅ Verify user has organization_id set in profiles table

### Issue: "Trigger function does not exist"
- ✅ Make sure you've run migration 003 (functions & triggers)
- ✅ Check for any errors in migration output

### Issue: "Cannot insert into profiles"
- ✅ Check that the trigger `on_auth_user_created` exists
- ✅ Run this in SQL Editor:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
- ✅ If empty, re-run migration 003

### Issue: Storage uploads failing
- ✅ Verify bucket name is exactly `documents`
- ✅ Check storage policies are in place
- ✅ Make sure user is authenticated

## What's Next?

After setup, you can:

1. **Build Authentication UI**: Use `src/hooks/useAuth.ts`
2. **Create Dashboard Pages**: Use `src/services/api.ts` for data
3. **Add Real-time Features**: Use `src/hooks/useSupabase.ts`
4. **Customize Schema**: Add more fields to tables as needed

## Database Schema Overview

Your database now includes:

### Core Features ✅
- User authentication & profiles
- Organization/multi-tenancy support

### AI Assistant ✅
- Chat sessions per user
- Message history with metadata

### Project Management ✅
- Projects with budgets
- Tasks with assignments
- Time tracking
- Team collaboration

### Business Tools ✅
- Customer management (CRM)
- Invoice generation
- Expense tracking
- Cash flow monitoring
- Calendar & events
- Document storage

### Analytics ✅
- Project statistics
- User productivity
- Financial overview
- Activity logging

## Security Features

✅ Row Level Security (RLS) on all tables
✅ Organization-based data isolation
✅ Role-based permissions (admin, manager, user)
✅ Secure storage with access policies
✅ Activity logging
✅ Session management

## Need Help?

- 📚 Check `supabase/README.md` for detailed documentation
- 🔍 Review example code in `src/services/api.ts`
- 💬 Supabase Discord: https://discord.supabase.com
- 📖 Supabase Docs: https://supabase.com/docs

---

**You're all set!** 🎉 Start building your admin dashboard with full database support.



