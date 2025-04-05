-- Create quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB NOT NULL,
  mood_category TEXT NOT NULL CHECK (mood_category IN ('excellent', 'good', 'moderate', 'concerning')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indices for faster queries
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS quiz_results_created_at_idx ON public.quiz_results(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_results
CREATE POLICY "Users can view own quiz results"
  ON public.quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON public.quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results"
  ON public.quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
  ON public.quiz_results
  FOR DELETE
  USING (auth.uid() = user_id);