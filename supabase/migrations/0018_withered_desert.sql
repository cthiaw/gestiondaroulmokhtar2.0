/*
# Add subjects constraints and indexes

1. Changes
  - Add unique constraint on name + class_type
  - Add coefficient range constraint
  - Add performance indexes

2. Security
  - Update existing RLS policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subjects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON subjects;

-- Add unique constraint
ALTER TABLE subjects 
DROP CONSTRAINT IF EXISTS subjects_name_class_type_unique;

ALTER TABLE subjects 
ADD CONSTRAINT subjects_name_class_type_unique 
UNIQUE (name, class_type);

-- Add coefficient constraint
ALTER TABLE subjects 
DROP CONSTRAINT IF EXISTS subjects_coefficient_check;

ALTER TABLE subjects 
ADD CONSTRAINT subjects_coefficient_check 
CHECK (coefficient >= 1 AND coefficient <= 10);

-- Add index for performance
DROP INDEX IF EXISTS idx_subjects_name_class_type;

CREATE INDEX idx_subjects_name_class_type 
ON subjects(name, class_type);

-- Create new RLS policies
CREATE POLICY "subjects_select_policy"
ON subjects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "subjects_insert_policy"
ON subjects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "subjects_update_policy"
ON subjects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "subjects_delete_policy"
ON subjects FOR DELETE
TO authenticated
USING (true);