# Architecture Documentation

## Overview

This document provides a detailed explanation of the project architecture, design decisions, and implementation patterns used in the UK Health & Safety News website.

## Technology Stack

### Core Framework
- **Next.js 14+** with App Router
  - Server Components by default for better performance
  - Client Components only when interactivity is needed
  - ISR (Incremental Static Regeneration) for dynamic static pages
  - Edge Runtime for API routes

### Language
- **TypeScript 5.3+**
  - Strict mode enabled
  - Explicit return types
  - No `any` types
  - Type safety throughout

### Styling
- **Tailwind CSS 3.4+**
  - Utility-first approach
  - Custom design tokens
  - Dark mode with `next-themes`
  - Responsive design (mobile-first)

### UI Components
- **shadcn/ui**
  - Radix UI primitives
  - Fully customizable
  - Accessible by default
  - Copy-paste components

### Animations
- **Framer Motion 11+**
  - Smooth page transitions
  - Hover effects
  - Scroll animations
  - Gesture support

### Database
- **Supabase (PostgreSQL)**
  - Row Level Security (RLS)
  - Real-time capabilities (future)
  - RESTful API
  - Auto-generated types

## Project Structure

```
HSE_News_Reporter/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── globals.css          # Global styles
│   │   ├── articles/            # Article routes
│   │   │   └── [slug]/         # Dynamic article pages
│   │   │       └── page.tsx    # Article detail page
│   │   ├── api/                # API routes (Edge)
│   │   │   ├── subscribe/      # Newsletter endpoint
│   │   │   └── articles/       # Articles API
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   └── robots.ts           # Robots.txt
│   │
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── progress.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx      # Main navigation
│   │   │   └── footer.tsx      # Footer with links
│   │   ├── article/            # Article-specific components
│   │   │   ├── article-card.tsx         # Article preview card
│   │   │   ├── article-content.tsx      # Markdown renderer
│   │   │   ├── reading-progress.tsx     # Scroll progress bar
│   │   │   ├── table-of-contents.tsx    # Auto-generated TOC
│   │   │   ├── share-buttons.tsx        # Social sharing
│   │   │   └── related-articles.tsx     # Related content
│   │   ├── home/               # Homepage sections
│   │   │   ├── hero-section.tsx         # Hero with search
│   │   │   ├── newsletter-section.tsx   # Email signup
│   │   │   └── trending-topics.tsx      # Tag cloud
│   │   ├── theme-provider.tsx  # Dark mode provider
│   │   └── theme-toggle.tsx    # Theme switcher
│   │
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts           # Helper functions
│   │   └── constants.ts       # App constants
│   │
│   └── types/                  # TypeScript types
│       ├── database.ts         # Supabase types
│       └── index.ts            # Common types
│
├── supabase/                   # Database files
│   └── schema.sql             # Database schema
│
├── public/                     # Static assets
│   └── site.webmanifest       # PWA manifest
│
├── Configuration files
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── next.config.js            # Next.js config
├── postcss.config.js         # PostCSS config
├── components.json           # shadcn config
├── .eslintrc.json           # ESLint rules
├── .gitignore               # Git ignore
├── .env.local.example       # Environment template
│
└── Documentation
    ├── README.md             # Main documentation
    ├── SETUP.md             # Setup instructions
    ├── PROJECT.md           # Project overview
    └── ARCHITECTURE.md      # This file
```

## Design Patterns

### 1. Server-First Architecture

**Principle**: Use Server Components by default, Client Components only when needed.

**Benefits**:
- Reduced JavaScript bundle size
- Faster initial page load
- Better SEO
- Automatic code splitting

**Implementation**:
```typescript
// Server Component (default)
export default async function ArticlePage() {
  const article = await getArticle() // Fetches on server
  return <ArticleContent article={article} />
}

// Client Component (when needed)
'use client'
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### 2. Incremental Static Regeneration (ISR)

**Principle**: Pre-render pages at build time, revalidate in the background.

**Benefits**:
- Static page performance
- Always fresh content
- Reduced database load
- Better user experience

**Implementation**:
```typescript
// Revalidate every 60 seconds
export const revalidate = 60

