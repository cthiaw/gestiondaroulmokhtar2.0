/*
  # Archive students and subjects instead of deleting them

  For audit purposes, removing a student must keep their payments, grades
  and absences, and removing a subject must keep the grades given in it.

  1. Changes
    - `archived_at` on students and subjects: the app hides archived rows
      and "deleting" now sets this date.
    - delete_student() archives the French and Arabic records instead of
      deleting them.
    - The trigger that deleted a student's payments, grades and absences is
      removed, and the foreign keys to students and subjects no longer
      cascade: a hard delete of a student or subject that still has linked
      records is refused instead of erasing them.
    - Subject names only need to be unique among non-archived subjects, so a
      subject can be recreated after being archived.
    - count_unique_students() ignores archived students.

  No row is deleted or modified by this migration.
*/

ALTER TABLE students ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS archived_at timestamptz;

COMMENT ON COLUMN students.archived_at IS 'Set when the student is removed from the school; the row is kept for audit';
COMMENT ON COLUMN subjects.archived_at IS 'Set when the subject is removed; the row is kept so its grades stay readable';

-- Stop cascading deletes from students
DROP TRIGGER IF EXISTS student_delete_trigger ON students;
DROP FUNCTION IF EXISTS sync_student_records();

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_student_id_fkey,
  ADD CONSTRAINT payments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE grades
  DROP CONSTRAINT IF EXISTS grades_student_id_fkey,
  ADD CONSTRAINT grades_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

ALTER TABLE absences
  DROP CONSTRAINT IF EXISTS absences_student_id_fkey,
  ADD CONSTRAINT absences_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT;

-- Stop cascading deletes from subjects
ALTER TABLE grades
  DROP CONSTRAINT IF EXISTS grades_subject_id_fkey,
  ADD CONSTRAINT grades_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT;

-- Subject names unique among active subjects only
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_name_class_type_unique;
CREATE UNIQUE INDEX IF NOT EXISTS subjects_name_class_type_active_unique
  ON subjects(name, class_type)
  WHERE archived_at IS NULL;

-- "Deleting" a student archives both of their records
CREATE OR REPLACE FUNCTION delete_student(base_matricule TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE students
  SET archived_at = now()
  WHERE (matricule = base_matricule OR matricule = base_matricule || '-AR')
    AND archived_at IS NULL;
END;
$$;

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
  FROM students
  WHERE archived_at IS NULL;

  RETURN unique_count;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_students_active ON students(last_name) WHERE archived_at IS NULL;
