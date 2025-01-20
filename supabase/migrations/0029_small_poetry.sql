/*
  # Fix invalid birth dates
  
  1. Changes
    - Update existing invalid dates to default format
    - Add stricter date format validation
    - Update date display handling
*/

-- Update any invalid dates to default format
UPDATE students 
SET birth_date = 'XX/XX/XXXX'
WHERE birth_date != 'XX/XX/XXXX' 
  AND birth_date !~ '^([0-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$';

-- Drop existing constraint if exists
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS birth_date_format_check;

-- Add updated constraint with stricter validation
ALTER TABLE students 
ADD CONSTRAINT birth_date_format_check 
CHECK (
  birth_date = 'XX/XX/XXXX' OR 
  (
    birth_date ~ '^([0-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'
    AND
    birth_date::text != '00/00/0000'
  )
);