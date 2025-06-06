/*
  # Add RLS policies for products table

  1. Security
    - Enable RLS on products table
    - Add user_id column for ownership tracking
    - Add policies for CRUD operations
*/

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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

-- Create policies
CREATE POLICY "Users can insert their own products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own products"
ON products
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON products
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);