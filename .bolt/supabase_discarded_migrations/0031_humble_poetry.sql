/*
  # Add max_score to grades table

  1. Changes
    - Add max_score column to grades table
    - Add constraints to ensure valid score ranges
*/

-- Add max_score column with default value
ALTER TABLE grades 
ADD COLUMN IF NOT EXISTS max_score integer NOT NULL DEFAULT 20;

-- Add constraints
ALTER TABLE grades 
DROP CONSTRAINT IF EXISTS grades_score_check,
DROP CONSTRAINT IF EXISTS grades_max_score_positive,
DROP CONSTRAINT IF EXISTS grades_score_range;

ALTER TABLE grades 
ADD CONSTRAINT grades_max_score_positive CHECK (max_score > 0),
ADD CONSTRAINT grades_score_range CHECK (score >= 0 AND score <= max_score);