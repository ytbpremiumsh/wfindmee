-- Create shortlinks table
CREATE TABLE public.shortlinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  title TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0
);

-- Create shortlink clicks tracking table
CREATE TABLE public.shortlink_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shortlink_id UUID NOT NULL REFERENCES public.shortlinks(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  referer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shortlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlink_clicks ENABLE ROW LEVEL SECURITY;

-- Shortlinks policies
CREATE POLICY "Admins can manage all shortlinks" 
ON public.shortlinks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active shortlinks" 
ON public.shortlinks 
FOR SELECT 
USING (is_active = true);

-- Shortlink clicks policies
CREATE POLICY "Admins can view all clicks" 
ON public.shortlink_clicks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert clicks" 
ON public.shortlink_clicks 
FOR INSERT 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_shortlinks_short_code ON public.shortlinks(short_code);
CREATE INDEX idx_shortlink_clicks_shortlink_id ON public.shortlink_clicks(shortlink_id);
CREATE INDEX idx_shortlink_clicks_clicked_at ON public.shortlink_clicks(clicked_at);

-- Trigger for updated_at
CREATE TRIGGER update_shortlinks_updated_at
BEFORE UPDATE ON public.shortlinks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();