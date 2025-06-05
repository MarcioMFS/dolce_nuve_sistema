/*
  # Add Missing Foreign Key Relationships

  1. Changes
    - Add foreign key constraint between geladinho_stock and geladinhos tables
    - Add foreign key constraint between product_stock_entries and products tables

  2. Security
    - No changes to RLS policies
    - Existing table security remains unchanged

  3. Notes
    - ON DELETE CASCADE ensures related stock entries are removed when parent record is deleted
    - Indexes are automatically created for foreign key columns
*/

-- Add foreign key constraint for geladinho_stock table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_geladinho_stock_geladinho_id'
  ) THEN
    ALTER TABLE geladinho_stock
    ADD CONSTRAINT fk_geladinho_stock_geladinho_id
    FOREIGN KEY (geladinho_id)
    REFERENCES geladinhos(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for product_stock_entries table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_product_stock_entries_product_id'
  ) THEN
    ALTER TABLE product_stock_entries
    ADD CONSTRAINT fk_product_stock_entries_product_id
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;
  END IF;
END $$;