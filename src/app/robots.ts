import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

/**
 * Robots.txt configuration for search engine crawlers
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
