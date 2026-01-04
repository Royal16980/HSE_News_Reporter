# Setup Guide - UK Health & Safety News Website

This guide will walk you through setting up the project from scratch.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- A **Supabase account** ([Sign up free](https://supabase.com))
- A code editor (VS Code recommended)

## Step 1: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd HSE_News_Reporter
npm install
```

This will install:
- Next.js 14+ framework
- React 18+
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Supabase client
- shadcn/ui components
- And more...

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Click "New Project"
5. Choose an organization (or create one)
6. Fill in project details:
   - **Name**: `hse-news` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine to start
7. Click "Create new project"
8. Wait 2-3 minutes for setup to complete

### 2.2 Get Your API Keys

Once your project is ready:

1. Go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Find these values:
   - **Project URL** (starts with `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (another long string - keep this secret!)

### 2.3 Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the contents
5. Paste into the Supabase SQL editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned" - this is good!

This creates:
- `articles` table with sample data
- `categories` table with H&S categories
- `newsletter_subscribers` table
- Indexes for performance
- Security policies (RLS)
- Helper functions

## Step 3: Configure Environment Variables

### 3.1 Create .env.local File

In the project root, create a file named `.env.local`:

```bash
# On Windows
copy .env.local.example .env.local

# On Mac/Linux
cp .env.local.example .env.local
```

### 3.2 Add Your Credentials

Open `.env.local` in your code editor and fill in the values:

```env
# Supabase Configuration (from Step 2.2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service_role key)

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UK Health & Safety News

# Optional: Analytics (leave empty for now)
NEXT_PUBLIC_GA_ID=
```

**Important**: Never commit `.env.local` to version control! It's already in `.gitignore`.

## Step 4: Verify Database Connection

Let's make sure everything is connected:

```bash
# This won't work yet, but we'll create a test script
node -e "require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)"
```

Or just proceed to the next step - you'll know it works when the site loads!

## Step 5: Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

## Step 6: View Your Website

1. Open your browser
2. Go to [http://localhost:3000](http://localhost:3000)
3. You should see the beautiful homepage!

### What You Should See:

✅ **Hero section** with animated gradient background
✅ **Featured articles** (3 sample articles from the database)
✅ **Trending topics** section
✅ **Latest updates** grid
✅ **Newsletter signup** section
✅ **Header** with category navigation
✅ **Footer** with links

### If You See Errors:

**"Failed to fetch articles"**
- Check your Supabase credentials in `.env.local`
- Make sure you ran the `schema.sql` successfully
- Verify RLS policies are enabled

**"Module not found"**
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall

**Port 3000 is already in use**
- Stop other apps using port 3000
- Or run `npm run dev -- -p 3001` to use a different port

## Step 7: Explore the Features

### View an Article

1. Click on any article card on the homepage
2. You should see:
   - Reading progress bar at top
   - Parallax hero image
   - Table of contents (sidebar)
   - Formatted markdown content
   - Share buttons
   - Related articles at the bottom

### Test Dark Mode

1. Click the sun/moon icon in the header
2. The entire site should smoothly transition to dark mode
3. All components should be readable in both modes

### Try the Newsletter Signup

1. Scroll to the newsletter section
2. Enter an email address
3. Click "Subscribe"
4. You should see a success message
5. Check the `newsletter_subscribers` table in Supabase to confirm

### Browse Categories

1. Click any category in the header navigation bar
2. View articles filtered by that category

## Step 8: Add Your Own Content

### Create a New Article

1. Go to your Supabase dashboard
2. Click **Table Editor** > **articles**
3. Click **Insert row**
4. Fill in these fields:
   - **title**: "Your Article Title"
   - **slug**: "your-article-title" (URL-friendly)
   - **content**: Write in Markdown (see sample for formatting)
   - **excerpt**: Short summary (150-200 characters)
   - **category**: Pick from existing categories
   - **tags**: Array of tags, e.g., `["safety", "guide"]`
   - **author**: Your name
   - **reading_time**: Calculate words / 200
   - **status**: Set to `published`
   - **featured_image_url**: URL to an image (use Unsplash for free images)
5. Click **Save**
6. Refresh your website - your article appears!

### Markdown Formatting Examples

Your article content supports full Markdown:

```markdown
# Main Heading

## Section Heading

### Subsection

Regular paragraph text here.

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item

> This is a blockquote for important notes

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)
```

## Step 9: Customize Your Site

### Change Site Name

Edit `src/lib/constants.ts`:

```typescript
export const SITE_CONFIG = {
  name: 'Your Custom Name',
  // ... rest of config
}
```

### Add/Remove Categories

Edit `src/lib/constants.ts` and update the `CATEGORIES` array:

```typescript
export const CATEGORIES = [
  {
    name: 'Your Category',
    slug: 'your-category',
    icon: 'IconName', // from Lucide icons
    description: 'Category description',
  },
  // ... more categories
]
```

Then add to Supabase:

```sql
INSERT INTO categories (name, slug, color, icon, description)
VALUES ('Your Category', 'your-category', '#hex-color', 'IconName', 'Description');
```

### Customize Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))', // Change in globals.css
    // ...
  },
  // ... your custom colors
}
```

## Step 10: Deploy to Production

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**:
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add ALL variables from your `.env.local`
   - Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live! 🎉

### Update Supabase for Production

1. Go to Supabase **Authentication** > **URL Configuration**
2. Add your Vercel domain to **Site URL**
3. Add your domain to **Redirect URLs**

## Troubleshooting

### Images Not Loading

If Supabase Storage images aren't loading:

1. Go to Supabase **Storage**
2. Create a bucket called `articles`
3. Make it public
4. Update `next.config.js` with your Supabase domain

### TypeScript Errors

Run type checking:
```bash
npm run type-check
```

Fix any type errors before deploying.

### Build Errors

If `npm run build` fails:

1. Check all environment variables are set
2. Ensure Supabase connection works
3. Run `npm run lint` to check for code issues
4. Check Next.js build output for specific errors

## Next Steps

Now that you're set up:

1. ✅ Add more articles through Supabase
2. ✅ Customize the design to match your brand
3. ✅ Set up Google Analytics (optional)
4. ✅ Configure a custom domain
5. ✅ Enable email verification for newsletter
6. ✅ Add comment system (future enhancement)
7. ✅ Set up automated content aggregation (see PROJECT.md)

## Need Help?

- 📖 Read the [README.md](README.md) for full documentation
- 📋 Check [PROJECT.md](PROJECT.md) for architecture details
- 🐛 Found a bug? Open an issue on GitHub
- 💬 Questions? Check the Next.js and Supabase docs

---

**Congratulations!** 🎉 You've successfully set up your UK Health & Safety News website.

Happy publishing! 📰
