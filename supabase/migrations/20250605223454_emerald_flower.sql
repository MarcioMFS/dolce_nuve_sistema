/*
  # Add RLS policies for products table

  1. Security Changes
    - Add user_id column if it doesn't exist
    - Drop existing policies to avoid conflicts
    - Create new policies for authenticated users
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE products ADD COLUMN user_id UUID DEFAULT auth.uid();
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their own products" ON products;
  DROP POLICY IF EXISTS "Users can read their own products" ON products;
  DROP POLICY IF EXISTS "Users can update their own products" ON products;
  DROP POLICY IF EXISTS "Users can delete their own products" ON products;
END $$;