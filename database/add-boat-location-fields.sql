-- Add boat location fields (dock, slip, marina)
-- These fields store where the boat is physically located

DO $$
BEGIN
  -- Add dock column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'dock') THEN
    ALTER TABLE boats ADD COLUMN dock TEXT;
  END IF;

  -- Add slip column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'slip') THEN
    ALTER TABLE boats ADD COLUMN slip TEXT;
  END IF;

  -- Add marina column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'boats' AND column_name = 'marina') THEN
    ALTER TABLE boats ADD COLUMN marina TEXT;
  END IF;
END $$;

-- Update sample data (optional - for testing)
UPDATE boats SET
  dock = 'A',
  slip = '12',
  marina = 'Marina del Rey'
WHERE name = 'Sea Breeze';

UPDATE boats SET
  dock = 'B',
  slip = '45',
  marina = 'Channel Islands Harbor'
WHERE name = 'Blue Wave';
