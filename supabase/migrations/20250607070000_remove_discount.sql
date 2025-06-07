/*
  # Remove discount column from sales

  1. Changes
    - Drop discount column from sales table
    - Restore monthly_sales view to sum total_price
*/

ALTER TABLE sales
DROP COLUMN IF EXISTS discount;

CREATE OR REPLACE VIEW monthly_sales AS
SELECT
  date_trunc('month', sale_date)::date AS month,
  SUM(total_price) AS total_sales,
  SUM(quantity) AS total_quantity
FROM sales
GROUP BY month
ORDER BY month;
