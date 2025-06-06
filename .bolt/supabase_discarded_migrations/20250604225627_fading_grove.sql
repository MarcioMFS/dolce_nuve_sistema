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
CREATE TABLE products_backup AS SELECT * FROM products;

-- Update the unit_measure type
ALTER TYPE unit_measure RENAME TO unit_measure_old;
CREATE TYPE unit_measure AS ENUM ('gramas');

-- Convert existing data
UPDATE products
SET 
  unit_of_measure = 'gramas'::unit_measure,
  total_quantity = CASE 
    WHEN unit_of_measure = 'litros' THEN total_quantity * 1000
    ELSE total_quantity
  END
WHERE unit_of_measure != 'gramas';

-- Drop old type
DROP TYPE unit_measure_old;

-- Add constraint to ensure only grams are used
ALTER TABLE products 
  ALTER COLUMN unit_of_measure SET DEFAULT 'gramas',
  ALTER COLUMN unit_of_measure SET NOT NULL;