# Complete Supabase Migration Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up with your GitHub account
3. Create new project:
   - Organization: Your personal account
   - Name: "eegar-crm"
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is perfect for now

## Step 2: Get Connection String

1. In Supabase dashboard, go to Settings → Database
2. Scroll down to "Connection string"
3. Select "Nodejs" tab
4. Copy the connection string
5. It will look like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.supabase.co:5432/postgres`

## Step 3: Update Environment Variables

Create a new `.env` file with your Supabase connection:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.supabase.co:5432/postgres"
```

## Step 4: Install Dependencies and Update Schema

```bash
# Install PostgreSQL client
npm install pg @types/pg --legacy-peer-deps

# Generate new Prisma client for PostgreSQL
npx prisma generate

# Push schema to Supabase (creates tables)
npx prisma db push
```

## Step 5: Export and Import Your Data

1. Update the MariaDB password in `scripts/migrate-to-supabase.js`
2. Run the migration:

```bash
node scripts/migrate-to-supabase.js
```

## Step 6: Verify Data Migration

Check your Supabase dashboard:
1. Go to Table Editor
2. Verify brokers, messages, properties, and contacts tables
3. Check data was imported correctly

## Step 7: Test Locally

```bash
# Test local development
npm start

# Visit http://localhost:3000/admin to test dashboard
```

## Step 8: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add: `DATABASE_URL` = your Supabase connection string
4. Redeploy your project

## Step 9: Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Migrate to Supabase PostgreSQL database"
git push origin main
```

Vercel will automatically redeploy with the new database connection.

## Troubleshooting

### If migration fails:
1. Check MariaDB password in migration script
2. Verify Supabase connection string is correct
3. Check that all required tables exist in MariaDB

### If Vercel deployment fails:
1. Check environment variables are set correctly
2. Verify DATABASE_URL format is correct
3. Check Vercel function logs for errors

### If data doesn't appear:
1. Verify tables were created: `npx prisma db push`
2. Check migration script completed successfully
3. Verify API endpoints are working
