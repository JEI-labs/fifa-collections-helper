-- FIFA Collections Helper - Database Schema
-- Run this in your Supabase SQL Editor

-- Create stickers table
CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,           -- e.g., "BRA"
  number INTEGER NOT NULL,      -- e.g., 12
  full_code TEXT NOT NULL UNIQUE, -- e.g., "BRA12"
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_duplicate BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stickers_full_code ON stickers(full_code);
CREATE INDEX IF NOT EXISTS idx_stickers_code ON stickers(code);
CREATE INDEX IF NOT EXISTS idx_stickers_scanned_at ON stickers(scanned_at DESC);

-- Enable Row Level Security (optional - for future multi-user support)
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read/write (for now)
CREATE POLICY "Allow public access" ON stickers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert some sample data (optional)
-- INSERT INTO stickers (code, number, full_code, is_duplicate) VALUES
--   ('BRA', 10, 'BRA10', false),
--   ('ARG', 10, 'ARG10', false),
--   ('FRA', 10, 'FRA10', false);