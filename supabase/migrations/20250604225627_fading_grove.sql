/*
  # Update unit measure to only use grams

  1. Changes
    - Modify unit_measure type to only allow 'gramas'
    - Update existing records to use 'gramas'

  2. Data Migration
    - Convert existing measurements to grams
    - litros -> grams (multiply by 1000)
    - unidades -> no conversion needed, set to grams
*/

-- First create a backup of the current data
CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;

-- Update the unit_measure type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_measure') THEN
    ALTER TYPE unit_measure RENAME TO unit_measure_old;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_measure') THEN
    CREATE TYPE unit_measure AS ENUM ('gramas');
  END IF;
END $$;

-- Convert existing data
UPDATE products
SET
  unit_of_measure = 'gramas',
  total_quantity = CASE
    WHEN unit_of_measure = 'litros' THEN total_quantity * 1000
    ELSE total_quantity
  END
WHERE unit_of_measure != 'gramas';

-- Change column to use the new type
ALTER TABLE products
  ALTER COLUMN unit_of_measure TYPE unit_measure USING unit_of_measure::text::unit_measure,
  ALTER COLUMN unit_of_measure SET DEFAULT 'gramas',
  ALTER COLUMN unit_of_measure SET NOT NULL;

-- Drop old type if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_measure_old') THEN
    DROP TYPE unit_measure_old;
  END IF;
END $$;
