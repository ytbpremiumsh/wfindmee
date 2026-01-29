-- Create a trigger function to automatically increment click_count when a click is recorded
CREATE OR REPLACE FUNCTION public.increment_shortlink_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shortlinks
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = NEW.shortlink_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to call the function after insert on shortlink_clicks
DROP TRIGGER IF EXISTS on_shortlink_click_insert ON public.shortlink_clicks;
CREATE TRIGGER on_shortlink_click_insert
  AFTER INSERT ON public.shortlink_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_shortlink_click_count();