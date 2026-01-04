'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface ArticleContentProps {
  content: string
}

/**
 * Article content renderer with markdown support
 * Features: syntax highlighting, GFM support, custom styling
 */
export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom component renderers for better styling
          h2: ({ children, ...props }) => (
            <h2 id={String(children).toLowerCase().replace(/\s+/g, '-')} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={String(children).toLowerCase().replace(/\s+/g, '-')} {...props}>
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
