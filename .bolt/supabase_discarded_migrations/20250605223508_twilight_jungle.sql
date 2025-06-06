/*
  # Add user_id to sales table and update policies

  1. Changes
    - Add user_id column if not exists
    - Update RLS policies to use user_id
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE sales ADD COLUMN user_id UUID DEFAULT auth.uid();
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
  DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;
END $$;

-- Create RLS policies
CREATE POLICY "Users can read their own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);