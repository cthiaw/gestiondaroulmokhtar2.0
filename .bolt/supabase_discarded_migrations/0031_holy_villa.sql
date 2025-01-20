/*
  # Update semester to trimester columns

  1. Changes
    - Safely rename semester column to trimester in grades and absences tables
    - Update constraints and indexes to use new column names
    - Add proper comments

  2. Security
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Check if semester column exists in grades table
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'grades' 
    AND column_name = 'semester'
  ) THEN
    -- Rename column in grades table
    ALTER TABLE grades RENAME COLUMN semester TO trimester;
    
    -- Update constraints for grades
    ALTER TABLE grades 
      DROP CONSTRAINT IF EXISTS grades_semester_check,
      ADD CONSTRAINT grades_trimester_check 
      CHECK (trimester IN (1, 2, 3));

    ALTER TABLE grades 
      DROP CONSTRAINT IF EXISTS grades_student_id_subject_id_semester_key,
      ADD CONSTRAINT grades_student_id_subject_id_trimester_key 
      UNIQUE (student_id, subject_id, trimester);
  END IF;

  -- Check if semester column exists in absences table
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'absences' 
    AND column_name = 'semester'
  ) THEN
    -- Rename column in absences table
    ALTER TABLE absences RENAME COLUMN semester TO trimester;
    
    -- Update constraints for absences
    ALTER TABLE absences 
      DROP CONSTRAINT IF EXISTS absences_semester_check,
      ADD CONSTRAINT absences_trimester_check 
      CHECK (trimester IN (1, 2, 3));

    ALTER TABLE absences 
      DROP CONSTRAINT IF EXISTS absences_student_id_semester_key,
      ADD CONSTRAINT absences_student_id_trimester_key 
      UNIQUE (student_id, trimester);

    -- Update index
    DROP INDEX IF EXISTS idx_absences_student_semester;
    CREATE INDEX idx_absences_student_trimester ON absences(student_id, trimester);
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN grades.trimester IS 'Trimester number (1, 2, or 3)';
COMMENT ON COLUMN absences.trimester IS 'Trimester number (1, 2, or 3)';