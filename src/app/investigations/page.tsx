import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/types/database'

export const revalidate = 300

async function getInvestigations(): Promise<Article[]> {
  try {
    const { data } = await supabase
      .from('articles')
      .select('id,title,slug,excerpt,published_at,byline,sector,featured_image_url,reading_time,tags')
      .eq('status', 'published')
      .eq('investigation', true)
      .order('published_at', { ascending: false })
      .limit(20)
    return (data || []) as Article[]
  } catch {
    return []
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function InvestigationsPage() {
  const investigations = await getInvestigations()

  return (
    <div className="bg-charcoal min-h-screen">
      <div className="h-px w-full bg-amber" />

      <div className="container mx-auto px-4 py-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-amber mb-2">Research Swarm</p>
        <h1 className="font-serif text-headline font-semibold text-paper mb-2">Investigations</h1>
        <p className="text-body text-paper-dim max-w-[55ch] mb-10">
          Long-form investigations combining HSE data, FOI responses, tribunal records, and source testimony.
          Each piece undergoes extended Governance Swarm review before publication.
        </p>

        {investigations.length === 0 ? (
          <div className="border border-rule p-8 max-w-xl">
            <p className="font-mono text-sm text-paper-dim">
              No investigations published yet — Research Swarm is building its first case files.
            </p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-rule">
            {investigations.map((article) => (
              <article key={article.id} className="py-8 group">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {article.sector && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-amber">
                          {article.sector}
                        </span>
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim border border-amber/30 px-2 py-0.5 text-amber">
                        Investigation
                      </span>
                    </div>
                    <Link href={`/articles/${article.slug}`}>
                      <h2 className="font-serif text-subhead font-semibold text-paper group-hover:text-amber transition-colors leading-snug">
                        {article.title}
                      </h2>
                    </Link>
                    <p className="text-body text-paper-dim leading-relaxed max-w-[65ch]">
                      {article.excerpt}
                    </p>
                    <p className="font-mono text-[11px] text-paper-dim">{article.byline}</p>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="font-mono text-[11px] text-paper-dim space-y-1">
                      <p>{formatDate(article.published_at)}</p>
                      <p>{article.reading_time} min read</p>
                    </div>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-mono text-[11px] uppercase tracking-widest text-amber hover:text-amber-dim transition-colors mt-4 md:mt-0"
                    >
                      Read investigation →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
