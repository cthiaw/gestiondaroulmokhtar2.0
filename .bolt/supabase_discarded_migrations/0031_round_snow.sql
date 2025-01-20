/*
  # Convert birth_date to nullable date type
  
  1. Changes
    - Drop existing validation trigger
    - Add new date column
    - Convert valid dates using safe conversion
    - Drop old text column
    - Create new validation trigger
    - Update student update function
*/

-- First drop the existing validation trigger and function
DROP TRIGGER IF EXISTS student_validation_trigger ON students;
DROP FUNCTION IF EXISTS validate_student_data();

-- Add new date column
ALTER TABLE students 
ADD COLUMN birth_date_new date;

-- Create function to safely convert dates
CREATE OR REPLACE FUNCTION try_to_date(text_date text)
RETURNS date AS $$
BEGIN
    RETURN to_date(text_date, 'DD/MM/YYYY');
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Convert existing data with safe date conversion
UPDATE students 
SET birth_date_new = try_to_date(birth_date);

-- Drop the conversion function as it's no longer needed
DROP FUNCTION try_to_date(text);

-- Drop old column and rename new one
ALTER TABLE students 
DROP COLUMN birth_date;

ALTER TABLE students 
ALTER COLUMN birth_date_new SET DEFAULT NULL;

ALTER TABLE students 
RENAME COLUMN birth_date_new TO birth_date;

-- Create new validation function for date
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
    -- Validate date is not in the future
    IF NEW.birth_date > CURRENT_DATE THEN
      RAISE EXCEPTION 'Birth date cannot be in the future';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new validation trigger
CREATE TRIGGER student_validation_trigger
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();

-- Update function to handle dates properly
CREATE OR REPLACE FUNCTION update_student(
  p_id UUID,
  p_base_matricule TEXT,
  p_french_data JSONB,
  p_arabic_data JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update French record
  UPDATE students 
  SET 
    first_name = p_french_data->>'first_name',
    last_name = p_french_data->>'last_name',
    birth_date = CASE 
      WHEN NULLIF(TRIM(p_french_data->>'birth_date'), '') IS NULL THEN NULL
      ELSE (p_french_data->>'birth_date')::date
    END,
    gender = p_french_data->>'gender',
    level = p_french_data->>'level',
    class_type = p_french_data->>'class_type'
  WHERE matricule = p_base_matricule;

  -- Update Arabic record
  UPDATE students 
  SET 
    first_name = p_arabic_data->>'first_name',
    last_name = p_arabic_data->>'last_name',
    birth_date = CASE 
      WHEN NULLIF(TRIM(p_arabic_data->>'birth_date'), '') IS NULL THEN NULL
      ELSE (p_arabic_data->>'birth_date')::date
    END,
    gender = p_arabic_data->>'gender',
    level = p_arabic_data->>'level',
    class_type = p_arabic_data->>'class_type'
  WHERE matricule = p_base_matricule || '-AR';
END;
$$;