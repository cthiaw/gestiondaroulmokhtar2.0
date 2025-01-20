/*
  # Update RLS policies

  1. Changes
    - Remove restrictive policies
    - Add new policies for all tables
    - Enable full access for authenticated users
    
  2. Security
    - Enable RLS on all tables
    - Add consistent policies across tables
*/

-- Students table policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for authenticated users"
ON students
TO authenticated
USING (true)
WITH CHECK (true);

-- Teachers table policies
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for authenticated users"
ON teachers
TO authenticated
USING (true)
WITH CHECK (true);

-- Classes table policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for authenticated users"
ON classes
TO authenticated
USING (true)
WITH CHECK (true);

-- Payments table policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for authenticated users"
ON payments
TO authenticated
USING (true)
WITH CHECK (true);

-- Expenses table policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for authenticated users"
ON expenses
TO authenticated
USING (true)
WITH CHECK (true);