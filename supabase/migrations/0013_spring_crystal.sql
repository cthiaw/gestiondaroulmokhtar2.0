/*
  # Update subjects with correct coefficients

  1. Changes
    - Remove existing subjects
    - Add French subjects with correct coefficients
    - Add Arabic subjects with correct coefficients
*/

-- First, remove all subjects
TRUNCATE TABLE subjects CASCADE;

-- Insert French subjects
INSERT INTO subjects (name, coefficient, class_type) VALUES
('Orthographe', 3, 'FRANCAIS'),
('Vocabulaire', 2, 'FRANCAIS'),
('Conjugaison', 2, 'FRANCAIS'),
('Observation', 2, 'FRANCAIS'),
('Grammaire', 3, 'FRANCAIS'),
('Sport', 1, 'FRANCAIS'),
('Calcul', 3, 'FRANCAIS'),
('Sciences', 2, 'FRANCAIS');

-- Insert Arabic subjects
INSERT INTO subjects (name, coefficient, class_type) VALUES
('Coran', 4, 'ARABE'),
('Hadith', 3, 'ARABE'),
('Conjugaison', 2, 'ARABE'),
('Grammaire', 3, 'ARABE'),
('Observation', 2, 'ARABE'),
('Sport', 1, 'ARABE'),
('Calcul', 3, 'ARABE'),
('Education Islamique', 2, 'ARABE');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_class_type ON subjects(class_type);
CREATE INDEX IF NOT EXISTS idx_grades_student_semester ON grades(student_id, semester);