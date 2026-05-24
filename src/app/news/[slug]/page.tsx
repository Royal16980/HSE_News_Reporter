import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, getCategoryColor } from '@/lib/utils'
import { SITE_CONFIG } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleContent } from '@/components/article/article-content'
import { TableOfContents } from '@/components/article/table-of-contents'
import { ShareButtons } from '@/components/article/share-buttons'
import { RelatedArticles } from '@/components/article/related-articles'
import { ReadingProgress } from '@/components/article/reading-progress'
import type { Article } from '@/types/database'

export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .limit(100)

  return data?.map((article) => ({ slug: article.slug })) || []
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) return { title: 'Article Not Found' }

  const articleUrl = `${SITE_CONFIG.url}/news/${article.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author],
      tags: article.tags,
      images: article.featured_image_url
        ? [{ url: article.featured_image_url, width: 1200, height: 630, alt: article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
    alternates: { canonical: articleUrl },
  }
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) throw error

    supabase.rpc('increment_article_views', { article_slug: slug }).then()

    return data
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export const revalidate = 300

export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = await getArticle(params.slug)

  if (!article) notFound()

  const categoryColors = getCategoryColor(article.category)
  const articleUrl = `${SITE_CONFIG.url}/news/${article.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image_url || '',
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress />

      <article className="relative">
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden bg-muted">
          {article.featured_image_url && (
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="absolute top-8 left-0 right-0">
            <div className="container mx-auto px-4">
              <Link href="/news">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to News
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                <Badge
                  className={`mb-4 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border}`}
                >
                  {article.category}
                </Badge>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
                  <span className="font-medium">{article.author}</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.reading_time} min read</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{article.views_count} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <p className="mb-8 text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6">
                {article.excerpt}
              </p>

              <ArticleContent content={article.content} />

              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
                    Tagged Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag} href={`/tag/${tag}`}>
                        <Badge variant="outline" className="hover:bg-accent">
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 text-sm text-muted-foreground">
                Last updated: {formatDate(article.updated_at)}
              </div>

              <div className="mt-8 pt-8 border-t">
                <ShareButtons
                  title={article.title}
                  url={articleUrl}
                  excerpt={article.excerpt}
                />
              </div>
            </div>

            <aside className="space-y-8">
              <TableOfContents content={article.content} />
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-3 font-semibold">About the Author</h3>
                <p className="text-sm text-muted-foreground mb-4">{article.author}</p>
                <p className="text-sm text-muted-foreground">
                  Expert health and safety journalist covering UK regulations, industry
                  news, and best practices.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="border-t bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <Suspense fallback={<div>Loading related articles...</div>}>
              <RelatedArticles
                currentSlug={article.slug}
                category={article.category}
                tags={article.tags}
              />
            </Suspense>
          </div>
        </div>
      </article>
    </>
  )
}
