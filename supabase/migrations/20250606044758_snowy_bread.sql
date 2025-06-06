/*
  # Fix stock reduction trigger for sales

  1. Changes
    - Replace the existing reduce_geladinho_stock() function with a corrected version
    - Function now properly reduces stock from the oldest available batch
    - Adds validation to ensure sufficient stock is available
    - Handles stock reduction across multiple batches if needed

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

CREATE OR REPLACE FUNCTION reduce_geladinho_stock()
RETURNS TRIGGER AS $$
DECLARE
    remaining_quantity INTEGER := NEW.quantity;
    current_batch RECORD;
    available_stock INTEGER;
BEGIN
    -- First check if we have enough total stock
    SELECT COALESCE(SUM(quantity), 0) INTO available_stock
    FROM geladinho_stock
    WHERE geladinho_id = NEW.geladinho_id;

    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock available. Required: %, Available: %', NEW.quantity, available_stock;
    END IF;

    -- Iterate through batches from oldest to newest
    FOR current_batch IN 
        SELECT id, quantity 
        FROM geladinho_stock 
        WHERE geladinho_id = NEW.geladinho_id
        ORDER BY batch_date ASC
    LOOP
        IF remaining_quantity <= 0 THEN
            EXIT;
        END IF;

        IF current_batch.quantity <= remaining_quantity THEN
            -- Use entire batch
            UPDATE geladinho_stock 
            SET quantity = 0
            WHERE id = current_batch.id;
            
            remaining_quantity := remaining_quantity - current_batch.quantity;
        ELSE
            -- Use partial batch
            UPDATE geladinho_stock 
            SET quantity = quantity - remaining_quantity
            WHERE id = current_batch.id;
            
            remaining_quantity := 0;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;