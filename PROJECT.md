# SafetyNews Pro - Workspace Documentation

## Project Overview

**SafetyNews Pro** is a fully automated UK Health & Safety news platform consisting of three interconnected systems:

1. **Public Website** - Next.js-based news portal with modern UI
2. **Mobile Admin PWA** - React-based progressive web app for content management
3. **Automation Engine** - n8n workflow for content aggregation and AI processing

**Tech Stack:** Next.js 14+, TypeScript, Supabase, n8n, Tailwind CSS, Framer Motion

---

## Current Implementation Status

This codebase currently includes the **Public Website** component with:
- Modern, premium UI inspired by Instabase.ai
- Full TypeScript and Next.js 14+ App Router implementation
- Responsive design with dark mode support
- SEO-optimized article pages
- Supabase integration for content management
- Framer Motion animations
- Accessibility (WCAG 2.1 AA compliant)

The Mobile Admin PWA and n8n Automation Engine are planned for future phases.

---

## Key Features

### Design Excellence
- **Gradient accents** (blue to purple) representing safety and professionalism
- **Glass morphism effects** for cards and overlays
- **Micro-interactions** on hover states
- **Smooth transitions** between dark and light modes
- **Premium typography** using Inter/Geist font family

### Homepage Structure
1. **Hero Section** - Animated gradient background with search and trust indicators
2. **Featured Stories** - Large article cards with hover effects
3. **Latest Updates** - Masonry grid layout with real-time badges
4. **Category Navigation** - Sticky horizontal scroll with smooth snap points
5. **Trending Topics** - Animated tag cloud
6. **Newsletter CTA** - Bold section with social proof

### Technical Features
- **ISR (Incremental Static Regeneration)** for optimal performance
- **Edge Runtime** for API routes
- **Next/Image** with blur placeholders
- **Structured data** with JSON-LD for SEO
- **Service worker ready** for offline reading
- **Automatic sitemap** generation

---

## Environment Variables

### Required Setup
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UK Health & Safety News
```

---

## Getting Started

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations (see supabase/schema.sql)
# Execute the schema.sql in your Supabase SQL editor

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the site.

### Database Setup
1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql` in the SQL Editor
3. This will create tables, sample data, and indexes
4. Update your `.env.local` with the project credentials

---

## Project Structure
```
HSE_News_Reporter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles & Tailwind
│   │   ├── articles/          # Article listing & detail pages
│   │   ├── category/          # Category pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Header, Footer
│   │   ├── article/           # Article cards, grids
│   │   ├── home/              # Homepage sections
│   │   └── theme-toggle.tsx   # Dark mode toggle
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts           # Utility functions
│   │   └── constants.ts       # App constants
│   └── types/
│       ├── database.ts        # Supabase types
│       └── index.ts           # Common types
├── public/                     # Static assets
├── supabase/
│   └── schema.sql             # Database schema
└── package.json
```

---

## Database Schema

### Core Tables
- **articles** - Article content with metadata, tags, and status
- **categories** - Category definitions with colors and icons
- **newsletter_subscribers** - Email subscribers list

See `supabase/schema.sql` for complete schema with indexes and RLS policies.

---

## Development Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Type checking
npm run type-check   # Run TypeScript compiler

# Linting
npm run lint         # Run ESLint
```

---

## Performance Targets

- **Lighthouse Score:** 95+ on all metrics
- **First Contentful Paint:** < 1.5s
- **Lazy loading:** For images and heavy components
- **ISR:** Automatic page regeneration

---

## Code Conventions

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Use `type` for object shapes

### React Components
- Server components by default
- Use `'use client'` only when necessary
- Props interface named `ComponentNameProps`

### Styling
- Tailwind utility classes
- Custom CSS in `globals.css`
- Responsive-first approach

---

## Future Roadmap

### Phase 2 - Admin PWA
- Mobile-first progressive web app
- Swipe gesture article review
- Offline capability
- Push notifications

### Phase 3 - Automation
- n8n workflow integration
- AI content aggregation
- Auto-publishing scheduler
- Social media distribution

---

## Support

For issues or questions:
- Check documentation in `/docs` folder
- Review Supabase logs for database errors
- Use Next.js documentation: https://nextjs.org/docs

---

**Last Updated:** January 2025
**Version:** 1.0.0 (Website Component Only)
**Framework:** Next.js 14+ with App Router
