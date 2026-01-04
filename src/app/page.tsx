import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { TrendingTopics } from '@/components/home/trending-topics'
import { ArticleCard } from '@/components/article/article-card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { calculateReadingTime } from '@/lib/utils'
import type { Article } from '@/types/database'
import type { ArticleCardProps } from '@/types'

/**
 * Homepage with ISR (Incremental Static Regeneration)
 * Revalidates every 60 seconds to ensure fresh content
 */
export const revalidate = 60 // ISR: Revalidate every 60 seconds

/**
 * Fetch featured articles from Supabase
 */
async function getFeaturedArticles(): Promise<ArticleCardProps[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)

    if (error) throw error

    return (
      data?.map((article: Article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        author: article.author,
        publishedAt: article.published_at,
        featuredImageUrl: article.featured_image_url,
        readingTime: article.reading_time,
        viewsCount: article.views_count,
        isFeatured: true,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching featured articles:', error)
    return []
  }
}

/**
 * Fetch latest articles from Supabase
 */
async function getLatestArticles(): Promise<ArticleCardProps[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(3, 14) // Skip first 3 (featured), get next 12

    if (error) throw error

    return (
      data?.map((article: Article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        author: article.author,
        publishedAt: article.published_at,
        featuredImageUrl: article.featured_image_url,
        readingTime: article.reading_time,
        viewsCount: article.views_count,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return []
  }
}

/**
 * Article Grid Loading Skeleton
 */
function ArticleGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

/**
 * Featured Articles Section
 */
async function FeaturedArticles() {
  const articles = await getFeaturedArticles()

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured articles available.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  )
}

/**
 * Latest Articles Section
 */
async function LatestArticles() {
  const articles = await getLatestArticles()

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  )
}

/**
 * Homepage Component
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-3">
              Featured Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Today's most important health & safety updates
            </p>
          </div>

          <Suspense fallback={<ArticleGridSkeleton />}>
            <FeaturedArticles />
          </Suspense>
        </div>
      </section>

      {/* Trending Topics */}
      <TrendingTopics />

      {/* Latest Updates */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-3">
              Latest Updates
            </h2>
            <p className="text-lg text-muted-foreground">
              Recent news and insights from across the UK
            </p>
          </div>

          <Suspense fallback={<ArticleGridSkeleton />}>
            <LatestArticles />
          </Suspense>
        </div>
      </section>

      {/* Newsletter CTA */}
      <NewsletterSection />
    </div>
  )
}
