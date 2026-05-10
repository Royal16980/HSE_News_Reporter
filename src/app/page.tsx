import { Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { SolariTicker } from '@/components/home/SolariTicker'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { TrendingTopics } from '@/components/home/trending-topics'
import { ArticleCard } from '@/components/article/article-card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/types/database'
import type { ArticleCardProps } from '@/types'

export const revalidate = 60

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
  } catch {
    return []
  }
}

async function getLatestArticles(): Promise<ArticleCardProps[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(3, 14)

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
  } catch {
    return []
  }
}

function ArticleGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3 border border-rule p-4">
          <Skeleton className="aspect-video w-full bg-charcoal-50" />
          <Skeleton className="h-5 w-3/4 bg-charcoal-50" />
          <Skeleton className="h-4 w-full bg-charcoal-50" />
          <Skeleton className="h-4 w-2/3 bg-charcoal-50" />
        </div>
      ))}
    </div>
  )
}

async function FeaturedArticles() {
  const articles = await getFeaturedArticles()

  if (articles.length === 0) {
    return (
      <p className="py-8 font-mono text-sm text-paper-dim">
        No articles yet — NOVA-PRIME is gathering intelligence.
      </p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  )
}

async function LatestArticles() {
  const articles = await getLatestArticles()
  if (articles.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} {...article} />
      ))}
    </div>
  )
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8 border-b border-rule pb-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-1">{label}</p>
      <h2 className="font-serif text-subhead font-semibold text-paper">{title}</h2>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col bg-charcoal">
      <HeroSection />

      {/* Prosecution ticker — Solari split-flap */}
      <section className="border-b border-rule">
        <div className="container mx-auto px-4 py-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-4">
            Recent prosecutions — live
          </p>
          <SolariTicker />
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionHeading label="Top stories" title="Featured coverage" />
          <Suspense fallback={<ArticleGridSkeleton />}>
            <FeaturedArticles />
          </Suspense>
        </div>
      </section>

      {/* Trending */}
      <TrendingTopics />

      {/* Latest Updates */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionHeading label="Latest" title="Recent updates" />
          <Suspense fallback={<ArticleGridSkeleton />}>
            <LatestArticles />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  )
}
