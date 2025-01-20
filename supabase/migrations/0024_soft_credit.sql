-- Create function to count unique students (without -AR suffix)
CREATE OR REPLACE FUNCTION count_unique_students()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  unique_count integer;
BEGIN
  SELECT COUNT(DISTINCT 
    CASE 
      WHEN matricule LIKE '%-AR' THEN LEFT(matricule, -3)
      ELSE matricule 
    END
  ) INTO unique_count
  FROM students;
  
  RETURN unique_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION count_unique_students TO authenticated;