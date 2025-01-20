/*
  # Remove coefficient column
  
  1. Changes
    - Remove coefficient column from subjects table
    - Remove related constraints
  
  2. Notes
    - Uses DO block for safer execution
    - Includes existence checks before modifications
*/

DO $$ 
BEGIN
  -- Step 1: Remove constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'subjects_coefficient_check'
  ) THEN
    ALTER TABLE subjects DROP CONSTRAINT subjects_coefficient_check;
  END IF;

  -- Step 2: Remove column if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'subjects' AND column_name = 'coefficient'
  ) THEN
    ALTER TABLE subjects DROP COLUMN coefficient;
  END IF;
END $$;