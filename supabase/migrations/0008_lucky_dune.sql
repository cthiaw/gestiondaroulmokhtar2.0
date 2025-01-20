/*
  # Create receipts table and storage

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `payment_id` (uuid, references payments)
      - `receipt_number` (text, unique)
      - `file_url` (text)
      - `generated_at` (timestamptz)

  2. Storage
    - Create receipts bucket for storing receipt files
*/

-- Create receipts table
CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) NOT NULL,
  receipt_number text UNIQUE NOT NULL,
  file_url text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable full access for authenticated users"
ON receipts
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_receipts_payment_id ON receipts(payment_id);