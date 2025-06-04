/*
  # Add price columns to products table

  1. Changes
    - Add unit_price column to store the calculated price per unit
    - Add standard_price column to store the standardized price (per kg/L/unit)
    
  2. Notes
    - Both columns are numeric to store precise decimal values
    - Columns are nullable since they're calculated values
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_price numeric,
ADD COLUMN IF NOT EXISTS standard_price numeric;