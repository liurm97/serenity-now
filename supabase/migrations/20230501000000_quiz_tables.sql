-- Create quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mood_category VARCHAR(20) NOT NULL,
  notes TEXT,

  -- Add appropriate indices
  CONSTRAINT score_range CHECK (score >= 0 AND score <= 100)
);

-- Create index on user_id for faster lookups of user's quiz history
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS quiz_results_created_at_idx ON public.quiz_results(created_at);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one profile per user
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- Create Row Level Security (RLS) policies
-- RLS for quiz_results
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own results
CREATE POLICY "Users can view own quiz results"
  ON public.quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only allow users to insert their own results
CREATE POLICY "Users can insert own quiz results"
  ON public.quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own results
CREATE POLICY "Users can update own quiz results"
  ON public.quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();