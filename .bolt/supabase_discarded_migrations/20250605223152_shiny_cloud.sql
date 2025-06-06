/*
  # Add Missing Foreign Key Relationships

  1. Changes
    - Add foreign key from product_stock_entries to products
    - Add foreign key from geladinho_stock to geladinhos
    
  2. Notes
    - Using ON DELETE RESTRICT to prevent deletion of referenced records
    - Adding indexes for better query performance
*/

-- Add foreign key for product_stock_entries
ALTER TABLE product_stock_entries
DROP CONSTRAINT IF EXISTS fk_product_stock_entries_product_id,
ADD CONSTRAINT fk_product_stock_entries_product_id
FOREIGN KEY (product_id) 
REFERENCES products(id)
ON DELETE RESTRICT;

-- Add foreign key for geladinho_stock
ALTER TABLE geladinho_stock
DROP CONSTRAINT IF EXISTS fk_geladinho_stock_geladinho_id,
ADD CONSTRAINT fk_geladinho_stock_geladinho_id
FOREIGN KEY (geladinho_id) 
REFERENCES geladinhos(id)
ON DELETE RESTRICT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_stock_entries_product_id 
ON product_stock_entries(product_id);

CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id 
ON geladinho_stock(geladinho_id);