-- Add image_url column to quiz_questions for optional question images
ALTER TABLE public.quiz_questions ADD COLUMN image_url text;
