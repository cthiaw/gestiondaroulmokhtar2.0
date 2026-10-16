/*
  # Organize the school by school year (année scolaire)

  The Senegalese school year starts in October, so a year runs from
  1 October to 30 September.

  1. New tables
    - `school_years`: one row per year (2024-2025, 2025-2026, 2026-2027);
      exactly one is marked `is_current` (2026-2027).
    - `enrollments`: which students are enrolled in which year, with the
      level they have that year. A student keeps the same matricule from one
      year to the next; re-enrolling adds a row here.

  2. Changes
    - `grades`, `absences`, `payments` and `expenses` get a `school_year_id`.
      New rows default to the current year, so the previous version of the
      app keeps working while the new one is being published.
    - Grades and absences are unique per student, trimester (and subject)
      within a year, instead of across all years.
    - A new student is enrolled in the current year automatically.
    - `students.level` stays the student's level in their latest year.

  3. Existing data
    - Every existing row is attached to the year its date falls in
      (created_at for students, grades and absences; payment_date and
      expense_date for finances). Today that puts students, grades,
      absences and payments in 2024-2025 and the November 2025 salaries in
      2025-2026.

  No row is deleted.
*/

-- 1. School years
CREATE TABLE IF NOT EXISTS school_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT school_years_dates_check CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS school_years_single_current
  ON school_years(is_current)
  WHERE is_current;

ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON school_years;
CREATE POLICY "Enable read for authenticated users" ON school_years
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON school_years;
CREATE POLICY "Enable insert for authenticated users" ON school_years
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users" ON school_years;
CREATE POLICY "Enable update for authenticated users" ON school_years
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO school_years (label, start_date, end_date, is_current) VALUES
  ('2024-2025', '2024-10-01', '2025-09-30', false),
  ('2025-2026', '2025-10-01', '2026-09-30', false),
  ('2026-2027', '2026-10-01', '2027-09-30', true)
ON CONFLICT (label) DO NOTHING;

CREATE OR REPLACE FUNCTION current_school_year_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM school_years WHERE is_current LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION school_year_for_date(d date)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM school_years
  WHERE d BETWEEN start_date AND end_date
  ORDER BY start_date
  LIMIT 1;
$$;

