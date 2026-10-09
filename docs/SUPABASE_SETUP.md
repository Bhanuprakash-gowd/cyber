# CyberSentry AI — Exact Supabase Database Setup Procedure

Follow this guide to configure your Supabase PostgreSQL cloud database and authentication.

## 1. Create Supabase Project
1. Navigate to [Supabase](https://supabase.com/) and sign in to your dashboard.
2. Click **New Project**, select an organization, name the project `cybersentry-ai`, set a secure database password, and choose your preferred region.
3. Wait for the project instance to finish provisioning.

## 2. Obtain API Credentials
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Copy the **anon / public** key.
4. Copy the **service_role / secret** key (keep this strictly confidential!).

## 3. Set Up Environment Variables
- **Frontend** (`frontend/.env.local` or `frontend/.env`):
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
  VITE_API_BASE_URL=http://localhost:5000
  ```
- **Backend** (`backend/.env`):
  ```env
  SUPABASE_URL=https://your-project-id.supabase.co
  SUPABASE_SECRET_KEY=your_supabase_service_role_secret_key
  SUPABASE_ANON_KEY=your_supabase_anon_public_key
  FRONTEND_ORIGIN=http://localhost:5173
  ```

## 4. Run SQL Schema Migrations in Order
In the Supabase Dashboard, open the **SQL Editor** and execute the migration files generated in this repository:

1. **Schema & Tables**: Run `supabase/migrations/20260101000000_initial_schema.sql`
   - Creates `profiles`, `scans`, `threat_news`, `community_reports`, `threat_indicators`, `user_bookmarks`, `notifications`, `learning_progress`, `feed_sources`, `ingestion_logs`.
2. **Row Level Security (RLS)**: Run `supabase/migrations/20260101000001_rls_policies.sql`
   - Enables RLS on all 10 tables.
   - Configures user isolation (users read only their private scans, public reads only approved moderated reports, admins manage feeds).
   - Installs trigger for auto-profile creation on auth signup.

## 5. Seed Demonstration Records (Optional)
Run `supabase/seed.sql` in the SQL Editor to populate sample threat advisories, moderated community reports, and feed configurations.
All sample records are clearly labeled as demonstration data.

## 6. Create Initial Administrator Securely
To promote a user to administrator:
1. Register an account in the CyberSentry AI frontend (`/signup`).
2. In the Supabase SQL Editor, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@domain.com';
   ```
3. Refresh the app to access `/admin`.
