-- Add treatment_effect column to inkt_records table
ALTER TABLE inkt_records ADD COLUMN IF NOT EXISTS treatment_effect TEXT;
