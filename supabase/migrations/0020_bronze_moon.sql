-- Add cascade delete to payments table
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_student_id_fkey,
ADD CONSTRAINT payments_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES students(id) 
ON DELETE CASCADE;

-- Add cascade delete to grades table
ALTER TABLE grades
DROP CONSTRAINT IF EXISTS grades_student_id_fkey,
ADD CONSTRAINT grades_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES students(id) 
ON DELETE CASCADE;

-- Add cascade delete to absences table
ALTER TABLE absences
DROP CONSTRAINT IF EXISTS absences_student_id_fkey,
ADD CONSTRAINT absences_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES students(id) 
ON DELETE CASCADE;