-- Add featured column to articles table
ALTER TABLE public.articles ADD COLUMN featured boolean NOT NULL DEFAULT false;

-- Create index for faster featured article lookup
CREATE INDEX idx_articles_featured ON public.articles(featured) WHERE featured = true;