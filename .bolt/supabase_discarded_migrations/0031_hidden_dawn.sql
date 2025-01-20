/*
  # Fix grades table constraints

  1. Changes
    - Remove existing score check constraint
    - Add new constraints for score and max_score
    - Ensure score is between 0 and max_score
    - Set default max_score to 20
*/

-- First remove any existing constraints
ALTER TABLE grades 
DROP CONSTRAINT IF EXISTS grades_score_check,
DROP CONSTRAINT IF EXISTS grades_max_score_check,
DROP CONSTRAINT IF EXISTS grades_score_range_check;

-- Add max_score column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'grades' 
    AND column_name = 'max_score'
  ) THEN
    ALTER TABLE grades ADD COLUMN max_score numeric(4,2) NOT NULL DEFAULT 20;
  END IF;
END $$;

-- Add new constraints
ALTER TABLE grades
ADD CONSTRAINT grades_score_range_check 
CHECK (score >= 0 AND score <= max_score),
ADD CONSTRAINT grades_max_score_check 
CHECK (max_score > 0 AND max_score <= 100);