-- 2. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  school_year_id uuid NOT NULL REFERENCES school_years(id) ON DELETE RESTRICT,
  level text NOT NULL CHECK (level IN ('PS', 'GS', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2')),
  class_type text NOT NULL CHECK (class_type IN ('FRANCAIS', 'ARABE')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT enrollments_student_year_unique UNIQUE (student_id, school_year_id)
);

COMMENT ON TABLE enrollments IS 'Enrollment of a student record (French or Arabic) in a school year, with its level that year';

CREATE INDEX IF NOT EXISTS idx_enrollments_year_class
  ON enrollments(school_year_id, class_type, level);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON enrollments;
CREATE POLICY "Enable read for authenticated users" ON enrollments
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON enrollments;
CREATE POLICY "Enable insert for authenticated users" ON enrollments
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users" ON enrollments;
CREATE POLICY "Enable update for authenticated users" ON enrollments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON enrollments;
CREATE POLICY "Enable delete for authenticated users" ON enrollments
  FOR DELETE TO authenticated USING (true);

INSERT INTO enrollments (student_id, school_year_id, level, class_type)
SELECT
  s.id,
  COALESCE(school_year_for_date(s.created_at::date), current_school_year_id()),
  s.level,
  s.class_type
FROM students s
ON CONFLICT (student_id, school_year_id) DO NOTHING;

-- A new student is enrolled in the current year
CREATE OR REPLACE FUNCTION enroll_new_student()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_school_year_id() IS NOT NULL THEN
    INSERT INTO enrollments (student_id, school_year_id, level, class_type)
    VALUES (NEW.id, current_school_year_id(), NEW.level, NEW.class_type)
    ON CONFLICT (student_id, school_year_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_enroll_new ON students;
CREATE TRIGGER students_enroll_new
  AFTER INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION enroll_new_student();

-- students.level is the level of the latest year: changing it (e.g. from the
-- previous version of the app) updates that year's enrollment
CREATE OR REPLACE FUNCTION sync_latest_enrollment_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE enrollments e
  SET level = NEW.level
  WHERE e.id = (
    SELECT e2.id
    FROM enrollments e2
    JOIN school_years y ON y.id = e2.school_year_id
    WHERE e2.student_id = NEW.id
    ORDER BY y.start_date DESC
    LIMIT 1
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_sync_enrollment_level ON students;
CREATE TRIGGER students_sync_enrollment_level
  AFTER UPDATE OF level ON students
  FOR EACH ROW
  WHEN (OLD.level IS DISTINCT FROM NEW.level)
  EXECUTE FUNCTION sync_latest_enrollment_level();

-- 3. Year on grades, absences, payments and expenses
ALTER TABLE grades ADD COLUMN IF NOT EXISTS school_year_id uuid REFERENCES school_years(id) ON DELETE RESTRICT;
ALTER TABLE absences ADD COLUMN IF NOT EXISTS school_year_id uuid REFERENCES school_years(id) ON DELETE RESTRICT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS school_year_id uuid REFERENCES school_years(id) ON DELETE RESTRICT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS school_year_id uuid REFERENCES school_years(id) ON DELETE RESTRICT;

UPDATE grades SET school_year_id = COALESCE(school_year_for_date(created_at::date), current_school_year_id())
WHERE school_year_id IS NULL;
UPDATE absences SET school_year_id = COALESCE(school_year_for_date(created_at::date), current_school_year_id())
WHERE school_year_id IS NULL;
UPDATE payments SET school_year_id = COALESCE(school_year_for_date(payment_date), current_school_year_id())
WHERE school_year_id IS NULL;
UPDATE expenses SET school_year_id = COALESCE(school_year_for_date(expense_date), current_school_year_id())
WHERE school_year_id IS NULL;

ALTER TABLE grades ALTER COLUMN school_year_id SET DEFAULT current_school_year_id();
ALTER TABLE absences ALTER COLUMN school_year_id SET DEFAULT current_school_year_id();
ALTER TABLE payments ALTER COLUMN school_year_id SET DEFAULT current_school_year_id();
ALTER TABLE expenses ALTER COLUMN school_year_id SET DEFAULT current_school_year_id();

ALTER TABLE grades ALTER COLUMN school_year_id SET NOT NULL;
ALTER TABLE absences ALTER COLUMN school_year_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN school_year_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN school_year_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_school_year ON payments(school_year_id);
CREATE INDEX IF NOT EXISTS idx_expenses_school_year ON expenses(school_year_id);

-- Grades and absences are unique within a year
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_id_subject_id_trimester_key;
ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_student_subject_trimester_year_key;
ALTER TABLE grades
  ADD CONSTRAINT grades_student_subject_trimester_year_key
  UNIQUE (student_id, subject_id, trimester, school_year_id);

ALTER TABLE absences DROP CONSTRAINT IF EXISTS absences_student_id_trimester_key;
ALTER TABLE absences DROP CONSTRAINT IF EXISTS absences_student_trimester_year_key;
ALTER TABLE absences
  ADD CONSTRAINT absences_student_trimester_year_key
  UNIQUE (student_id, trimester, school_year_id);

-- 4. Functions used by the app

-- Enroll (or re-enroll) both records of a student in a year
CREATE OR REPLACE FUNCTION enroll_student(
  p_base_matricule text,
  p_school_year_id uuid,
  p_french_level text,
  p_arabic_level text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO enrollments (student_id, school_year_id, level, class_type)
  SELECT
    s.id,
    p_school_year_id,
    CASE WHEN s.matricule LIKE '%-AR' THEN p_arabic_level ELSE p_french_level END,
    s.class_type
  FROM students s
  WHERE s.matricule IN (p_base_matricule, p_base_matricule || '-AR')
    AND s.archived_at IS NULL
  ON CONFLICT (student_id, school_year_id) DO UPDATE SET level = EXCLUDED.level;

  PERFORM refresh_student_level(p_base_matricule);
END;
$$;

-- Update a student's details, and their levels for one year
CREATE OR REPLACE FUNCTION update_student_in_year(
  p_base_matricule text,
  p_school_year_id uuid,
  p_french_data jsonb,
  p_arabic_data jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE students
  SET
    first_name = p_french_data->>'first_name',
    last_name = p_french_data->>'last_name',
    birth_date = COALESCE(NULLIF(p_french_data->>'birth_date', ''), '-'),
    gender = p_french_data->>'gender'
  WHERE matricule IN (p_base_matricule, p_base_matricule || '-AR');

  UPDATE enrollments e
  SET level = CASE
    WHEN s.matricule LIKE '%-AR' THEN p_arabic_data->>'level'
    ELSE p_french_data->>'level'
  END
  FROM students s
  WHERE s.id = e.student_id
    AND e.school_year_id = p_school_year_id
    AND s.matricule IN (p_base_matricule, p_base_matricule || '-AR');

  PERFORM refresh_student_level(p_base_matricule);
END;
$$;

-- Set students.level to the level of the student's latest year
CREATE OR REPLACE FUNCTION refresh_student_level(p_base_matricule text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE students s
  SET level = latest.level
  FROM (
    SELECT DISTINCT ON (e.student_id) e.student_id, e.level
    FROM enrollments e
    JOIN school_years y ON y.id = e.school_year_id
    JOIN students st ON st.id = e.student_id
    WHERE st.matricule IN (p_base_matricule, p_base_matricule || '-AR')
    ORDER BY e.student_id, y.start_date DESC
  ) latest
  WHERE s.id = latest.student_id
    AND s.level IS DISTINCT FROM latest.level;
END;
$$;
