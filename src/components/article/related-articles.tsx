import { ArticleCard } from './article-card'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/types/database'
import type { ArticleCardProps } from '@/types'

interface RelatedArticlesProps {
  currentSlug: string
  category: string
  tags: string[]
}

/**
 * Related articles section
 * Shows articles from same category or with matching tags
 */
export async function RelatedArticles({
  currentSlug,
  category,
  tags,
}: RelatedArticlesProps) {
  try {
    // Try to find articles with matching tags first
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('slug', currentSlug)

    // If we have tags, prioritize articles with matching tags
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    } else {
      // Otherwise, show articles from same category
      query = query.eq('category', category)
    }

    const { data, error } = await query
      .order('published_at', { ascending: false })
      .limit(4)

    if (error) throw error

    // If we don't have enough results, fill with category matches
    let articles = data || []
    if (articles.length < 4) {
      const { data: categoryArticles } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(4 - articles.length)

      if (categoryArticles) {
        // Avoid duplicates
        const existingIds = new Set(articles.map((a) => a.id))
        const newArticles = categoryArticles.filter(
          (a) => !existingIds.has(a.id)
        )
        articles = [...articles, ...newArticles]
      }
    }

    if (articles.length === 0) return null

    const relatedArticles: ArticleCardProps[] = articles.map(
      (article: Article) => ({
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
      })
    )

    return (
      <div>
        <h2 className="mb-8 text-3xl font-bold">Related Articles</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {relatedArticles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return null
  }
}
