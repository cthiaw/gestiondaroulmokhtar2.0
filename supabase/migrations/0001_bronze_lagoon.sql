/*
  # Schéma initial pour l'application de gestion d'école

  1. Nouvelles Tables
    - `students` : Informations des élèves
      - `id` (uuid, clé primaire)
      - `first_name` (text)
      - `last_name` (text)
      - `birth_date` (date)
      - `gender` (text)
      - `created_at` (timestamp)
      - `class_id` (uuid, clé étrangère)
    
    - `teachers` : Informations des professeurs
      - `id` (uuid, clé primaire)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `created_at` (timestamp)
    
    - `classes` : Informations des classes
      - `id` (uuid, clé primaire)
      - `name` (text)
      - `level` (text)
      - `teacher_id` (uuid, clé étrangère)
      - `created_at` (timestamp)
    
    - `payments` : Suivi des paiements
      - `id` (uuid, clé primaire)
      - `student_id` (uuid, clé étrangère)
      - `amount` (integer)
      - `payment_date` (date)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `expenses` : Suivi des dépenses
      - `id` (uuid, clé primaire)
      - `description` (text)
      - `amount` (integer)
      - `expense_date` (date)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour les utilisateurs authentifiés
*/

-- Création des tables
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL,
  class_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL,
  teacher_id uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ADD CONSTRAINT fk_class
  FOREIGN KEY (class_id) REFERENCES classes(id);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  amount integer NOT NULL,
  payment_date date NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount integer NOT NULL,
  expense_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Accès complet pour les administrateurs"
ON students FOR ALL TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Lecture pour les secrétaires"
ON students FOR SELECT TO authenticated
USING (auth.jwt() ->> 'role' = 'secretary');

-- Répéter les politiques similaires pour les autres tables