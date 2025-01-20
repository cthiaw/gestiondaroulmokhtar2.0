/*
  # Add grades management

  1. New Tables
    - `subjects`: List of subjects taught
      - `id` (uuid, primary key)
      - `name` (text, subject name)
      - `coefficient` (integer, subject weight)
      - `class_type` (text, FRANCAIS/ARABE)
    
    - `grades`
      - `id` (uuid, primary key)
      - `student_id` (uuid, reference to students)
      - `subject_id` (uuid, reference to subjects)
      - `semester` (integer, 1 or 2)
      - `score` (numeric, between 0 and 20)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create subjects table
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coefficient integer NOT NULL DEFAULT 1,
  class_type text NOT NULL,
  CONSTRAINT subjects_class_type_check CHECK (class_type IN ('FRANCAIS', 'ARABE'))
);

-- Create grades table
CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  score numeric(4,2) NOT NULL CHECK (score >= 0 AND score <= 20),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id, semester)
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable full access for authenticated users"
ON subjects FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable full access for authenticated users"
ON grades FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default subjects
INSERT INTO subjects (name, coefficient, class_type) VALUES
-- French subjects
('Français', 5, 'FRANCAIS'),
('Mathématiques', 5, 'FRANCAIS'),
('Histoire-Géographie', 2, 'FRANCAIS'),
('Sciences', 3, 'FRANCAIS'),
('Education Civique', 1, 'FRANCAIS'),
-- Arabic subjects
('Arabe', 5, 'ARABE'),
('Coran', 5, 'ARABE'),
('Education Islamique', 3, 'ARABE');