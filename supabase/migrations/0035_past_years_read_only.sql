/*
  # Past school years are read-only

  Grades, absences, payments and expenses can only be added, changed or
  deleted in the current school year. Past years stay readable.

  1. Changes
    - guard_current_school_year() refuses an insert, update or delete
      when the row belongs to another year than the current one.
    - A trigger on grades, absences, payments and expenses calls it.

  No row is changed by this migration.
*/

CREATE OR REPLACE FUNCTION guard_current_school_year()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.school_year_id IS DISTINCT FROM current_school_year_id() THEN
    RAISE EXCEPTION 'Année scolaire terminée : modification impossible'
      USING ERRCODE = 'check_violation';
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.school_year_id IS DISTINCT FROM current_school_year_id() THEN
    RAISE EXCEPTION 'Seule l''année scolaire en cours peut être modifiée'
      USING ERRCODE = 'check_violation';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grades_current_year_only ON grades;
CREATE TRIGGER grades_current_year_only
  BEFORE INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW EXECUTE FUNCTION guard_current_school_year();

DROP TRIGGER IF EXISTS absences_current_year_only ON absences;
CREATE TRIGGER absences_current_year_only
  BEFORE INSERT OR UPDATE OR DELETE ON absences
  FOR EACH ROW EXECUTE FUNCTION guard_current_school_year();

DROP TRIGGER IF EXISTS payments_current_year_only ON payments;
CREATE TRIGGER payments_current_year_only
  BEFORE INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION guard_current_school_year();

DROP TRIGGER IF EXISTS expenses_current_year_only ON expenses;
CREATE TRIGGER expenses_current_year_only
  BEFORE INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION guard_current_school_year();
