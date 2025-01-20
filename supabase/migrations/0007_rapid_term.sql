/*
  # Add staff reference to expenses table

  1. Changes
    - Add staff_id column to expenses table to link salary expenses to staff members
    - Add foreign key constraint to teachers table
    - Make the column nullable since not all expenses are salaries

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE expenses 
ADD COLUMN staff_id uuid REFERENCES teachers(id);

COMMENT ON COLUMN expenses.staff_id IS 'Reference to the staff member for salary expenses';