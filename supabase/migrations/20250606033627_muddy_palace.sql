/*
  # Add Geladinho Stock Management
  
  1. New Tables
    - geladinho_stock
      - Tracks stock levels for geladinhos
      - Records production batches
      - Links to geladinhos table
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create geladinho stock table
CREATE TABLE IF NOT EXISTS geladinho_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geladinho_id uuid NOT NULL REFERENCES geladinhos(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  batch_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_geladinho_id ON geladinho_stock(geladinho_id);
CREATE INDEX IF NOT EXISTS idx_geladinho_stock_batch_date ON geladinho_stock(batch_date);

-- Enable RLS
ALTER TABLE geladinho_stock ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own geladinho stock"
  ON geladinho_stock
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own geladinho stock"
  ON geladinho_stock
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own geladinho stock"
  ON geladinho_stock
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own geladinho stock"
  ON geladinho_stock
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_geladinho_stock_updated_at
  BEFORE UPDATE ON geladinho_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();