-- Add compatibility columns to quiz_results
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS best_match_type TEXT,
ADD COLUMN IF NOT EXISTS best_match_icon TEXT,
ADD COLUMN IF NOT EXISTS worst_match_type TEXT,
ADD COLUMN IF NOT EXISTS worst_match_icon TEXT;