-- Create function to handle student updates
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
    birth_date = (p_french_data->>'birth_date')::date,
    gender = p_french_data->>'gender',
    level = p_french_data->>'level',
    class_type = p_french_data->>'class_type'
  WHERE matricule = p_base_matricule;

  -- Update Arabic record
  UPDATE students 
  SET 
    first_name = p_arabic_data->>'first_name',
    last_name = p_arabic_data->>'last_name',
    birth_date = (p_arabic_data->>'birth_date')::date,
    gender = p_arabic_data->>'gender',
    level = p_arabic_data->>'level',
    class_type = p_arabic_data->>'class_type'
  WHERE matricule = p_base_matricule || '-AR';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_student TO authenticated;