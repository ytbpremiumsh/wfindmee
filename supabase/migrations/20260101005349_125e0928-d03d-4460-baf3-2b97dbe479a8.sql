-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  category TEXT DEFAULT 'umum',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read published articles" 
ON public.articles FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all articles" 
ON public.articles FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);