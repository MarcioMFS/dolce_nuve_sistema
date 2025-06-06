/*
  # Add Foreign Key Constraints for Stock Tables

  1. Changes
    - Add foreign key constraint between product_stock_entries and products tables
    - Add foreign key constraint between geladinho_stock and geladinhos tables
    
  2. Security
    - No changes to RLS policies
    - Maintains existing table security settings
*/

-- Add foreign key constraint for product_stock_entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'product_stock_entries_product_id_fkey'
  ) THEN
    ALTER TABLE product_stock_entries
    ADD CONSTRAINT product_stock_entries_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for geladinho_stock
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'geladinho_stock_geladinho_id_fkey'
  ) THEN
    ALTER TABLE geladinho_stock
    ADD CONSTRAINT geladinho_stock_geladinho_id_fkey
    FOREIGN KEY (geladinho_id) REFERENCES geladinhos(id)
    ON DELETE CASCADE;
  END IF;
END $$;