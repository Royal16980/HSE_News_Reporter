# HSE News Admin PWA

A sleek, mobile-first Progressive Web App for managing the UK Health & Safety News platform on-the-go.

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for iPhone with safe area insets
- **Gesture-Based**: Instagram Stories-style swipe interactions
- **Performance**: 60fps animations with haptic feedback
- **Offline-First**: Full functionality without internet connection
- **Minimal**: Clean interface inspired by Instabase.ai

## ✨ Key Features

### 📱 PWA Capabilities
- ✅ Install to home screen (iOS & Android)
- ✅ Offline functionality with service worker
- ✅ Background sync for queued actions
- ✅ Push notifications
- ✅ Haptic feedback
- ✅ Fullscreen mode

### 🎯 Core Functionality
- **Review Queue**: Tinder-style card stack for article review
- **Swipe Gestures**: Right (approve), Left (reject), Up (preview), Down (snooze)
- **Quick Editor**: Minimal markdown editor with auto-save
- **Schedule Calendar**: Week view with drag-to-reschedule
- **Analytics Dashboard**: Real-time metrics and charts
- **Settings**: Appearance, notifications, workflow preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Access to Supabase project (same as main website)
- Mobile device or browser DevTools for testing

### Installation

```bash
cd admin-pwa
npm install
```

### Configuration

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development

```bash
npm run dev
```

Visit http://localhost:3001 on your mobile device (use ngrok for remote testing)

### Testing on Mobile

**iOS**:
1. Open Safari on iPhone
2. Go to http://your-ip:3001
3. Tap Share → Add to Home Screen
4. Open from home screen (launches in fullscreen)

**Android**:
1. Open Chrome on Android
2. Go to http://your-ip:3001
3. Tap "Install App" prompt
4. Open from home screen

## 📂 Project Structure

```
admin-pwa/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # App icons (72-512px)
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── review/        # Review queue
│   │   │   ├── schedule/      # Calendar view
│   │   │   ├── analytics/     # Dashboard
│   │   │   └── settings/      # User settings
│   │   ├── layout.tsx         # Root layout with PWA setup
│   │   ├── page.tsx           # Landing/redirect
│   │   └── offline/           # Offline fallback page
│   │
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── auth/              # Login, biometric
│   │   ├── review/            # Article cards, gestures
│   │   ├── schedule/          # Calendar components
│   │   ├── analytics/         # Charts, metrics
│   │   ├── editor/            # Markdown editor
│   │   └── shared/            # Layout, navigation
│   │
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Helpers
│   │   ├── gestures/          # Gesture detection
│   │   ├── haptics.ts         # Haptic feedback
│   │   ├── pwa.ts             # PWA utilities
│   │   └── offline-queue.ts   # IndexedDB queue
│   │
│   ├── stores/                # Zustand state
│   │   ├── auth.ts
│   │   ├── ui.ts
│   │   └── articles.ts
│   │
│   └── types/                 # TypeScript types
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎮 Gesture Controls

### Review Queue

| Gesture | Action | Visual Feedback |
|---------|--------|----------------|
| **Swipe Right** | Approve article | Green overlay + haptic |
| **Swipe Left** | Reject article | Red overlay + haptic |
| **Swipe Up** | Open full preview | Modal slides up |
| **Swipe Down** | Snooze for later | Card fades out |
| **Tap Card** | View details | Expand animation |
| **Long Press** | Quick actions menu | Menu appears |

### Article Preview

| Gesture | Action |
|---------|--------|
| **Swipe Down** | Close modal |
| **Pull to Refresh** | Reload content |
| **Pinch Zoom** | Zoom images |

## 🎨 Design System

### Colors

```typescript
// Brand
'safety-blue': '#0066FF'      // Primary accent
'oled-black': '#000000'        // Dark mode background

// Status
'status-approved': '#10B981'   // Green
'status-rejected': '#EF4444'   // Red
'status-pending': '#F59E0B'    // Orange
'status-scheduled': '#8B5CF6'  // Purple
```

### Typography
- **Font**: Inter
- **Headings**: Bold, tracking-tight
- **Body**: Regular, line-height 1.5

### Spacing
- Uses iOS safe area insets
- Bottom tab bar: 60px + safe-bottom
- Card padding: 16px
- Section spacing: 24px

### Animations
- **Duration**: 300ms (standard), 200ms (fast)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Spring physics**: For card swipes

## 🔧 Technical Stack

### Core
- **Next.js 14+** - App Router, Server Components
- **React 18+** - Hooks, Context
- **TypeScript** - Strict mode
- **Tailwind CSS** - Utility-first styling

### UI & Animations
- **Framer Motion** - Advanced animations
- **Radix UI** - Accessible primitives
- **react-use-gesture** - Gesture recognition
- **Lucide React** - Icons

### State & Data
- **TanStack Query** - Server state
- **Zustand** - UI state
- **React Hook Form** - Forms
- **Zod** - Validation

### Backend
- **Supabase** - Auth, database, real-time
- **IndexedDB** - Offline queue

### Charts & Viz
- **Recharts** - Analytics charts
- **date-fns** - Date handling

## 📱 PWA Features

### Service Worker

**Caching Strategies**:
- **API requests**: Network-first with cache fallback
- **Images**: Cache-first with network fallback
- **Pages**: Stale-while-revalidate
- **Static assets**: Cache-first

**Offline Queue**:
- Actions stored in IndexedDB
- Background sync when online
- Visual indicator for queued actions

### Push Notifications

**Types**:
- High-priority article alerts
- Daily digest
- Schedule reminders
- System notifications

**Implementation**:
```typescript
// Request permission
const permission = await Notification.requestPermission()

