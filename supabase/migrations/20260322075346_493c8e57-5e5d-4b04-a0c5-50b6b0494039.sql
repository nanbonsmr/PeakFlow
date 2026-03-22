
-- Ad settings table for admin-managed Google AdSense
CREATE TABLE public.ad_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_slot_name text NOT NULL UNIQUE,
  ad_client text NOT NULL DEFAULT '',
  ad_slot text NOT NULL DEFAULT '',
  ad_format text NOT NULL DEFAULT 'auto',
  is_enabled boolean NOT NULL DEFAULT false,
  custom_style text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view enabled ads
CREATE POLICY "Anyone can view enabled ads"
ON public.ad_settings FOR SELECT TO public
USING (is_enabled = true);

-- Admins can view all ads
CREATE POLICY "Admins can view all ad settings"
ON public.ad_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage ads
CREATE POLICY "Admins can insert ad settings"
ON public.ad_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ad settings"
ON public.ad_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ad settings"
ON public.ad_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER ad_settings_updated_at
  BEFORE UPDATE ON public.ad_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default ad slots
INSERT INTO public.ad_settings (ad_slot_name, ad_format) VALUES
  ('before_content', 'auto'),
  ('after_content', 'auto');
