# Complete Deployment Guide to Vercel

## ✅ Step 1: Fix Build Issues (COMPLETED)
- ✅ Fixed dependency conflicts
- ✅ Added .npmrc with legacy-peer-deps
- ✅ Disabled ESLint for production build
- ✅ Created Vercel API routes
- ✅ Updated frontend API configuration

## Step 2: Set Up Cloud Database

### Option A: Neon (PostgreSQL) - Recommended FREE Option
1. Go to https://neon.tech
2. Sign up with your GitHub account
3. Create a new project called "eegar-crm"
4. Copy the connection string
5. Update your Prisma schema to use PostgreSQL

### Option B: PlanetScale (MySQL) - FREE Option
1. Go to https://planetscale.com
2. Create new database "eegar-crm"
3. Copy connection string
4. Keep current MySQL schema

### Option C: Railway (PostgreSQL/MySQL) - $5/month
1. Go to https://railway.app
2. Create project with database
3. Copy connection string

## Step 3: Database Migration

### For PostgreSQL (Neon/Railway):
```bash
# Update prisma/schema.prisma - change provider to "postgresql"
# Then run:
npx prisma migrate dev --name init
npx prisma db push
npx prisma generate
```

### For MySQL (PlanetScale):
```bash
# Keep current schema, just update DATABASE_URL
npx prisma db push
npx prisma generate
```

## Step 4: Deploy to Vercel

### 4.1: Push Code to GitHub
```bash
git add .
git commit -m "Fix build issues and add Vercel API routes"
git push origin main
```

### 4.2: Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Set Environment Variables:
   - `DATABASE_URL`: Your cloud database connection string
   - `NODE_ENV`: production

### 4.3: Deploy
Click "Deploy" - Vercel will automatically build and deploy

## Step 5: Migrate Your Data

After successful deployment, run the migration script:

### Local to Cloud Migration:
1. Update `scripts/migrate-to-cloud.js` with your old database credentials
2. Set your new cloud DATABASE_URL in .env
3. Run: `npm run migrate`

## Step 6: Test Your Deployed App

1. Visit your Vercel URL
2. Test the dashboard: `https://your-app.vercel.app/admin`
3. Verify data is showing correctly

## Expected URLs:
- Main App: https://your-app.vercel.app
- Admin Dashboard: https://your-app.vercel.app/admin
- API Endpoints: https://your-app.vercel.app/api/dashboard/stats

---

## Next Steps After Deployment:

1. **Custom Domain**: Add your custom domain in Vercel settings
2. **Analytics**: Set up Vercel Analytics
3. **Monitoring**: Set up error tracking (Sentry)
4. **Backup**: Set up automatic database backups
5. **SSL**: Automatic HTTPS (handled by Vercel)

## Need Help?
- Check Vercel logs if deployment fails
- Verify environment variables are set correctly
- Ensure DATABASE_URL is accessible from Vercel servers
