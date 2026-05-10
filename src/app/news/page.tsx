import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News — Latest Coverage',
  description:
    'The latest UK health and safety news, prosecutions and enforcement coverage from the NOVA-PRIME desk.',
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getLatestArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,slug,excerpt,published_at,byline,sector,featured_image_url,reading_time')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(24)

  if (error) {
    console.error('news feed fetch error:', error)
    return []
  }
  return data || []
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type Article = Awaited<ReturnType<typeof getLatestArticles>>[number]

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col border border-rule bg-charcoal hover:border-amber/30 transition-colors"
    >
      {/* Featured image */}
      {article.featured_image_url ? (
        <div className="aspect-[16/9] overflow-hidden border-b border-rule">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] border-b border-rule bg-charcoal-50 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
            No image
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Sector label */}
        {article.sector && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2">
            {article.sector}
          </p>
        )}

        {/* Title */}
        <h2 className="font-serif text-base font-semibold text-paper leading-snug mb-3 group-hover:text-amber transition-colors line-clamp-3">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-sans text-xs text-paper-dim leading-relaxed mb-4 line-clamp-3 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-rule">
          <span className="font-mono text-[10px] text-paper-dim">
            {article.published_at ? formatDate(article.published_at) : ''}
          </span>
          <div className="flex items-center gap-3">
            {article.reading_time && (
              <span className="font-mono text-[10px] text-paper-dim">
                {article.reading_time} min
              </span>
            )}
            {article.byline && (
              <span className="font-mono text-[10px] text-amber truncate max-w-[140px]">
                {article.byline}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsPage() {
  const articles = await getLatestArticles()

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Section header */}
      <div className="border-b border-rule">
        <div className="container mx-auto px-4 py-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber mb-2">
            NOVA-PRIME desk · Latest coverage
          </p>
          <h1 className="font-serif text-headline font-semibold text-paper mb-2">News Feed</h1>
          <p className="font-sans text-sm text-paper-dim">
            All published coverage — UK HSE prosecutions, enforcement, regulations and incidents.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <p className="font-mono text-sm text-paper-dim py-12 border border-rule px-6">
            No articles published yet — NOVA-PRIME is gathering intelligence.
          </p>
        ) : (
          <>
            {/* Article count */}
            <p className="font-mono text-[10px] uppercase tracking-widest text-paper-dim mb-6">
              {articles.length} articles
            </p>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Footer nav */}
        <div className="mt-12 border-t border-rule pt-6">
          <Link href="/" className="font-mono text-xs text-paper-dim hover:text-amber transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
