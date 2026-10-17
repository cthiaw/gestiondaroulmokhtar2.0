/*
  # Maître / Maîtresse and grading scales (barèmes)

  In elementary school a teacher is called « Maître » (man) or
  « Maîtresse » (woman), and each class grades each subject on its own
  scale (sur 10, 20, 50…).

  1. Maître / Maîtresse
    - `teachers.gender` ('M' or 'F'), used to show Maître or Maîtresse.
    - The staff type and user role `PROFESSEUR` become `MAITRE`.

  2. Grading scales
    - `grading_scales`: the scale (max_score) of a subject in a class for a
      school year, set by the class's maître or maîtresse. Past years are
      read-only, like grades.
    - The 2026-2027 scales are pre-filled with the scale most used per class
      and subject in earlier years. They can be changed.
    - `grades.max_score` keeps the scale each grade was given with, so
      existing grades and report cards do not change.

  3. Report card average
    - `school_years.average_out_of`: the scale the average is shown on.
      Elementary averages are given sur 10 from 2026-2027; earlier years
      stay sur 20 so their report cards do not change.

  Every step is idempotent. No row is deleted.
*/

-- 1. Maître / Maîtresse
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_gender_check;
ALTER TABLE teachers ADD CONSTRAINT teachers_gender_check
  CHECK (gender IS NULL OR gender IN ('M', 'F'));

ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_staff_type_check;
UPDATE teachers SET staff_type = 'MAITRE' WHERE staff_type = 'PROFESSEUR';
ALTER TABLE teachers ADD CONSTRAINT teachers_staff_type_check
  CHECK (staff_type IN ('MAITRE', 'SECRETAIRE', 'GARDIEN'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
UPDATE users SET role = 'MAITRE' WHERE role = 'PROFESSEUR';
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('ADMIN', 'SECRETAIRE', 'MAITRE'));
COMMENT ON COLUMN users.role IS 'User role: ADMIN, SECRETAIRE, or MAITRE';

-- 2. Grading scales
CREATE TABLE IF NOT EXISTS grading_scales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_year_id uuid NOT NULL REFERENCES school_years(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  max_score integer NOT NULL CHECK (max_score > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE (school_year_id, class_id, subject_id)
);

ALTER TABLE grading_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON grading_scales;
CREATE POLICY "Enable read for authenticated users" ON grading_scales
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON grading_scales;
CREATE POLICY "Enable write for authenticated users" ON grading_scales
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users" ON grading_scales;
CREATE POLICY "Enable update for authenticated users" ON grading_scales
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON grading_scales;
CREATE POLICY "Enable delete for authenticated users" ON grading_scales
  FOR DELETE TO authenticated USING (true);

-- Pre-fill the current year with the scale most used per class and subject
INSERT INTO grading_scales (school_year_id, class_id, subject_id, max_score)
SELECT DISTINCT ON (c.id, g.subject_id)
  current_school_year_id(), c.id, g.subject_id, g.max_score
FROM grades g
JOIN enrollments e ON e.student_id = g.student_id AND e.school_year_id = g.school_year_id
JOIN classes c ON c.level = e.level AND c.class_type = e.class_type
GROUP BY c.id, g.subject_id, g.max_score
ORDER BY c.id, g.subject_id, count(*) DESC, g.max_score
ON CONFLICT (school_year_id, class_id, subject_id) DO NOTHING;

-- Created after the pre-fill, which writes the current year only anyway
DROP TRIGGER IF EXISTS grading_scales_current_year_only ON grading_scales;
CREATE TRIGGER grading_scales_current_year_only
  BEFORE INSERT OR UPDATE OR DELETE ON grading_scales
  FOR EACH ROW EXECUTE FUNCTION guard_current_school_year();

-- 3. Report card average
ALTER TABLE school_years ADD COLUMN IF NOT EXISTS average_out_of integer NOT NULL DEFAULT 10;
UPDATE school_years SET average_out_of = 20 WHERE start_date < '2026-10-01';
ALTER TABLE school_years DROP CONSTRAINT IF EXISTS school_years_average_out_of_check;
ALTER TABLE school_years ADD CONSTRAINT school_years_average_out_of_check
  CHECK (average_out_of IN (10, 20));
