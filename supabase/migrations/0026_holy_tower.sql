/*
  # Make birth date optional

  1. Changes
    - Modify students table to make birth_date nullable
    - Update validation trigger to handle null birth dates
    - Add date validation for non-null birth dates

  2. Security
    - Maintain existing RLS policies
    - No data loss during migration
*/

-- Make birth_date column nullable
ALTER TABLE students 
  ALTER COLUMN birth_date DROP NOT NULL;

-- Update validation trigger to handle optional birth dates
CREATE OR REPLACE FUNCTION validate_student_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate gender
  IF NEW.gender NOT IN ('M', 'F') THEN
    RAISE EXCEPTION 'Invalid gender value. Must be M or F';
  END IF;

  -- Validate class type
  IF NEW.class_type NOT IN ('FRANCAIS', 'ARABE') THEN
    RAISE EXCEPTION 'Invalid class type. Must be FRANCAIS or ARABE';
  END IF;

  -- Validate level
  IF NEW.level NOT IN ('PS', 'GS', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2') THEN
    RAISE EXCEPTION 'Invalid level';
  END IF;

  -- Only validate birth_date if it's provided
  IF NEW.birth_date IS NOT NULL THEN
    -- Validate date is not in the future
    IF NEW.birth_date > CURRENT_DATE THEN
      RAISE EXCEPTION 'Birth date cannot be in the future';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS student_validation_trigger ON students;

CREATE TRIGGER student_validation_trigger
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();