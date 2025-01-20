/*
  # Update grades table trimester constraint

  1. Changes
    - Remove existing semester/trimester constraint
    - Add new constraint to allow trimesters 1, 2, and 3
    - Rename semester column to trimester for consistency
*/

-- First rename semester column to trimester if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'grades' 
    AND column_name = 'semester'
  ) THEN
    ALTER TABLE grades RENAME COLUMN semester TO trimester;
  END IF;
END $$;

-- Remove existing constraint if any
ALTER TABLE grades 
DROP CONSTRAINT IF EXISTS grades_semester_check,
DROP CONSTRAINT IF EXISTS grades_trimester_check;

-- Add new trimester constraint
ALTER TABLE grades
ADD CONSTRAINT grades_trimester_check 
CHECK (trimester IN (1, 2, 3));