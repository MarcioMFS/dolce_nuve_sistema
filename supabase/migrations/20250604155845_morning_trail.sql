/*
  # Add calculated price columns

  1. Changes
    - Add unit_price column for price per base unit (g/ml/un)
    - Add standard_price column for price per standard unit (kg/L/un)
    
  2. Notes
    - Using numeric type for precise decimal calculations
    - Columns are nullable since they are calculated values
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_price numeric,
ADD COLUMN IF NOT EXISTS standard_price numeric;