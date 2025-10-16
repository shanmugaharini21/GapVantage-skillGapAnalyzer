import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: string;
          linkedin_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: string;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: string;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          difficulty_level: string;
          description: string;
          created_at: string;
        };
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          proficiency_level: number;
          source: string;
          created_at: string;
          updated_at: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty_level: string;
          duration_minutes: number;
          created_at: string;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string;
          question_text: string;
          question_type: string;
          options: any;
          correct_answer: string;
          points: number;
          skill_id: string;
          order_number: number;
        };
      };
      user_assessments: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          score: number;
          total_points: number;
          completed_at: string;
          time_taken_minutes: number | null;
        };
      };
      learning_resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          resource_type: string;
          url: string;
          provider: string;
          skill_id: string;
          difficulty_level: string;
          duration_hours: number | null;
          rating: number | null;
          is_free: boolean;
          created_at: string;
        };
      };
      user_learning_progress: {
        Row: {
          id: string;
          user_id: string;
          resource_id: string;
          status: string;
          progress_percentage: number;
          started_at: string;
          completed_at: string | null;
          notes: string | null;
        };
      };
      resume_uploads: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          parsed_data: any;
          uploaded_at: string;
        };
      };
    };
  };
};
