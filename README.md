# Uswatul Hasanat — Member Verification System

QR code-based member verification for Uswatul Hasanat Society. Each member gets a QR code that, when scanned, shows their profile with photo, name, registration number, and society info.

## Stack
- **Next.js 15** (App Router)
- **Supabase** (Database + Photo Storage)
- **Tailwind CSS**
- **react-qr-code** (QR generation)

## Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Run the Database Schema
1. In Supabase → SQL Editor → New Query
2. Paste the contents of `supabase-schema.sql` and run it
3. This creates the `members` table and inserts the initial 10 members

### 3. Create Photo Storage Bucket
1. In Supabase → Storage → New Bucket
2. Name: `member-photos`
3. Toggle **Public** to ON
4. Save

### 4. Set Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key.

### 5. Install & Run
```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) — that's the admin dashboard.

### 6. Deploy to Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables (same as `.env.local`)
4. Deploy

Your site will be at `your-project.vercel.app`. QR codes will automatically point to the correct URLs.

## How It Works

| Page | URL | Purpose |
|------|-----|---------|
| Admin Dashboard | `/` | Add members, upload photos, view/print QR codes |
| Member Profile | `/member/[reg_number]` | Public page shown when QR code is scanned |

## Adding Members
1. Go to the admin dashboard → "Add new" tab
2. Enter name, registration number, gender
3. Optionally upload a photo
4. Click "Add member"
5. Go to "QR codes" tab to see/print their QR code

## Printing QR Codes
- Go to "QR codes" tab → Click "Print all"
- Or click "QR" next to any member to see their individual QR code
- Right-click to save as image
