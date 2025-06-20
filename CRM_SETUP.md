# Eegar - Real Estate CRM Application

A modern, responsive CRM application built specifically for real estate professionals to manage WhatsApp leads, contacts, and properties.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MariaDB with credentials: `root:zerocall`
- Your WhatsApp chat CSV file

### Setup Instructions

1. **Create Database**
```sql
CREATE DATABASE eegar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Install & Setup**
```bash
# Navigate to project
cd eegar

# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Copy your CSV file to project root
cp ~/Downloads/real_estate_whatsapp_chat.csv .

# Import your data
node scripts/import-csv.js

# Start the application
npm start
```

3. **Open Application**
- Visit: `http://localhost:3000`
- Your CRM is ready! 🎉

## 📋 Features

- **Contact Management**: Import WhatsApp contacts automatically
- **Dashboard**: Real-time statistics and recent activity
- **Message History**: Track all communications
- **Property Management**: Add and manage listings
- **Lead Tracking**: Monitor sales funnel progression

## 🔧 Quick Commands

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Re-import CSV data
node scripts/import-csv.js
```

## 📊 Your Data Structure

The app imports your CSV with columns:
- Date, Time, Name, Description, Phone

And creates a complete CRM with:
- Contact profiles
- Message history
- Lead status tracking
- Property inquiries

---

**Your Real Estate CRM is ready to use! 🏡**
