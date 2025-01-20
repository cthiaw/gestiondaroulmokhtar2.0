/*
  # Convert birth_date format
  
  1. Changes
    - Add temporary column
    - Set default format for dates
    - Ensure proper text format validation
    
  2. Format
    - Valid date format: DD/MM/YYYY
    - Default placeholder: XX/XX/XXXX
*/

-- Add temporary column
ALTER TABLE students 
ADD COLUMN birth_date_text text DEFAULT 'XX/XX/XXXX' NOT NULL;

-- Copy existing data with default value
UPDATE students 
SET birth_date_text = COALESCE(birth_date, 'XX/XX/XXXX');

-- Drop old column
ALTER TABLE students 
DROP COLUMN birth_date;

-- Rename new column
ALTER TABLE students 
RENAME COLUMN birth_date_text TO birth_date;

-- Add check constraint for valid format
ALTER TABLE students 
ADD CONSTRAINT birth_date_format_check 
CHECK (
  birth_date = 'XX/XX/XXXX' OR 
  birth_date ~ '^([0-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
);

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

  -- Set default birth_date if null
  IF NEW.birth_date IS NULL THEN
    NEW.birth_date := 'XX/XX/XXXX';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS student_validation_trigger ON students;

CREATE TRIGGER student_validation_trigger
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();