# Database Migration Guide

## Step 1: Export Your Current MariaDB Data

Run these commands to export your current data:

```bash
# Export all broker data
mysqldump -u root -p eegar brokers > brokers_backup.sql

# Export all other tables
mysqldump -u root -p eegar contacts > contacts_backup.sql
mysqldump -u root -p eegar messages > messages_backup.sql
mysqldump -u root -p eegar properties > properties_backup.sql

# Or export everything at once
mysqldump -u root -p eegar > full_database_backup.sql
```

## Step 2: Set Up Cloud Database (Choose One)

### Option A: Neon (PostgreSQL) - Recommended
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy your connection string
4. Update your .env file

### Option B: PlanetScale (MySQL)
1. Go to https://planetscale.com
2. Sign up and create a new database
3. Copy your connection string
4. Update your .env file

### Option C: Railway (PostgreSQL/MySQL)
1. Go to https://railway.app
2. Create a new project with database
3. Copy your connection string
4. Update your .env file

## Step 3: Update Database Configuration

Update your `.env` file with the new database URL:

```env
# For Neon (PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# For PlanetScale (MySQL)
DATABASE_URL="mysql://username:password@host/database?sslmode=require"

# For Railway
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Step 4: Update Prisma Schema for Cloud Database

If using PostgreSQL (Neon/Railway), update prisma/schema.prisma:
- Change provider from "mysql" to "postgresql"
- Update field types if needed

## Step 5: Migration Commands

```bash
# Generate new migration for cloud database
npx prisma migrate dev --name init

# Push schema to cloud database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Step 6: Import Your Data

Convert and import your data using the migration script we'll create.

## Step 7: Vercel Deployment

Set environment variables in Vercel dashboard and deploy.
