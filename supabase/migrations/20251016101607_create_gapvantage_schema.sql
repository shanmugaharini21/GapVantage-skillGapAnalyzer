/*
  # GapVantage AI - Skill Gap Analyzer Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `role` (text) - student, professional, or recruiter
      - `linkedin_url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `skills`
      - `id` (uuid, primary key)
      - `name` (text) - skill name (e.g., "Machine Learning", "Transformers")
      - `category` (text) - AI or NLP
      - `difficulty_level` (text) - beginner, intermediate, advanced
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `user_skills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill_id` (uuid, references skills)
      - `proficiency_level` (integer) - 0-100 score
      - `source` (text) - resume, linkedin, assessment
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `assessments`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text) - AI or NLP
      - `difficulty_level` (text)
      - `duration_minutes` (integer)
      - `created_at` (timestamptz)
    
    - `assessment_questions`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, references assessments)
      - `question_text` (text)
      - `question_type` (text) - multiple_choice, coding, text
      - `options` (jsonb) - array of answer options
      - `correct_answer` (text)
      - `points` (integer)
      - `skill_id` (uuid, references skills)
      - `order_number` (integer)
    
    - `user_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `assessment_id` (uuid, references assessments)
      - `score` (integer)
      - `total_points` (integer)
      - `completed_at` (timestamptz)
      - `time_taken_minutes` (integer)
    
    - `user_assessment_answers`
      - `id` (uuid, primary key)
      - `user_assessment_id` (uuid, references user_assessments)
      - `question_id` (uuid, references assessment_questions)
      - `user_answer` (text)
      - `is_correct` (boolean)
      - `points_earned` (integer)
    
    - `learning_resources`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `resource_type` (text) - course, tutorial, certification, book, article
      - `url` (text)
      - `provider` (text) - Coursera, Udemy, etc.
      - `skill_id` (uuid, references skills)
      - `difficulty_level` (text)
      - `duration_hours` (integer, optional)
      - `rating` (numeric, optional)
      - `is_free` (boolean)
      - `created_at` (timestamptz)
    
    - `user_learning_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `resource_id` (uuid, references learning_resources)
      - `status` (text) - not_started, in_progress, completed
      - `progress_percentage` (integer) - 0-100
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, optional)
      - `notes` (text, optional)
    
    - `resume_uploads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `file_name` (text)
      - `file_url` (text)
      - `parsed_data` (jsonb) - extracted skills and experience
      - `uploaded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public skill and resource data
    - Restrict assessment answer visibility

  3. Important Notes
    - All tables use UUID primary keys with automatic generation
    - Timestamps use timestamptz for timezone support
    - JSONB used for flexible data storage (options, parsed data)
    - Foreign key constraints ensure data integrity
    - Default values provided for timestamps and booleans
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'professional',
  linkedin_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  difficulty_level text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level integer NOT NULL DEFAULT 0,
  source text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty_level text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL,
  options jsonb,
  correct_answer text NOT NULL,
  points integer NOT NULL DEFAULT 10,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  order_number integer NOT NULL
);

-- Create user_assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  time_taken_minutes integer
);

-- Create user_assessment_answers table
CREATE TABLE IF NOT EXISTS user_assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_assessment_id uuid NOT NULL REFERENCES user_assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  user_answer text,
  is_correct boolean DEFAULT false,
  points_earned integer DEFAULT 0
);

-- Create learning_resources table
CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  resource_type text NOT NULL,
  url text NOT NULL,
  provider text NOT NULL,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  difficulty_level text NOT NULL,
  duration_hours integer,
  rating numeric,
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_learning_progress table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text,
  UNIQUE(user_id, resource_id)
);

-- Create resume_uploads table
CREATE TABLE IF NOT EXISTS resume_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  parsed_data jsonb,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills policies (public read, admin write)
CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- User skills policies
CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON user_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Assessments policies
CREATE POLICY "Anyone can view assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

-- Assessment questions policies
CREATE POLICY "Anyone can view assessment questions"
  ON assessment_questions FOR SELECT
  TO authenticated
  USING (true);

-- User assessments policies
CREATE POLICY "Users can view own assessments"
  ON user_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON user_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User assessment answers policies
CREATE POLICY "Users can view own answers"
  ON user_assessment_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = user_assessment_answers.user_assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers"
  ON user_assessment_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = user_assessment_answers.user_assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- Learning resources policies
CREATE POLICY "Anyone can view learning resources"
  ON learning_resources FOR SELECT
  TO authenticated
  USING (true);

-- User learning progress policies
CREATE POLICY "Users can view own progress"
  ON user_learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_learning_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_learning_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resume uploads policies
CREATE POLICY "Users can view own resume uploads"
  ON resume_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume uploads"
  ON resume_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume uploads"
  ON resume_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_id ON learning_resources(skill_id);