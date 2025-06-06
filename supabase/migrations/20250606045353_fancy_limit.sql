/*
  # Add movement type to geladinho stock

  1. Changes
    - Add movement_type column to geladinho_stock table
    - Update reduce_geladinho_stock function to handle stock movements
    - Add check constraint to ensure valid movement types

  2. Security
    - Maintains existing RLS policies
*/

-- Add movement_type column
ALTER TABLE geladinho_stock
ADD COLUMN movement_type text NOT NULL CHECK (movement_type IN ('entrada', 'saida')) DEFAULT 'entrada';

-- Update the function to handle stock movements
CREATE OR REPLACE FUNCTION reduce_geladinho_stock()
RETURNS TRIGGER AS $$
DECLARE
    available_stock INTEGER;
BEGIN
    -- Check total available stock
    SELECT COALESCE(SUM(
      CASE 
        WHEN movement_type = 'entrada' THEN quantity
        WHEN movement_type = 'saida' THEN -quantity
      END
    ), 0)
    INTO available_stock
    FROM geladinho_stock
    WHERE geladinho_id = NEW.geladinho_id;

    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', available_stock, NEW.quantity;
    END IF;

    -- Register the sale as a stock exit
    INSERT INTO geladinho_stock (
        geladinho_id,
        quantity,
        batch_date,
        movement_type
    ) VALUES (
        NEW.geladinho_id,
        NEW.quantity,
        NEW.sale_date,
        'saida'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;