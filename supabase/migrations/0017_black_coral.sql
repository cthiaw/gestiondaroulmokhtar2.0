/*
  # Add Divers to expense types

  1. Changes
    - Add 'DIVERS' to the valid expense types in the CHECK constraint
*/

-- First, drop the existing check constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expense_type_check;

-- Add new check constraint with DIVERS
ALTER TABLE expenses ADD CONSTRAINT expense_type_check CHECK (
  expense_type IN ('SALAIRE', 'ELECTRICITE', 'EAU', 'INTERNET', 'DIVERS')
);