/*
  # Add specific subjects for French and Arabic classes

  1. Changes
    - Remove existing subjects
    - Add new specific subjects for each class type
    - Update coefficients

  2. Security
    - Maintain existing RLS policies
*/

-- First, remove existing subjects
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
('Observation', 2, 'FRANCAIS');

-- Insert Arabic subjects
INSERT INTO subjects (name, coefficient, class_type) VALUES
('Coran', 4, 'ARABE'),
('Hadith', 3, 'ARABE'),
('Conjugaison', 2, 'ARABE'),
('Grammaire', 3, 'ARABE'),
('Observation', 2, 'ARABE'),
('Sport', 1, 'ARABE'),
('Calcul', 3, 'ARABE'),
('Observation', 2, 'ARABE');