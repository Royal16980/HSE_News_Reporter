import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArticleCard } from '@/components/article/article-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article } from '@/types/database'
import type { ArticleCardProps } from '@/types'

export const revalidate = 60

export const metadata = {
  title: 'News | UK Health & Safety News',
  description:
    'Latest UK health and safety news, HSE prosecutions, legislation updates, and industry insights.',
}

async function getArticles(): Promise<ArticleCardProps[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30)

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
    console.error('Error fetching articles:', error)
    return []
  }
}

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

async function ArticleGrid() {
  const articles = await getArticles()

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No articles published yet.</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Back to home
        </Link>
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

export default function NewsPage() {
  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <section className="border-b bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
              Latest News
            </h1>
            <p className="text-lg text-muted-foreground">
              Breaking health & safety news, HSE prosecutions, legislation changes,
              and industry updates from across the UK.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Suspense fallback={<ArticleGridSkeleton />}>
            <ArticleGrid />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