export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### 3. Edge Runtime for API Routes

**Principle**: Run API routes on the edge for minimal latency.

**Benefits**:
- Faster response times
- Global distribution
- Lower costs
- Better scalability

**Implementation**:
```typescript
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Runs on Vercel Edge Network
  return NextResponse.json({ data })
}
```

### 4. Component Composition

**Principle**: Build complex UIs from small, reusable components.

**Benefits**:
- Easier testing
- Better maintainability
- Code reuse
- Clear responsibilities

**Example**:
```typescript
// Base component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Composed component
<ArticleCard {...props}>
  {/* Internal composition */}
</ArticleCard>
```

### 5. Type Safety

**Principle**: Leverage TypeScript for compile-time safety.

**Benefits**:
- Catch errors early
- Better IDE support
- Self-documenting code
- Refactoring confidence

**Implementation**:
```typescript
// Database types from Supabase
export type Article = Database['public']['Tables']['articles']['Row']

// Component props
interface ArticleCardProps {
  title: string
  slug: string
  // ... fully typed
}
```

## Data Flow

### 1. Homepage Data Flow

```
User Request
    ↓
Next.js Server
    ↓
Fetch from Supabase (Server Component)
    ↓
Cache with ISR (60s revalidation)
    ↓
Render HTML on Server
    ↓
Send to Client
    ↓
Hydrate Interactive Components
    ↓
User Interaction (Client Components)
```

### 2. Article Page Data Flow

```
User Clicks Article Link
    ↓
Next.js App Router Navigation
    ↓
Check Static Cache (generateStaticParams)
    ↓
If Not Cached: Fetch from Supabase
    ↓
Increment View Count (Background)
    ↓
Render Article Content
    ↓
Load Related Articles (Suspense)
    ↓
Interactive Features (Client Components)
```

### 3. Newsletter Signup Flow

```
User Enters Email (Client)
    ↓
POST /api/subscribe (Edge Runtime)
    ↓
Validate Email Format
    ↓
Insert to Supabase
    ↓
Check for Duplicates (RLS)
    ↓
Return Success/Error
    ↓
Update UI State (Client)
    ↓
(Future: Send Verification Email)
```

## Performance Optimizations

### 1. Image Optimization

- **next/image** for automatic optimization
- **Blur placeholders** for better perceived performance
- **Responsive images** with srcset
- **Lazy loading** for below-fold images

### 2. Code Splitting

- **Automatic** route-based splitting
- **Dynamic imports** for heavy components
- **Suspense boundaries** for loading states
- **Tree shaking** to remove unused code

### 3. Caching Strategy

- **ISR** for pages (60s-300s revalidation)
- **Edge caching** for API responses
- **Browser caching** for static assets
- **SWR** for client-side data (future)

### 4. Bundle Optimization

- **Server Components** reduce client bundle
- **Font optimization** with display: swap
- **CSS optimization** with Tailwind purge
- **JavaScript minification** in production

## Database Design

### Schema Principles

1. **Normalization**: Related data in separate tables
2. **Indexing**: Fast queries on common patterns
3. **RLS Policies**: Security at database level
4. **Triggers**: Automatic timestamp updates
5. **Functions**: Reusable database logic

### Key Tables

#### articles
- **Purpose**: Store all article content
- **Indexes**: slug, category, published_at, tags (GIN)
- **RLS**: Public read for published, admin write
- **Relationships**: References categories

#### categories
- **Purpose**: Define content categories
- **Indexes**: slug (unique)
- **RLS**: Public read, admin write
- **Metadata**: Color, icon for UI

#### newsletter_subscribers
- **Purpose**: Email list management
- **Indexes**: email (unique)
- **RLS**: Insert-only for public
- **Features**: Verification token support

### Query Patterns

**List Articles with Pagination**:
```sql
SELECT * FROM articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 12 OFFSET 0
```

