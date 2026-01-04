# UK Health & Safety News Platform

A world-class, modern news website for UK health and safety intelligence, built with Next.js 14+, TypeScript, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)

## ✨ Features

### Design Excellence
- **Premium UI** inspired by Instabase.ai's visual excellence
- **Gradient accents** (blue to purple) for brand identity
- **Glass morphism effects** for modern card designs
- **Micro-interactions** on all interactive elements
- **Smooth dark mode** transitions
- **Responsive design** optimized for all devices

### Homepage Sections
1. **Hero Section** - Animated gradient background with floating particles
2. **Featured Stories** - Large article cards with hover zoom effects
3. **Latest Updates** - Masonry grid layout with real-time badges
4. **Category Navigation** - Horizontal scroll with smooth snap points
5. **Trending Topics** - Animated tag cloud
6. **Newsletter CTA** - Bold section with social proof

### Article Pages
- **Parallax hero images** with gradient overlays
- **Reading progress bar** showing scroll position
- **Table of contents** auto-generated from headings
- **Social share buttons** with native share API
- **Related articles** carousel
- **Reading time estimates**
- **View count tracking**

### Technical Features
- **Next.js 14+ App Router** with Server Components
- **Incremental Static Regeneration (ISR)** for optimal performance
- **Edge Runtime** for API routes
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Supabase** for database and backend
- **SEO optimized** with meta tags and JSON-LD
- **Accessibility** (WCAG 2.1 AA compliant)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd HSE_News_Reporter
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Set up the database**
- Go to your Supabase project dashboard
- Navigate to the SQL Editor
- Copy and paste the contents of `supabase/schema.sql`
- Run the SQL to create tables, indexes, and sample data

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site!

## 📁 Project Structure

```
HSE_News_Reporter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   ├── articles/          # Article pages
│   │   │   └── [slug]/        # Dynamic article routes
│   │   ├── api/               # API routes
│   │   │   ├── subscribe/     # Newsletter endpoint
│   │   │   └── articles/      # Article endpoints
│   │   ├── sitemap.ts         # Dynamic sitemap
│   │   └── robots.ts          # Robots.txt
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Header, Footer
│   │   ├── article/           # Article components
│   │   ├── home/              # Homepage sections
│   │   └── theme-toggle.tsx   # Dark mode toggle
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── utils.ts           # Utility functions
│   │   └── constants.ts       # App constants
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── public/                     # Static assets
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) to Purple (#8b5cf6) gradients
- **Incidents**: Red (#ef4444)
- **Regulations**: Blue (#3b82f6)
- **Best Practices**: Green (#10b981)

### Typography
- **Font Family**: Inter (Geist Sans)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, leading-relaxed

### Components
All UI components are built with shadcn/ui and fully customizable:
- Button with gradient variant
- Card with hover effects
- Badge with category colors
- Input with focus states
- Progress bar with gradient
- Skeleton for loading states

## 🗄️ Database Schema

### Tables

#### `articles`
Stores all article content with metadata
- `id` (UUID): Primary key
- `title` (TEXT): Article title
- `slug` (TEXT): URL-friendly slug
- `content` (TEXT): Markdown content
- `excerpt` (TEXT): Short summary
- `category` (TEXT): Category slug
- `tags` (TEXT[]): Array of tags
- `author` (TEXT): Author name
- `published_at` (TIMESTAMP): Publication date
- `featured_image_url` (TEXT): Image URL
- `status` (ENUM): draft | published | archived
- `views_count` (INT): View counter
- `reading_time` (INT): Minutes to read

#### `categories`
Category definitions
- `id` (UUID): Primary key
- `name` (TEXT): Display name
- `slug` (TEXT): URL slug
- `color` (TEXT): Hex color
- `icon` (TEXT): Icon name
- `description` (TEXT): Category description

#### `newsletter_subscribers`
Email subscribers
- `id` (UUID): Primary key
- `email` (TEXT): Email address
- `verified` (BOOLEAN): Verification status
- `subscribed_at` (TIMESTAMP): Subscription date

See `supabase/schema.sql` for complete schema with indexes and RLS policies.

## 🔌 API Endpoints

### Public API

#### Get Articles
```
GET /api/articles?page=1&limit=12&category=workplace-safety&search=fire
```

Response:
```json
{
  "articles": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasMore": true
  }
}
```

#### Subscribe to Newsletter
```
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Get Trending Articles
```
GET /api/articles/trending
```

## 🎯 Performance

### Lighthouse Scores (Target)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Optimization Techniques
- Image optimization with next/image
- Code splitting with dynamic imports
- ISR for static generation with revalidation
- Edge runtime for API routes
- Font optimization with display swap
- Lazy loading for heavy components

## ♿ Accessibility

- **WCAG 2.1 AA compliant**
- Semantic HTML throughout
- Keyboard navigation support
- Screen reader optimized
- Focus visible states
- High contrast mode support
- Reduced motion preferences respected

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables from `.env.local`
- Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- **Netlify**: Use the Next.js plugin
- **AWS Amplify**: Configure build settings
- **DigitalOcean App Platform**: Deploy from GitHub
- **Self-hosted**: Use `npm run build` and `npm start`

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Adding New Categories

1. Update `src/lib/constants.ts` with the new category
2. Add the category to Supabase via SQL Editor:
```sql
INSERT INTO categories (name, slug, color, icon, description)
VALUES ('New Category', 'new-category', '#hexcolor', 'IconName', 'Description');
```

### Creating Articles

You can create articles directly in Supabase:

1. Go to Table Editor > articles
2. Click "Insert row"
3. Fill in the required fields
4. Set status to 'published'
5. The article will appear on the site automatically

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email [support@hsenews.uk](mailto:support@hsenews.uk) or open an issue on GitHub.

## 🙏 Acknowledgments

- Design inspired by [Instabase.ai](https://instabase.ai)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Database powered by [Supabase](https://supabase.com)
- Framework by [Next.js](https://nextjs.org)

---

Built with ❤️ for UK Health & Safety professionals
