import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, ArrowLeft, ExternalLink, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_CONFIG, BYLINE } from '@/lib/constants'
import { ArticleContent } from '@/components/article/article-content'
import { RelatedArticles } from '@/components/article/related-articles'
import { ReadingProgress } from '@/components/article/reading-progress'
import { WaveformPlayer } from '@/components/audio/WaveformPlayer'
import { TableOfContents } from '@/components/article/table-of-contents'
import { ShareButtons } from '@/components/article/share-buttons'
import type { Article } from '@/types/database'

export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .limit(100)
  return data?.map((a) => ({ slug: a.slug })) || []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: article } = await supabase
    .from('articles')
    .select('title,excerpt,tags,byline,published_at,updated_at,featured_image_url,sector')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) return { title: 'Article Not Found | SafetyNews Pro' }

  const articleUrl = `${SITE_CONFIG.url}/articles/${slug}`
  return {
    title: `${article.title} | SafetyNews Pro`,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.byline || BYLINE.DEFAULT }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      images: article.featured_image_url ? [{ url: article.featured_image_url, width: 1200, height: 630 }] : [],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt },
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
    if (error) return null
    supabase.rpc('increment_article_views', { article_slug: slug }).then()
    return data as Article
  } catch {
    return null
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const revalidate = 300

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const articleUrl = `${SITE_CONFIG.url}/articles/${slug}`
  const audioChapters = Array.isArray(article.audio_chapters) ? article.audio_chapters as { start: number; title: string }[] : []
  const audioPeaks = Array.isArray(article.audio_peaks) ? article.audio_peaks as number[] : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image_url || '',
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: 'NOVA-PRIME desk' },
    publisher: {
      '@type': 'Organization',
      name: 'SafetyNews Pro',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <article className="bg-charcoal min-h-screen">
        {/* Article header */}
        <div className="border-b border-rule">
          {article.featured_image_url && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <Image
                src={article.featured_image_url}
                alt={article.title}
                fill
                className="object-cover opacity-60"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/70 to-transparent" />
            </div>
          )}

          <div className="container mx-auto px-4 py-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-paper-dim hover:text-amber transition-colors mb-6"
            >
              <ArrowLeft className="h-3 w-3" />
              All articles
            </Link>

            {article.sector && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-amber mb-3">
                {article.sector}
              </p>
            )}

            <h1 className="font-serif text-headline font-semibold text-paper leading-tight max-w-[36ch] mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-body-lg text-paper-dim leading-relaxed max-w-[60ch] mb-6 border-l-2 border-amber pl-4">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-[12px] font-mono text-paper-dim">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.reading_time} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {article.views_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 max-w-6xl">

            {/* Main column */}
            <div className="min-w-0 space-y-8">
              {/* Podcast/Audio player */}
              {article.audio_url && (
                <div className="border border-rule">
                  <div className="px-4 pt-3 pb-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber">Listen to this article</p>
                  </div>
                  <WaveformPlayer
                    audioUrl={article.audio_url}
                    peaks={audioPeaks.length > 0 ? audioPeaks : Array(60).fill(0).map(() => Math.random())}
                    chapters={audioChapters}
                    title={article.title}
                    durationSeconds={article.reading_time * 60}
                    transcript={article.audio_transcript || undefined}
                  />
                </div>
              )}

              {/* Article body */}
              <div className="prose prose-invert prose-amber max-w-none">
                <ArticleContent content={article.content} />
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-6 border-t border-rule">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-3">Tagged</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[11px] text-paper-dim border border-rule px-2 py-0.5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="pt-6 border-t border-rule">
                <ShareButtons title={article.title} url={articleUrl} excerpt={article.excerpt} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Byline + Governance */}
              <div className="border border-rule p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-amber mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] text-paper leading-relaxed">
                      {article.byline || BYLINE.DEFAULT}
                    </p>
                    {article.governance_signoff && (
                      <p className="font-mono text-[10px] text-amber mt-1">Governance sign-off confirmed</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Table of contents */}
              <TableOfContents content={article.content} />

              {/* Development status */}
              {article.development_status === 'developing' && (
                <div className="border border-amber/30 bg-amber/5 p-3">
                  <p className="font-mono text-[11px] text-amber uppercase tracking-wider">Developing story</p>
                  <p className="font-mono text-[10px] text-paper-dim mt-1">Updated as new information becomes available.</p>
                </div>
              )}

              {/* Regulation refs */}
              {article.regulation_refs && article.regulation_refs.length > 0 && (
                <div className="border border-rule p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-3">Regulations cited</p>
                  <div className="space-y-1">
                    {article.regulation_refs.map((ref) => (
                      <Link
                        key={ref}
                        href={`/regulations`}
                        className="block font-mono text-[11px] text-amber/80 hover:text-amber transition-colors"
                      >
                        <ExternalLink className="inline h-3 w-3 mr-1" />
                        {ref}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Related articles */}
        <div className="border-t border-rule mt-12 py-10">
          <div className="container mx-auto px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-6">Related coverage</p>
            <Suspense fallback={null}>
              <RelatedArticles currentSlug={slug} category={article.category} tags={article.tags} />
            </Suspense>
          </div>
        </div>
      </article>
    </>
  )
}
