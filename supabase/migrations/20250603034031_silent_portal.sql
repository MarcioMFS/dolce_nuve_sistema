\n\nCREATE TYPE unit_measure AS ENUM ('gramas', 'litros', 'unidades')
\n\nCREATE TABLE ingredients (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  category text NOT NULL,\n  unit_measure unit_measure NOT NULL,\n  supplier text,\n  description text,\n  min_stock decimal NOT NULL,\n  created_at timestamptz DEFAULT now(),\n  updated_at timestamptz DEFAULT now()\n)
\n\nALTER TABLE ingredients ENABLE ROW LEVEL SECURITY
\n\nCREATE POLICY "Users can read ingredients"\n  ON ingredients\n  FOR SELECT\n  TO authenticated\n  USING (true)
\n\nCREATE POLICY "Users can insert ingredients"\n  ON ingredients\n  FOR INSERT\n  TO authenticated\n  WITH CHECK (true)
\n\nCREATE POLICY "Users can update ingredients"\n  ON ingredients\n  FOR UPDATE\n  TO authenticated\n  USING (true)
