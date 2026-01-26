-- Add notes column to inkt_records table
ALTER TABLE inkt_records ADD COLUMN IF NOT EXISTS notes TEXT;
