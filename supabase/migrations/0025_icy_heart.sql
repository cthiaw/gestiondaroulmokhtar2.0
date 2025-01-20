/*
  # Make birth_date nullable and update validation

  1. Changes
    - Make birth_date column nullable
    - Update validation trigger to handle null birth dates
    - Add proper date validation
*/

-- Allow null birth_date
ALTER TABLE students 
  ALTER COLUMN birth_date DROP NOT NULL;

-- Update validation trigger
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

  -- Handle birth_date validation
  IF NEW.birth_date IS NOT NULL THEN
    -- Validate date format and range
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