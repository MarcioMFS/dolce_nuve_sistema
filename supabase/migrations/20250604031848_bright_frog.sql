/*
  # Add purchase date to products table

  1. Changes
    - Add `purchase_date` column to `products` table
    - Set default value to current timestamp
    - Make column not nullable to maintain data integrity

  2. Notes
    - Using timestamptz to store timezone-aware timestamps
    - Adding column as NOT NULL with DEFAULT to ensure all existing rows get a value
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'purchase_date'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN purchase_date timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;