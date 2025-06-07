/*
  # Add discount to sales

  1. Changes
    - Add discount column to sales table with default 0
    - Update monthly_sales view to subtract discount from total_price
*/

ALTER TABLE sales
ADD COLUMN discount numeric NOT NULL DEFAULT 0 CHECK (discount >= 0);

-- Update monthly_sales view
CREATE OR REPLACE VIEW monthly_sales AS
SELECT
  date_trunc('month', sale_date)::date AS month,
  SUM(total_price - discount) AS total_sales
FROM sales
GROUP BY month
ORDER BY month;
