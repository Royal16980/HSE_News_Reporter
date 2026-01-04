# Deployment Guide

## Pre-Deployment Checklist

### ✅ Before You Begin

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables ready
- [ ] Git repository initialized
- [ ] Vercel account created

---

## Step 1: Initialize Git Repository

```bash
# Initialize Git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete HSE News platform with Admin PWA foundation"

# Create main branch
git branch -M main
```

---

## Step 2: Create GitHub Repository

### Option A: Using GitHub CLI
```bash
gh repo create hse-news-platform --public --source=. --remote=origin --push
```

### Option B: Manual
1. Go to https://github.com/new
2. Name: `hse-news-platform`
3. Don't initialize with README (we have files)
4. Click "Create repository"

Then connect:
```bash
git remote add origin https://github.com/YOUR_USERNAME/hse-news-platform.git
git push -u origin main
```

---

## Step 3: Deploy Main Website to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will prompt for configuration)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hse-news-website
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables (click "Environment Variables"):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=https://n8n.srv1246730.hstgr.cloud/webhook/
N8N_SOCIAL_WEBHOOK_URL=https://n8n.srv1246730.hstgr.cloud/webhook/article-published
WEBHOOK_SECRET=generate_random_string_here
REVALIDATE_SECRET=generate_another_random_string
```

6. Click "Deploy"
7. Wait 2-3 minutes
8. Your site is live! 🎉

---

## Step 4: Deploy Admin PWA to Vercel

### Using Vercel CLI

```bash
# Navigate to admin-pwa directory
cd admin-pwa

# Deploy
vercel

# Follow prompts:
# - Project name? hse-news-admin-pwa
# - Directory? ./admin-pwa

# Deploy to production
vercel --prod

# Go back to root
cd ..
```

### Using Vercel Dashboard

1. Create a new project
2. Import same GitHub repo
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin-pwa`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://admin.vercel.app
NEXT_PUBLIC_MAIN_SITE_URL=https://your-main-site.vercel.app
NEXT_PUBLIC_ENABLE_BIOMETRIC_AUTH=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_HAPTICS=true
```

---

## Step 5: Configure Custom Domains (Optional)

### Main Website

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `hsenews.co.uk`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 10-30 minutes)

### Admin PWA

1. Add subdomain (e.g., `admin.hsenews.co.uk`)
2. Configure DNS
3. Update environment variable `NEXT_PUBLIC_APP_URL`

---

## Step 6: Update Supabase Configuration

After deployment, update Supabase settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://your-site.vercel.app`
3. Add Redirect URLs:
   - `https://your-site.vercel.app/auth/callback`
   - `https://admin.vercel.app/auth/callback`

---

## Step 7: Test Production Deployment

### Main Website Checklist

- [ ] Homepage loads
- [ ] Articles display correctly
- [ ] Dark mode toggle works
- [ ] Newsletter signup functional
- [ ] API routes responding
- [ ] Images loading
- [ ] SEO meta tags present
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Robots.txt accessible (/robots.txt)

### Admin PWA Checklist

- [ ] PWA manifest accessible
- [ ] Service worker registers
- [ ] Can install to home screen
- [ ] Offline page works
- [ ] Safe area insets correct on mobile

### Run Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on production URL
lighthouse https://your-site.vercel.app --view
```

**Target Scores**:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 90+ (admin PWA)

---

## Step 8: Set Up Continuous Deployment

Vercel automatically deploys on every push to `main`.

### Configure Branch Deployments

1. In Vercel → Settings → Git
2. Production Branch: `main`
3. Preview Branches: All branches
4. Comment on PR: Enable

### Create Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run type check
        run: npm run type-check

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## Step 9: Configure n8n Webhooks

Update n8n workflow with production URLs:

1. Open n8n workflow
2. Update webhook URLs to production:
   - `https://your-site.vercel.app/api/webhook/article-published`
   - `https://your-site.vercel.app/api/revalidate`

3. Update environment variables in n8n:
   - `NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app`
   - `WEBHOOK_SECRET=your_secret`
   - `REVALIDATE_SECRET=your_secret`

---

## Step 10: Monitor & Optimize

### Set Up Monitoring

**Vercel Analytics** (Automatic):
- Speed Insights
- Web Vitals
- Real User Monitoring

**Sentry (Optional)**:
```bash
npm install @sentry/nextjs

# Run configuration wizard
npx @sentry/wizard@latest -i nextjs
```

### Performance Optimization

1. Review Vercel Analytics
2. Check Edge Function logs
3. Monitor Supabase usage
4. Review error logs

---

## Troubleshooting

### Build Fails on Vercel

**Error: "Module not found"**
```bash
# Ensure all dependencies in package.json
# Check imports use correct paths
# Verify tsconfig.json paths
```

**Error: "Environment variable not found"**
- Add all required env vars in Vercel dashboard
- Restart deployment

### Images Not Loading

**Error: "Invalid src prop"**
- Add domain to `next.config.js` → `images.remotePatterns`
- Redeploy

### API Routes Return 404

**Error: "404 Not Found"**
- Ensure files in `src/app/api/`
- Check runtime config
- Review Vercel function logs

### PWA Not Installing

**Error: "Not installable"**
- Requires HTTPS (Vercel provides this)
- Check manifest.json is accessible
- Verify service worker registers
- Run Lighthouse PWA audit

---

## Environment Variables Reference

### Main Website (Required)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=

# n8n Integration
N8N_API_KEY=
N8N_WEBHOOK_URL=
N8N_SOCIAL_WEBHOOK_URL=
WEBHOOK_SECRET=
REVALIDATE_SECRET=
```

### Admin PWA (Required)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MAIN_SITE_URL=

# Feature Flags
NEXT_PUBLIC_ENABLE_BIOMETRIC_AUTH=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_HAPTICS=true
```

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test all features in production
- [ ] Set up analytics
- [ ] Create first real articles

### Week 2
- [ ] Configure custom domain
- [ ] Set up email notifications
- [ ] Enable n8n automation
- [ ] Test content aggregation
- [ ] Monitor article quality

### Month 1
- [ ] Review analytics
- [ ] Optimize performance
- [ ] Gather user feedback
- [ ] Plan feature updates
- [ ] Start Admin PWA development

---

## Quick Commands Reference

```bash
# Deploy main website
vercel --prod

# Deploy admin PWA
cd admin-pwa && vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]

# Link local to project
vercel link
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review environment variables
3. Test locally first (`npm run build && npm start`)
4. Check Supabase connection
5. Review troubleshooting section above

---

## Success Checklist

- [ ] Git repository created
- [ ] Code pushed to GitHub
- [ ] Main website deployed to Vercel
- [ ] Admin PWA deployed to Vercel
- [ ] Environment variables configured
- [ ] Supabase updated with URLs
- [ ] Custom domain configured (optional)
- [ ] n8n webhooks updated
- [ ] Lighthouse scores verified
- [ ] Production tested end-to-end

---

**Your site is now live!** 🚀

Next steps: [FINAL_PROJECT_SUMMARY.md](FINAL_PROJECT_SUMMARY.md)
