/*
  # Political Life Simulator Game Database

  1. New Tables
    - `game_saves`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional for guest play)
      - `character_name` (text)
      - `birth_year` (integer, 1775-1991)
      - `current_age` (integer)
      - `current_year` (integer)
      - `phase` (text: 'life', 'campaign', 'president')
      - `political_party` (text)
      - `money` (integer)
      - `popularity` (integer)
      - `education_level` (text)
      - `career_path` (text)
      - `military_service` (boolean)
      - `is_president` (boolean)
      - `game_data` (jsonb - stores complex game state)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow anyone to create and manage their own saves
*/

CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  character_name text NOT NULL,
  birth_year integer NOT NULL CHECK (birth_year >= 1775 AND birth_year <= 1991),
  current_age integer NOT NULL DEFAULT 10,
  current_year integer NOT NULL,
  phase text NOT NULL DEFAULT 'life',
  political_party text,
  money integer DEFAULT 1000,
  popularity integer DEFAULT 50,
  education_level text DEFAULT 'elementary',
  career_path text,
  military_service boolean DEFAULT false,
  is_president boolean DEFAULT false,
  game_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create game saves"
  ON game_saves FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view their game saves"
  ON game_saves FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their game saves"
  ON game_saves FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their game saves"
  ON game_saves FOR DELETE
  TO anon
  USING (true);