// Subscribe to push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
})
```

### Install Prompt

**iOS**: Manual (Safari → Share → Add to Home Screen)
**Android**: Automatic prompt after engagement

```typescript
// Detect installation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  showInstallPrompt(e)
})

// Track installation
window.addEventListener('appinstalled', () => {
  logEvent('pwa_installed')
})
```

## 🔐 Security

### Authentication
- Supabase Auth with magic links
- Optional biometric (Web Authentication API)
- Session management
- Auto-logout on inactivity

### Data Protection
- Row-level security (RLS) in Supabase
- HTTPS only
- No sensitive data in localStorage
- Encrypted offline queue

## 🚀 Performance Optimization

### Code Splitting
- Route-based automatic splitting
- Dynamic imports for heavy components
- Lazy loading for charts

### Image Optimization
- next/image for automatic optimization
- Blur placeholders
- Responsive sizes
- WebP/AVIF formats

### Caching
- Service worker for assets
- React Query for API responses
- Debounced search/filters
- Memoized calculations

### Rendering
- Server Components where possible
- Client Components only for interactivity
- Virtual scrolling for long lists
- Suspense boundaries

## 📊 Analytics & Monitoring

### Tracked Events
- Article review actions (approve/reject/snooze)
- Time spent reviewing
- Gesture usage patterns
- Offline mode usage
- PWA installation
- Push notification engagement

### Performance Metrics
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

## 🧪 Testing

### Manual Testing Checklist

**Gestures**:
- [ ] Swipe right to approve
- [ ] Swipe left to reject
- [ ] Swipe up for preview
- [ ] Swipe down to snooze
- [ ] Pull to refresh works

**Offline Mode**:
- [ ] Queue actions offline
- [ ] Sync when back online
- [ ] Show offline indicator
- [ ] Load cached data

**PWA**:
- [ ] Install to home screen
- [ ] Launch in fullscreen
- [ ] Service worker active
- [ ] Push notifications work
- [ ] Offline page shows

**Cross-Device**:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (split screen)
- [ ] Desktop (fallback UI)

### Automated Testing

```bash
# Run tests
npm test

# E2E tests with Playwright
npm run test:e2e

# Lighthouse audit
npm run lighthouse
```

## 🐛 Troubleshooting

### Service Worker Not Updating

```bash
# Clear all caches
# In Chrome DevTools: Application → Clear storage
# Or programmatically:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
```

### Gestures Not Working

- Check touch events are enabled
- Ensure `touchAction: 'none'` in gesture config
- Verify no conflicting scroll handlers

### Offline Queue Not Syncing

- Check Background Sync API support
- Verify service worker is active
- Inspect IndexedDB for queued actions

### Push Notifications Not Received

- Verify VAPID keys are correct
- Check notification permission granted
- Ensure service worker handles `push` event

## 📖 API Documentation

### Supabase Queries

**Fetch Pending Articles**:
```typescript
const { data } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'pending_review')
  .order('priority', { ascending: false })
  .order('created_at', { ascending: true })
```

**Update Article Status**:
```typescript
const { error } = await supabase
  .from('articles')
  .update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: user.id
  })
  .eq('id', articleId)
```

**Real-time Subscription**:
```typescript
const subscription = supabase
  .channel('articles-changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'articles' },
    (payload) => {
      // Handle new article
    }
  )
  .subscribe()
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel --prod
```

**Environment Variables** (set in Vercel):
- All variables from `.env.local.example`
- Set `NEXT_PUBLIC_APP_URL` to production domain

### PWA Checklist

- [ ] Manifest.json configured
- [ ] Service worker registered
- [ ] All icons generated (72-512px)
- [ ] HTTPS enabled
- [ ] Lighthouse PWA score 90+

## 📱 Mobile-Specific Optimizations

### iOS
- Safe area insets handled
- No bounce scroll on cards
- Custom install instructions
- Status bar styling

### Android
- Install prompt customized
- Notification icons optimized
- Theme color in manifest
- Maskable icons

## 🔄 Future Enhancements

### Phase 2
- [ ] Voice commands for hands-free review
- [ ] AR preview of workplace images
- [ ] Collaborative review mode
- [ ] Advanced analytics (ML insights)
- [ ] Batch operations
- [ ] Custom swipe actions

### Phase 3
- [ ] Native app wrapper (React Native)
- [ ] Wear OS / Apple Watch companion
- [ ] Siri Shortcuts / Google Assistant
- [ ] Offline-first with local-first architecture

## 📄 License

Private - Part of HSE News platform

## 🆘 Support

For issues or questions:
- Check [troubleshooting section](#-troubleshooting)
- Review [main documentation](../README.md)
- Open an issue on GitHub

---

**Built with** ❤️ **for mobile-first content management**

*Version 1.0.0 | January 2025*
