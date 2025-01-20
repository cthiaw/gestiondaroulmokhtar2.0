/*
  # Handle null birth dates

  1. Changes
    - Update student update function to handle null birth dates
    - Add proper date validation

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Update the student update function to handle null birth dates
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
      WHEN p_french_data->>'birth_date' = '' THEN NULL
      WHEN p_french_data->>'birth_date' IS NULL THEN NULL
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
      WHEN p_arabic_data->>'birth_date' = '' THEN NULL
      WHEN p_arabic_data->>'birth_date' IS NULL THEN NULL
      ELSE (p_arabic_data->>'birth_date')::date
    END,
    gender = p_arabic_data->>'gender',
    level = p_arabic_data->>'level',
    class_type = p_arabic_data->>'class_type'
  WHERE matricule = p_base_matricule || '-AR';
END;
$$;