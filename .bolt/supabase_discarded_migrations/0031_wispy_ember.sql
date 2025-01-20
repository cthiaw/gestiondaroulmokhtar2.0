/*
  # Add max_score column to grades table
  
  1. Changes
    - Add max_score column to grades table with proper constraints
    - Ensure score values are within valid range
    
  2. Safety
    - Uses IF NOT EXISTS checks
    - Wrapped in DO block for atomic execution
    - Proper constraints for data integrity
*/

DO $$ 
BEGIN
  -- Add max_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'grades' 
    AND column_name = 'max_score'
  ) THEN
    ALTER TABLE grades 
    ADD COLUMN max_score integer NOT NULL DEFAULT 20;
    
    -- Add check constraints
    ALTER TABLE grades 
    ADD CONSTRAINT grades_max_score_positive 
    CHECK (max_score > 0);
    
    ALTER TABLE grades 
    ADD CONSTRAINT grades_score_range 
    CHECK (score <= max_score);
  END IF;
END $$;