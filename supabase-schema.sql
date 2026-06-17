-- ============================================
-- USWATUL HASANAT MEMBER VERIFICATION SYSTEM
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================

-- 1. Create the members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  reg_number TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  group_name TEXT NOT NULL DEFAULT 'Uswatul Hasanat',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (required by Supabase)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access (anyone who scans QR code can view)
CREATE POLICY "Public can read members"
  ON members FOR SELECT
  USING (true);

-- 4. Allow authenticated inserts/updates/deletes (for admin)
--    For now we allow all operations since this is a simple app.
--    You can tighten this later with auth if needed.
CREATE POLICY "Allow all inserts"
  ON members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates"
  ON members FOR UPDATE
  USING (true);

CREATE POLICY "Allow all deletes"
  ON members FOR DELETE
  USING (true);

-- 5. Create storage bucket for member photos
-- NOTE: Do this manually in Supabase Dashboard:
--   → Storage → New Bucket → Name: "member-photos" → Public: ON

-- 6. Optional: Insert the initial members your dad gave you
INSERT INTO members (name, reg_number, gender, group_name) VALUES
  ('Rafiu Mulikat', '002476', 'F', 'Uswatul Hasanat'),
  ('Salaudeen Nimota', '002485', 'F', 'Uswatul Hasanat'),
  ('Olaitan Sherifat', '002487', 'F', 'Uswatul Hasanat'),
  ('Imodiran Rashidat', '002486', 'F', 'Uswatul Hasanat'),
  ('Fasasi Nurat', '002488', 'F', 'Uswatul Hasanat'),
  ('Oyewole Sariyu', '002491', 'F', 'Uswatul Hasanat'),
  ('Isamot Serifat', '002484', 'F', 'Uswatul Hasanat'),
  ('Salaudeen Alimat', '002479', 'F', 'Uswatul Hasanat'),
  ('Raheem Shakirat', '002489', 'F', 'Uswatul Hasanat'),
  ('Ajiboso Rasaq A.', '002477', 'M', 'Uswatul Hasanat');
