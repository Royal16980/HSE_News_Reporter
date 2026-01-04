'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'

interface TableOfContentsProps {
  content: string
}

interface TocItem {
  id: string
  title: string
  level: number
}

/**
 * Table of contents component
 * Auto-generates from h2 and h3 headings in markdown
 */
export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>('')
  const [items, setItems] = React.useState<TocItem[]>([])

  // Extract headings from markdown content
  React.useEffect(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    const matches = [...content.matchAll(headingRegex)]

    const tocItems: TocItem[] = matches.map((match) => {
      const level = match[1].length
      const title = match[2]
      const id = title.toLowerCase().replace(/\s+/g, '-')
      return { id, title, level }
    })

    setItems(tocItems)
  }, [content])

  // Track scroll position to highlight active heading
  React.useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky top-24 rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <List className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Table of Contents</h3>
      </div>

      <nav>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                paddingLeft: item.level === 3 ? '1rem' : '0',
              }}
            >
              <button
                onClick={() => handleClick(item.id)}
                className={`text-left transition-colors hover:text-primary w-full ${
                  activeId === item.id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.title}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
