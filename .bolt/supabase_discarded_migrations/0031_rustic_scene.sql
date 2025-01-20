/*
  # Add trimester column to grades table
  
  1. Changes
    - Add trimester column to grades table
    - Add check constraint for valid trimester values (1, 2, 3)
    - Add unique constraint for student/subject/trimester combination
  
  2. Security
    - Preserves existing RLS policies
*/

-- Add new trimester column
ALTER TABLE grades 
ADD COLUMN trimester integer NOT NULL DEFAULT 1;

-- Add check constraint
ALTER TABLE grades 
ADD CONSTRAINT grades_trimester_check 
CHECK (trimester IN (1, 2, 3));

-- Add unique constraint
ALTER TABLE grades 
ADD CONSTRAINT grades_student_id_subject_id_trimester_key 
UNIQUE (student_id, subject_id, trimester);

-- Add comment
COMMENT ON COLUMN grades.trimester IS 'Trimester number (1, 2, or 3)';

-- Remove default after adding column
ALTER TABLE grades 
ALTER COLUMN trimester DROP DEFAULT;