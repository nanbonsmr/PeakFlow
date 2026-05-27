CREATE TABLE public.ad_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_setting_id UUID REFERENCES public.ad_settings(id) ON DELETE CASCADE,
  ad_slot_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression','click')),
  article_id UUID,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_events_created_at ON public.ad_events(created_at DESC);
CREATE INDEX idx_ad_events_slot ON public.ad_events(ad_slot_name);
CREATE INDEX idx_ad_events_type ON public.ad_events(event_type);

GRANT INSERT ON public.ad_events TO anon, authenticated;
GRANT SELECT ON public.ad_events TO authenticated;
GRANT ALL ON public.ad_events TO service_role;

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log ad events"
ON public.ad_events FOR INSERT
TO anon, authenticated
WITH CHECK (event_type IN ('impression','click'));

CREATE POLICY "Admins can view all ad events"
ON public.ad_events FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ad events"
ON public.ad_events FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));