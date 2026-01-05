-- Add twitter_username field to user_quiz_attempts for storing user's X/Twitter handle
ALTER TABLE public.user_quiz_attempts 
ADD COLUMN IF NOT EXISTS twitter_username TEXT;

-- Change best_match_type and worst_match_type to arrays to support multiple selections
ALTER TABLE public.quiz_results 
ALTER COLUMN best_match_type TYPE TEXT[] USING 
  CASE 
    WHEN best_match_type IS NULL THEN '{}'::TEXT[]
    WHEN best_match_type = '' THEN '{}'::TEXT[]
    ELSE ARRAY[best_match_type]
  END;

ALTER TABLE public.quiz_results 
ALTER COLUMN worst_match_type TYPE TEXT[] USING 
  CASE 
    WHEN worst_match_type IS NULL THEN '{}'::TEXT[]
    WHEN worst_match_type = '' THEN '{}'::TEXT[]
    ELSE ARRAY[worst_match_type]
  END;

-- Set default values
ALTER TABLE public.quiz_results 
ALTER COLUMN best_match_type SET DEFAULT '{}'::TEXT[];

ALTER TABLE public.quiz_results 
ALTER COLUMN worst_match_type SET DEFAULT '{}'::TEXT[];