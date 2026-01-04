# ⚡ Quick Start Guide

Get your UK Health & Safety News website running in **5 minutes**!

---

## Step 1: Install Dependencies (1 min)

```bash
cd HSE_News_Reporter
npm install
```

*Installs all required packages (~2 minutes on first run)*

---

## Step 2: Set Up Supabase (2 min)

### A. Create Account & Project
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**
3. Name: `hse-news` | Password: (save it!) | Region: (closest to you)
4. Wait ~2 mins for setup

### B. Run Database Schema
1. In Supabase dashboard → Click **SQL Editor** (sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` from this project
4. Copy **all contents** → Paste in Supabase
5. Click **Run** (Ctrl/Cmd + Enter)
6. Should see "Success. No rows returned" ✅

### C. Get API Keys
1. Click **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJ...` (long string)
   - **service_role**: `eyJ...` (another long string - keep secret!)

---

## Step 3: Configure Environment (30 sec)

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local (use your values from Step 2C)
```

**Required values**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

### ✅ Success!

Open [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ Animated hero section
- ✅ 3 sample articles
- ✅ Category navigation
- ✅ Newsletter signup
- ✅ Dark mode toggle

---

## Step 5: Test Features (1 min)

### Click an Article
- See reading progress bar
- Try table of contents
- Test share buttons
- Check dark mode

### Add Your Own Article
1. Go to Supabase → **Table Editor** → **articles**
2. Click **Insert row**
3. Fill in:
   - **title**: "My First Article"
   - **slug**: "my-first-article"
   - **content**: "# Hello World\n\nThis is my article."
   - **excerpt**: "My first test article"
   - **category**: "workplace-safety"
   - **tags**: `["test"]`
   - **status**: "published"
   - **reading_time**: 1
4. **Save** → Refresh website → See your article! 🎉

---

## 🚨 Troubleshooting

### "Failed to fetch articles"
- Check `.env.local` has correct Supabase credentials
- Make sure you ran `schema.sql` successfully
- Verify Supabase project is active

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
```

### "Port 3000 in use"
```bash
npm run dev -- -p 3001
```

### Database connection errors
- Check Supabase dashboard is loading
- Verify API keys are correct (no extra spaces)
- Try creating a new API key in Supabase Settings

---

## 🎯 Next Steps

### Customize Your Site
1. **Change Site Name**: Edit `src/lib/constants.ts`
2. **Update Colors**: Edit `tailwind.config.ts`
3. **Add Categories**: Run SQL in Supabase
4. **Create Articles**: Use Supabase Table Editor

### Deploy to Production
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Add environment variables
# 4. Deploy! 🚀
```

### Set Up n8n Automation
1. Open your n8n instance: `https://n8n.srv1246730.hstgr.cloud`
2. Import workflow: `n8n-workflows/hse-content-aggregator.json`
3. Configure credentials (Supabase, Anthropic)
4. Test manually → Activate
5. See [docs/N8N_INTEGRATION.md](docs/N8N_INTEGRATION.md) for details

---

## 📚 Full Documentation

- **Setup Guide**: [SETUP.md](SETUP.md)
- **Features Overview**: [README.md](README.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **n8n Integration**: [docs/N8N_INTEGRATION.md](docs/N8N_INTEGRATION.md)
- **Project Roadmap**: [PROJECT.md](PROJECT.md)

---

## 💡 Pro Tips

### Development
- Use `npm run type-check` before committing
- Run `npm run build` to test production build
- Check browser console for errors
- Use React DevTools for debugging

### Content Management
- Write articles in Markdown for formatting
- Use Unsplash for free featured images
- Keep excerpts under 200 characters
- Choose appropriate categories

### Performance
- Images auto-optimize via next/image
- Pages cache with ISR (60s-300s)
- API routes run on Edge for speed
- Dark mode persists via localStorage

---

## 🆘 Need Help?

### Quick Fixes
- **Clear cache**: Delete `.next` folder → Restart dev server
- **Reset database**: Re-run `schema.sql` in Supabase
- **Fresh install**: Delete `node_modules` → `npm install`

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs

### Files to Check
- Homepage code: `src/app/page.tsx`
- Article page: `src/app/articles/[slug]/page.tsx`
- Database schema: `supabase/schema.sql`
- Config: `next.config.js`, `tailwind.config.ts`

---

## ✨ You're All Set!

Your world-class H&S news website is ready. Now:
1. ✅ Customize the design
2. ✅ Add your content
3. ✅ Set up automation
4. ✅ Deploy to production

**Welcome to your new platform!** 🎉

---

*Estimated total setup time: **5 minutes***
*Prerequisites: Node.js 18+, Supabase account (free)*
