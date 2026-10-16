/*
  # Align the schema with the application code (trimesters and max_score)

  The application saves grades and absences by trimester (1, 2, 3) with a
  max_score per grade, but the committed migrations still create `semester`
  (1, 2) and no max_score: the migrations that made this change were
  discarded from the repository even though they may already have run on the
  production database. A database rebuilt from this folder (new Supabase
  project, another host) therefore rejects every grade and absence the app
  saves.

  Every step checks the current state first, so running this on a database
  that already has these changes does nothing, and no row is deleted.
*/

DO $$
BEGIN
  -- grades: semester -> trimester
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'semester'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'trimester'
  ) THEN
    ALTER TABLE grades RENAME COLUMN semester TO trimester;
  END IF;

  ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_semester_check;
  ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_trimester_check;
  ALTER TABLE grades ADD CONSTRAINT grades_trimester_check CHECK (trimester IN (1, 2, 3));

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.grades'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (student_id, subject_id, trimester)'
  ) THEN
    ALTER TABLE grades
      ADD CONSTRAINT grades_student_id_subject_id_trimester_key
      UNIQUE (student_id, subject_id, trimester);
  END IF;

  -- grades: max_score (the score is out of max_score instead of always 20)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'max_score'
  ) THEN
    ALTER TABLE grades ADD COLUMN max_score numeric(5,2) NOT NULL DEFAULT 20;
  END IF;

  ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_score_check;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.grades'::regclass
      AND conname IN ('grades_score_range', 'grades_score_range_check')
  ) THEN
    ALTER TABLE grades
      ADD CONSTRAINT grades_score_range_check CHECK (score >= 0 AND score <= max_score);
  END IF;

  -- absences: semester -> trimester
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'absences' AND column_name = 'semester'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'absences' AND column_name = 'trimester'
  ) THEN
    ALTER TABLE absences RENAME COLUMN semester TO trimester;
  END IF;

  ALTER TABLE absences DROP CONSTRAINT IF EXISTS absences_semester_check;
  ALTER TABLE absences DROP CONSTRAINT IF EXISTS absences_trimester_check;
  ALTER TABLE absences ADD CONSTRAINT absences_trimester_check CHECK (trimester IN (1, 2, 3));
END $$;

CREATE INDEX IF NOT EXISTS idx_grades_student_trimester ON grades(student_id, trimester);
CREATE INDEX IF NOT EXISTS idx_absences_student_trimester ON absences(student_id, trimester);
