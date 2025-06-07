/*
  # Add discount column to sales table and update monthly_sales view

  1. Changes to sales table
    - Add `discount` column with default value 0
    - Add check constraint to ensure discount is non-negative

  2. View updates
    - Drop existing monthly_sales view
    - Recreate monthly_sales view to account for discount in calculations
    - Update total_sales calculation to subtract discount from total_price

  3. Security
    - Maintain existing RLS policies
    - No changes to authentication or permissions
*/

-- Add discount column to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0 CHECK (discount >= 0);

-- Drop the existing view first
DROP VIEW IF EXISTS monthly_sales;

-- Recreate the monthly_sales view with discount consideration
CREATE VIEW monthly_sales AS
SELECT
  date_trunc('month', sale_date)::date AS month,
  SUM(total_price - discount) AS total_sales,
  COUNT(*) AS total_quantity
FROM sales
GROUP BY month
ORDER BY month;