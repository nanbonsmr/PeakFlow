import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const baseUrl = url.searchParams.get('baseUrl') || 'https://peakflow-blog.netlify.app'

    // Fetch all published articles with slugs
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, slug, updated_at, category, title, image_url')
      .eq('published', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      throw error
    }

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/authors', priority: '0.7', changefreq: 'weekly' },
      { path: '/lifestyle', priority: '0.8', changefreq: 'weekly' },
      { path: '/growth', priority: '0.8', changefreq: 'weekly' },
      { path: '/productivity', priority: '0.8', changefreq: 'weekly' },
      { path: '/tech-tips', priority: '0.8', changefreq: 'weekly' },
      { path: '/search', priority: '0.6', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    ]

    const today = new Date().toISOString().split('T')[0]

    // Build sitemap XML with image support
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add article pages using slugs for SEO-friendly URLs
    if (articles) {
      for (const article of articles) {
        const lastmod = article.updated_at 
          ? new Date(article.updated_at).toISOString().split('T')[0]
          : today
        
        const articleSlug = article.slug || article.id

        sitemap += `  <url>
    <loc>${baseUrl}/article/${articleSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>`

        // Add image to sitemap if available
        if (article.image_url) {
          sitemap += `
    <image:image>
      <image:loc>${article.image_url}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`
        }

        sitemap += `
  </url>
`
      }
    }

    sitemap += `</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      }
    )
  }
})

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
