/**
 * Application-wide constants and configuration
 */

export const SITE_CONFIG = {
  name: 'UK Health & Safety News',
  description: "The UK's Premier Health & Safety Intelligence Platform",
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hsenews.uk',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/hsenewsuk',
    linkedin: 'https://linkedin.com/company/hsenewsuk',
  },
}

export const CATEGORIES = [
  {
    name: 'Workplace Safety',
    slug: 'workplace-safety',
    icon: 'HardHat',
    description: 'General workplace safety news and updates',
  },
  {
    name: 'Fire Safety',
    slug: 'fire-safety',
    icon: 'Flame',
    description: 'Fire prevention and safety regulations',
  },
  {
    name: 'Chemical Safety',
    slug: 'chemical-safety',
    icon: 'FlaskConical',
    description: 'Chemical handling and COSHH compliance',
  },
  {
    name: 'Construction',
    slug: 'construction',
    icon: 'Construction',
    description: 'Construction site safety and CDM regulations',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'Heart',
    description: 'Healthcare and medical facility safety',
  },
  {
    name: 'Food Safety',
    slug: 'food-safety',
    icon: 'UtensilsCrossed',
    description: 'Food hygiene and safety standards',
  },
  {
    name: 'Ergonomics',
    slug: 'ergonomics',
    icon: 'Armchair',
    description: 'Workplace ergonomics and DSE',
  },
  {
    name: 'Mental Health',
    slug: 'mental-health',
    icon: 'Brain',
    description: 'Workplace mental health and wellbeing',
  },
]

export const ARTICLE_TYPES = {
  INCIDENTS: 'incidents',
  REGULATIONS: 'regulations',
  BEST_PRACTICES: 'best-practices',
  NEWS: 'news',
  GUIDES: 'guides',
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  FEATURED_ARTICLES: 3,
  RELATED_ARTICLES: 4,
  TRENDING_TOPICS: 10,
}

export const CACHE_REVALIDATION = {
  HOMEPAGE: 60, // 1 minute
  ARTICLE: 300, // 5 minutes
  CATEGORIES: 3600, // 1 hour
  TRENDING: 600, // 10 minutes
}

export const SEO = {
  DEFAULT_TITLE: "UK Health & Safety News | The UK's Premier H&S Intelligence Platform",
  DEFAULT_DESCRIPTION:
    'Stay updated with the latest UK health and safety news, regulations, incidents, and best practices. Expert analysis for safety professionals.',
  DEFAULT_KEYWORDS: [
    'health and safety',
    'UK HSE',
    'workplace safety',
    'safety regulations',
    'health and safety news',
    'HSE updates',
    'safety compliance',
  ],
}

export const SOCIAL_SHARE = {
  TWITTER_HANDLE: '@hsenewsuk',
  HASHTAGS: ['HealthAndSafety', 'SafetyFirst', 'UKHSE'],
}

export const TRUST_INDICATORS = {
  SUBSCRIBERS: '10,000+',
  UPDATE_FREQUENCY: 'Updated Daily',
  VERIFICATION: 'HSE Verified',
}
