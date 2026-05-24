import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE_CONFIG } from '@/lib/constants'

/**
 * Dynamic sitemap generation for better SEO
 * Includes all published articles and static pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url

  // Static pages (always included)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Guard: skip DB query at build time when env vars are not set (e.g. Vercel CI)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return staticUrls
  }

  // Fetch all published articles
  let articleUrls: MetadataRoute.Sitemap = []
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    articleUrls =
      articles?.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })) || []
  } catch (error) {
    console.error('Sitemap: failed to fetch articles from Supabase', error)
  }

  return [...staticUrls, ...articleUrls]
}
