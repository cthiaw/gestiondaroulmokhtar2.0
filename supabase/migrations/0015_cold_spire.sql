/*
  # Role-based access policies

  1. Security Changes
    - Add RLS policies for each table based on user roles
    - ADMIN role has full access to all tables
    - SECRETAIRE role has limited access
    - PROFESSEUR role has specific access to educational data

  2. Policies
    - Students table: All roles can read, ADMIN and SECRETAIRE can manage
    - Classes table: All roles can read, ADMIN can manage
    - Teachers table: All roles can read, ADMIN can manage
    - Payments table: ADMIN and SECRETAIRE can access
    - Expenses table: ADMIN and SECRETAIRE can access
    - Grades table: ADMIN and PROFESSEUR can manage
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON classes;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON teachers;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON grades;

-- Students table policies
CREATE POLICY "Allow read access to all authenticated users"
ON students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow write access to admins and secretaires"
ON students FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'));

CREATE POLICY "Allow update access to admins and secretaires"
ON students FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'))
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'));

CREATE POLICY "Allow delete access to admins and secretaires"
ON students FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'));

-- Classes table policies
CREATE POLICY "Allow read access to all authenticated users"
ON classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow write access to admins"
ON classes FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- Teachers table policies
CREATE POLICY "Allow read access to all authenticated users"
ON teachers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow write access to admins"
ON teachers FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- Payments table policies
CREATE POLICY "Allow access to admins and secretaires"
ON payments FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'))
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'));

-- Expenses table policies
CREATE POLICY "Allow access to admins and secretaires"
ON expenses FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'))
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'SECRETAIRE'));

-- Grades table policies
CREATE POLICY "Allow read access to all authenticated users"
ON grades FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow write access to admins and professeurs"
ON grades FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'PROFESSEUR'));

CREATE POLICY "Allow update access to admins and professeurs"
ON grades FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'PROFESSEUR'))
WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'PROFESSEUR'));

CREATE POLICY "Allow delete access to admins and professeurs"
ON grades FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'PROFESSEUR'));