-- Add total_stock column to products table
ALTER TABLE products 
ADD COLUMN total_stock numeric DEFAULT 0;

-- Create function to update product total stock
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the total_stock in products table
  UPDATE products 
  SET total_stock = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM product_stock_entries
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total stock on stock entry changes
CREATE TRIGGER update_product_total_stock_trigger
AFTER INSERT OR UPDATE OR DELETE ON product_stock_entries
FOR EACH ROW
EXECUTE FUNCTION update_product_total_stock();

-- Update existing total_stock values
UPDATE products p
SET total_stock = COALESCE(
  (SELECT SUM(quantity)
   FROM product_stock_entries
   WHERE product_id = p.id),
  0
);