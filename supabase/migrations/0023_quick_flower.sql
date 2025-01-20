-- Create trigger to cascade updates to related records
CREATE OR REPLACE FUNCTION sync_student_records()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Cascade delete to related records
    DELETE FROM payments WHERE student_id = OLD.id;
    DELETE FROM grades WHERE student_id = OLD.id;
    DELETE FROM absences WHERE student_id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for student deletions
CREATE TRIGGER student_delete_trigger
  BEFORE DELETE ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_records();

-- Create function to validate student data
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
CREATE TRIGGER student_validation_trigger
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();