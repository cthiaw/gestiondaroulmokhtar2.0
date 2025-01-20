-- Create function to handle student deletion
CREATE OR REPLACE FUNCTION delete_student(base_matricule TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete both French and Arabic records
  DELETE FROM students 
  WHERE matricule = base_matricule 
     OR matricule = base_matricule || '-AR';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_student TO authenticated;