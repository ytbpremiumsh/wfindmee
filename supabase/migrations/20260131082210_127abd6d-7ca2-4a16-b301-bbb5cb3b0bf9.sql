-- Add slug column to quizzes table
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_slug ON public.quizzes(slug) WHERE slug IS NOT NULL;

-- Create website_redirects table for managing multiple website redirects
CREATE TABLE IF NOT EXISTS public.website_redirects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  source_domain text NOT NULL,
  target_url text NOT NULL,
  is_active boolean DEFAULT true,
  redirect_type text DEFAULT 'permanent',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index for source_domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_website_redirects_source_domain ON public.website_redirects(source_domain);

-- Enable RLS
ALTER TABLE public.website_redirects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_redirects
CREATE POLICY "Admins can manage all website redirects" ON public.website_redirects
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active website redirects" ON public.website_redirects
  FOR SELECT USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_website_redirects_updated_at
  BEFORE UPDATE ON public.website_redirects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();