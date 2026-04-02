import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GameSave {
  id: string;
  user_id?: string;
  character_name: string;
  birth_year: number;
  current_age: number;
  current_year: number;
  phase: 'life' | 'campaign' | 'president';
  political_party?: string;
  money: number;
  popularity: number;
  education_level: string;
  career_path?: string;
  military_service: boolean;
  is_president: boolean;
  game_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
