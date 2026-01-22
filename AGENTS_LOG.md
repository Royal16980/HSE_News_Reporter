# 🤖 AGENTS_LOG.md

> **Claude Code activity tracker** • Read before every action • Update after completion

**Last Updated**: 2026-01-15 • **Branch**: `main`

---

## 📸 Repository Snapshot

```
HSE News Reporter - Health & Safety Newsletter Platform
├── Stack: Next.js 14 + TypeScript + Tailwind CSS + Zustand
├── Architecture: Monorepo (main site + admin PWA)
└── Automation: n8n workflows for news aggregation
```

### 🔥 Working Tree Status
```diff
M  .claude/settings.local.json
M  admin-pwa/src/app/(dashboard)/analytics/page.tsx
M  admin-pwa/src/app/(dashboard)/schedule/page.tsx
M  admin-pwa/src/app/(dashboard)/settings/page.tsx
M  admin-pwa/src/app/page.tsx
M  admin-pwa/src/stores/articles.ts
M  package.json
M  src/app/articles/[slug]/page.tsx
M  src/components/home/hero-section.tsx
M  tailwind.config.ts

?? admin-pwa/.next/            # Build artifacts
?? n8n-workflows/IMPROVED/     # Enhanced workflows
?? import-*.{py,js,sh}         # Migration scripts
?? supabase/migrations/003_*   # NEW: Admin PWA schema migration
?? *.md                        # Documentation
```

### 📦 Recent Commits
```
9aca556 feat(automation): Complete n8n workflow automation system v2.0.0
199406f feat(admin-pwa): scaffold auth, layout, and review stack
aca36dd Initial commit: Complete HSE News platform with Admin PWA foundation
```

---

## 📋 Action History

### 2026-01-15

| Time | Action | Files | Status |
|------|--------|-------|--------|
| 15:30 | Created agent activity tracker | `AGENTS_LOG.md` | ✅ |
| 15:32 | Reformatted for developer readability | `AGENTS_LOG.md` | ✅ |
| 15:45 | Researched Claude Code plugins/skills ecosystem | - | ✅ |
| 16:00 | Created Admin PWA schema migration | `migrations/003_admin_pwa_enhancements.sql` | ✅ |

---

## 🗺️ Codebase Map

```
HSE_News_Reporter/
│
├── src/                          # Main Next.js app (public site)
│   ├── app/
│   │   ├── articles/[slug]/      # Article pages (MODIFIED)
│   │   └── ...
│   └── components/
│       └── home/hero-section.tsx # Hero banner (MODIFIED)
│
├── admin-pwa/                    # Admin dashboard (PWA)
│   ├── src/
│   │   ├── app/(dashboard)/      # Dashboard routes
│   │   │   ├── analytics/        # Analytics page (MODIFIED)
│   │   │   ├── schedule/         # Scheduling (MODIFIED)
│   │   │   └── settings/         # Settings (MODIFIED)
│   │   └── stores/
│   │       └── articles.ts       # Article state (MODIFIED)
│   └── .next/                    # Build output (ignored)
│
├── n8n-workflows/                # Automation workflows
│   └── IMPROVED/                 # Enhanced workflow versions
│
└── import-*.{py,js,sh}           # Migration scripts
```

### 🔑 Key Entry Points

| Component | Path | Purpose |
|-----------|------|---------|
| Public Site | `src/app/page.tsx` | Main landing page |
| Admin Dashboard | `admin-pwa/src/app/page.tsx` | Admin home (MODIFIED) |
| Article Display | `src/app/articles/[slug]/page.tsx` | Dynamic article pages (MODIFIED) |
| Analytics | `admin-pwa/src/app/(dashboard)/analytics/page.tsx` | Stats & metrics (MODIFIED) |
| State Store | `admin-pwa/src/stores/articles.ts` | Zustand store (MODIFIED) |

### 🛠️ Tech Stack

```typescript
// Core Framework
Next.js 14 (App Router) + React 18 + TypeScript

// Styling
Tailwind CSS 3.x (modified config)

// State Management
Zustand (articles store modified)

// Automation
n8n workflows (v2.0.0 complete)

// Deployment
PWA-ready admin dashboard
```

---

## 🎯 Current Focus

**Active Work Areas:**
- Admin PWA dashboard pages (analytics, schedule, settings)
- Article display and state management
- Tailwind configuration updates
- Hero section modifications

**Completed:**
- n8n automation system (v2.0.0)
- Admin PWA scaffolding
- Initial platform foundation
- AGENTS_LOG.md setup and structure
- Database schema migration for Admin PWA review workflow

**Available Tools:**
- Claude Code CLI (installed)
- Plugin marketplace: `anthropics/claude-plugins-official`
- Skills marketplace: `anthropics/skills` (not yet installed)

**Recent Schema Changes:**
- Added article review workflow statuses (pending_review, approved, rejected, snoozed)
- Created article_reviews table for audit trail
- Added offline_queue table for PWA offline support
- Added user_preferences table for settings
- Enhanced articles table with approval/rejection tracking
- Added helper functions for review queue management

---

## 📝 Usage Protocol

### Before Any Action:
```bash
1. Read AGENTS_LOG.md for context
2. Check working tree status
3. Review recent action history
```

### After Completing Action:
```bash
1. Update action history table
2. Update working tree status if files changed
3. Add any architectural notes
```

### Log Entry Format:
```
| HH:MM | Brief description | file1.ts, file2.tsx | ✅/🚧/❌ |
```

**Status Codes:**
- ✅ Complete
- 🚧 In Progress
- ❌ Failed/Blocked
