'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Eye, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime, getCategoryColor } from '@/lib/utils'
import type { ArticleCardProps } from '@/types'

/**
 * Article card component with hover animations
 * Features: category badge, reading time, view count, gradient border on hover
 */
export function ArticleCard({
  id,
  title,
  slug,
  excerpt,
  category,
  tags,
  author,
  publishedAt,
  featuredImageUrl,
  readingTime,
  viewsCount,
  isFeatured = false,
}: ArticleCardProps) {
  const categoryColors = getCategoryColor(category)
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/articles/${slug}`} className="block group">
        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 h-full',
            'hover:shadow-2xl hover:shadow-primary/10',
            isFeatured && 'border-2 border-primary/20'
          )}
        >
          {/* Featured Image */}
          {featuredImageUrl && (
            <div className="relative aspect-video overflow-hidden bg-muted">
              <Image
                src={featuredImageUrl}
                alt={title}
                fill
                className={cn(
                  'object-cover transition-transform duration-500',
                  isHovered && 'scale-110'
                )}
                sizes={
                  isFeatured
                    ? '(max-width: 768px) 100vw, 66vw'
                    : '(max-width: 768px) 100vw, 33vw'
                }
              />

              {/* Category Badge Overlay */}
              <div className="absolute top-4 left-4">
                <Badge
                  className={cn(
                    'font-semibold shadow-lg',
                    categoryColors.bg,
                    categoryColors.text,
                    categoryColors.border
                  )}
                >
                  {category}
                </Badge>
              </div>

              {/* "NEW" Badge for recent articles */}
              {new Date(publishedAt).getTime() >
                Date.now() - 24 * 60 * 60 * 1000 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-500 text-white animate-pulse-glow">
                    NEW
                  </Badge>
                </div>
              )}
            </div>
          )}

          <CardContent className="p-6">
            {/* Title */}
            <h3
              className={cn(
                'font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors',
                isFeatured ? 'text-2xl' : 'text-xl'
              )}
            >
              {title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              {/* Author */}
              <span className="font-medium">{author}</span>

              {/* Reading Time */}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min</span>
              </div>

              {/* View Count */}
              {viewsCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{viewsCount}</span>
                </div>
              )}
            </div>

            {/* Published Date */}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeTime(publishedAt)}</span>
            </div>
          </CardFooter>

          {/* Animated Border Gradient */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))',
              padding: '2px',
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
        </Card>

        {/* Read More Link */}
        {isFeatured && (
          <motion.div
            className="flex items-center space-x-2 mt-4 text-primary font-medium group"
            initial={{ x: 0 }}
            animate={{ x: isHovered ? 4 : 0 }}
          >
            <span>Read Full Article</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        )}
      </Link>
    </motion.div>
  )
}
