/*
  # Add stock reduction trigger for sales

  1. Changes
    - Add trigger function to reduce geladinho stock when a sale is recorded
    - Add trigger to automatically call the function on sale insert
    - Add check to ensure there's enough stock before allowing the sale

  2. Security
    - Function runs with security definer to ensure stock updates
    - Checks stock availability before allowing sale
*/

-- Create function to reduce geladinho stock
CREATE OR REPLACE FUNCTION reduce_geladinho_stock()
RETURNS TRIGGER AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  -- Get current available stock
  SELECT COALESCE(SUM(quantity), 0)
  INTO available_stock
  FROM geladinho_stock
  WHERE geladinho_id = NEW.geladinho_id;

  -- Check if there's enough stock
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', available_stock, NEW.quantity;
  END IF;

  -- Create a negative stock entry to represent the sale
  INSERT INTO geladinho_stock (
    geladinho_id,
    quantity,
    batch_date
  ) VALUES (
    NEW.geladinho_id,
    -NEW.quantity,
    NEW.sale_date
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to reduce stock on sale
CREATE TRIGGER reduce_stock_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION reduce_geladinho_stock();