**Full-Text Search**:
```sql
SELECT * FROM articles
WHERE to_tsvector('english', title || ' ' || content)
      @@ to_tsquery('english', 'safety & fire')
```

**Increment View Count**:
```sql
CREATE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET views_count = views_count + 1
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;
```

## Security

### Authentication
- Currently public site (no auth required)
- Future: Supabase Auth for admin panel
- RLS policies enforce permissions

### API Security
- **Rate limiting** (planned)
- **CORS** configured for specific domains
- **Input validation** on all endpoints
- **SQL injection** prevented by Supabase

### Content Security
- **CSP headers** in next.config.js
- **XSS protection** via React escaping
- **HTTPS** enforced in production
- **Secure cookies** for sessions (future)

## Accessibility

### WCAG 2.1 AA Compliance

1. **Semantic HTML**: Proper heading hierarchy
2. **Keyboard Navigation**: All interactive elements
3. **Focus Management**: Visible focus indicators
4. **ARIA Labels**: Screen reader support
5. **Color Contrast**: 4.5:1 minimum ratio
6. **Alt Text**: All images described
7. **Skip Links**: Navigate to main content
8. **Reduced Motion**: Respect user preferences

### Implementation

```typescript
// Focus visible styles
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// ARIA labels
<button aria-label="Toggle dark mode">
  <Sun className="h-5 w-5" />
</button>
```

## SEO Strategy

### On-Page SEO

1. **Meta Tags**: Dynamic for each page
2. **Open Graph**: Social media previews
3. **JSON-LD**: Structured data for articles
4. **Canonical URLs**: Prevent duplicates
5. **Sitemap**: Auto-generated, updated daily
6. **Robots.txt**: Guide search crawlers

### Technical SEO

1. **Fast Loading**: 95+ Lighthouse score
2. **Mobile-First**: Responsive design
3. **HTTPS**: Secure connections
4. **URL Structure**: Clean, descriptive slugs
5. **Internal Linking**: Related articles
6. **Image Optimization**: Alt text, compression

### Content SEO

1. **Keyword Research**: H&S industry terms
2. **Heading Structure**: Proper H1-H6
3. **Reading Time**: User engagement metric
4. **Fresh Content**: ISR keeps pages updated
5. **Long-Form**: Detailed, comprehensive articles

## Future Enhancements

### Phase 1 (Current)
✅ Public website
✅ Article management
✅ Newsletter signup
✅ SEO optimization
✅ Dark mode
✅ Responsive design

### Phase 2 (Planned)
- [ ] Admin PWA for mobile content management
- [ ] Push notifications for breaking news
- [ ] Advanced search with filters
- [ ] User comments system
- [ ] Article bookmarking
- [ ] Email newsletter automation

### Phase 3 (Future)
- [ ] n8n automation for content aggregation
- [ ] AI-powered article summarization
- [ ] Multi-language support
- [ ] Premium subscription tier
- [ ] Native mobile apps
- [ ] Podcast integration

## Development Workflow

### Local Development
1. Make changes in feature branch
2. Test locally with `npm run dev`
3. Run type check: `npm run type-check`
4. Run linter: `npm run lint`
5. Test build: `npm run build`
6. Commit with conventional commits

### Deployment
1. Push to GitHub main branch
2. Vercel auto-deploys
3. Runs build checks
4. Deploys to production
5. Invalidates CDN cache
6. Available globally in ~30s

### Monitoring
- Vercel Analytics for performance
- Error tracking (future: Sentry)
- Database monitoring via Supabase
- Uptime monitoring (future)

## Conclusion

This architecture prioritizes:
- **Performance**: Fast, optimized delivery
- **User Experience**: Smooth, intuitive interface
- **Developer Experience**: Type-safe, maintainable code
- **Scalability**: Handles growth efficiently
- **Security**: Protected by default
- **Accessibility**: Inclusive design

The modular structure allows for easy maintenance and feature additions while maintaining high code quality and performance standards.
