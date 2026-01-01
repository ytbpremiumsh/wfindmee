
-- Add template columns to quiz_results for custom image modes and templates
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS image_mode text DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS template_id text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gradient_id text DEFAULT 'purple';

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_results.image_mode IS 'custom or template';
COMMENT ON COLUMN public.quiz_results.template_id IS 'Template ID for result display';
COMMENT ON COLUMN public.quiz_results.gradient_id IS 'Gradient preset ID for template mode';
