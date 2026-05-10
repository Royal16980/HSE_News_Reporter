export const SITE_CONFIG = {
  name: 'SafetyNews Pro',
  description: 'Autonomous UK Health & Safety Intelligence — prosecutions, regulations, incidents',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://safetynews.pro',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/safetynewspro',
    linkedin: 'https://linkedin.com/company/safetynewspro',
  },
}

export const CATEGORIES = [
  {
    name: 'Construction',
    slug: 'construction',
    icon: 'HardHat',
    description: 'Construction industry H&S — CDM, scaffolding, falls',
  },
  {
    name: 'Manufacturing',
    slug: 'manufacturing',
    icon: 'Factory',
    description: 'Manufacturing sector H&S — machinery, PUWER, LOLER',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'Heart',
    description: 'NHS & private healthcare H&S — infection control, moving & handling',
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    icon: 'Wheat',
    description: 'Farming & agricultural H&S — tractors, pesticides, livestock',
  },
  {
    name: 'Education',
    slug: 'education',
    icon: 'GraduationCap',
    description: 'Schools & universities H&S — CLEAPSS, educational visits',
  },
  {
    name: 'Hospitality',
    slug: 'hospitality',
    icon: 'UtensilsCrossed',
    description: 'Hotels, restaurants & leisure H&S — food safety, manual handling',
  },
  {
    name: 'Transport',
    slug: 'transport',
    icon: 'Truck',
    description: 'Road, rail & logistics H&S — driver hours, vehicle safety',
  },
  {
    name: 'Retail',
    slug: 'retail',
    icon: 'ShoppingCart',
    description: 'Retail & warehousing H&S — forklift, fire safety, lone working',
  },
]

export const ARTICLE_TYPES = {
  PROSECUTIONS: 'prosecutions',
  INCIDENTS: 'incidents',
  REGULATIONS: 'regulations',
  INVESTIGATIONS: 'investigations',
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
  HOMEPAGE: 60,
  ARTICLE: 300,
  CATEGORIES: 3600,
  TRENDING: 600,
}

export const SEO = {
  DEFAULT_TITLE: 'SafetyNews Pro — Autonomous UK Health & Safety Intelligence',
  DEFAULT_DESCRIPTION:
    'UK HSE prosecutions, regulations, incidents and investigations. Produced by NOVA-PRIME · Governance Swarm verified.',
  DEFAULT_KEYWORDS: [
    'health and safety',
    'UK HSE prosecutions',
    'workplace safety news',
    'HSE enforcement',
    'RIDDOR incidents',
    'safety regulations UK',
    'occupational health',
  ],
}

export const SOCIAL_SHARE = {
  TWITTER_HANDLE: '@safetynewspro',
  HASHTAGS: ['HealthAndSafety', 'HSEProsecution', 'WorkplaceSafety'],
}

export const BYLINE = {
  DEFAULT: 'NOVA-PRIME desk · Reviewed by Governance Swarm',
  INVESTIGATION: 'Research Swarm · Editorial Swarm · Governance Swarm verified',
}
