/*
  # Add absences tracking

  1. New Tables
    - `absences`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `semester` (integer)
      - `count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `absences` table
    - Add policies for authenticated users
*/

-- Create absences table
CREATE TABLE absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  count integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, semester)
);

-- Enable RLS
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
ON absences FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON absences FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON absences FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_absences_student_semester ON absences(student_id, semester);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_absences_updated_at
    BEFORE UPDATE ON absences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE absences IS 'Tracks student absences per semester';
COMMENT ON COLUMN absences.semester IS 'Semester number (1 or 2)';
COMMENT ON COLUMN absences.count IS 'Number of absences in the semester';