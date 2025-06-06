/*
  # Add payment method to sales table

  1. Changes
    - Add payment_method column
    - Update monthly sales view
*/

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE sales 
    ADD COLUMN payment_method text CHECK (payment_method IN ('Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito'));
  END IF;
END $$;

-- Drop and recreate monthly sales view
DROP VIEW IF EXISTS monthly_sales;
CREATE VIEW monthly_sales AS
SELECT 
  date_trunc('month', sale_date)::date as month,
  SUM(quantity) as total_quantity,
  SUM(total_price) as total_revenue
FROM sales s
GROUP BY date_trunc('month', sale_date)::date
ORDER BY month DESC;