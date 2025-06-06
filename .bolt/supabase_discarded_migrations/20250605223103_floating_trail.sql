/*
  # Add Missing Foreign Key Relationships

  1. Changes
    - Add foreign key constraint between products and product_stock_entries
    - Add foreign key constraint between geladinhos and geladinho_stock
    - Update column names to match parent tables
    
  2. Notes
    - Using ON DELETE RESTRICT to prevent accidental deletions
    - Adding indexes for better query performance
*/

-- Add foreign key for product_stock_entries
ALTER TABLE product_stock_entries
DROP CONSTRAINT IF EXISTS product_stock_entries_product_id_fkey;

ALTER TABLE product_stock_entries
ADD CONSTRAINT product_stock_entries_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE RESTRICT;

-- Add foreign key for geladinho_stock
ALTER TABLE geladinho_stock
DROP CONSTRAINT IF EXISTS geladinho_stock_geladinho_id_fkey;

ALTER TABLE geladinho_stock
ADD CONSTRAINT geladinho_stock_geladinho_id_fkey
FOREIGN KEY (geladinho_id)
REFERENCES geladinhos(id)
ON DELETE RESTRICT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id
ON product_stock_entries(product_id);

CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id
ON geladinho_stock(geladinho_id);