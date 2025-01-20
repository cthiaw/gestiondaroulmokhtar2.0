/*
  # Update students table structure
  
  1. Changes
    - Remove class_id column
    - Add level and class_type columns
    - Add constraints for valid values
  
  2. Data Migration
    - Set default values for new columns
*/

-- Remove old class_id column
ALTER TABLE students DROP COLUMN IF EXISTS class_id;

-- Add new columns
ALTER TABLE students 
  ADD COLUMN level text,
  ADD COLUMN class_type text;

-- Update existing records with default values
UPDATE students 
SET 
  level = 'CI',
  class_type = 'FRANCAIS'
WHERE level IS NULL OR class_type IS NULL;

-- Make columns required and add constraints
ALTER TABLE students 
  ALTER COLUMN level SET NOT NULL,
  ALTER COLUMN class_type SET NOT NULL,
  ADD CONSTRAINT students_level_check CHECK (
    level IN ('PS', 'GS', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2')
  ),
  ADD CONSTRAINT students_class_type_check CHECK (
    class_type IN ('FRANCAIS', 'ARABE')
  );

COMMENT ON COLUMN students.level IS 'Student class level';
COMMENT ON COLUMN students.class_type IS 'Type of class (French or Arabic)';