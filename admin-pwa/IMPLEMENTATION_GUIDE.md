# HSE News Admin PWA - Implementation Guide

## Overview

This guide provides the complete implementation roadmap for the mobile-first Admin PWA. The foundation has been set up - this document outlines how to build the remaining components.

---

## ✅ What's Already Created

### Core Configuration
- ✅ [package.json](package.json) - All dependencies configured
- ✅ [tsconfig.json](tsconfig.json) - TypeScript setup
- ✅ [tailwind.config.ts](tailwind.config.ts) - Design system with mobile-first utilities
- ✅ [next.config.js](next.config.js) - PWA-optimized Next.js config
- ✅ [.env.local.example](.env.local.example) - Environment template

### PWA Foundation
- ✅ [public/manifest.json](public/manifest.json) - Complete PWA manifest
- ✅ [public/sw.js](public/sw.js) - Service worker with caching strategies
- ✅ [README.md](README.md) - Comprehensive documentation

---

## 📋 Implementation Checklist

### Phase 1: Core Setup (Week 1)

#### Day 1-2: Foundation
- [ ] Run `npm install` to install dependencies
- [ ] Create `src/lib/supabase.ts` (Supabase client)
- [ ] Create `src/lib/utils.ts` (utility functions)
- [ ] Create `src/lib/haptics.ts` (haptic feedback)
- [ ] Create `src/lib/pwa.ts` (PWA utilities)

#### Day 3-4: Authentication
- [ ] Create `src/app/(auth)/login/page.tsx`
- [ ] Create `src/components/auth/LoginForm.tsx`
- [ ] Create `src/components/auth/BiometricAuth.tsx`
- [ ] Create `src/stores/auth.ts` (Zustand store)
- [ ] Implement magic link flow
- [ ] Add biometric authentication (WebAuthn API)

#### Day 5: Layout & Navigation
- [ ] Create `src/app/layout.tsx` (PWA setup, theme provider)
- [ ] Create `src/components/shared/BottomTabBar.tsx`
- [ ] Create `src/components/shared/SafeAreaWrapper.tsx`
- [ ] Create `src/stores/ui.ts` (UI state)

### Phase 2: Review Queue (Week 2)

#### Day 1-3: Card Stack Component
- [ ] Create `src/components/review/ArticleCard.tsx`
- [ ] Create `src/components/review/CardStack.tsx`
- [ ] Create `src/lib/gestures/useSwipeGesture.ts`
- [ ] Implement swipe physics with spring animations
- [ ] Add haptic feedback on gestures

```typescript
// Example: useSwipeGesture.ts
import { useGesture } from 'react-use-gesture'
import { useSpring, animated } from 'framer-motion'
import { triggerHaptic } from '@/lib/haptics'

export function useSwipeGesture(onSwipe: (direction: string) => void) {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity, direction: [xDir] }) => {
      const trigger = velocity > 0.2
      const dir = xDir < 0 ? 'left' : 'right'

      if (!down && trigger) {
        triggerHaptic(dir === 'right' ? 'medium' : 'heavy')
        onSwipe(dir)
      }

      api.start({
        x: down ? mx : 0,
        y: down ? my : 0,
        immediate: down,
      })
    },
  })

  return { bind, style: { x, y } }
}
```

#### Day 4-5: Queue Management
- [ ] Create `src/app/(dashboard)/review/page.tsx`
- [ ] Create `src/stores/articles.ts` (article queue state)
- [ ] Implement pull-to-refresh
- [ ] Add priority sorting
- [ ] Create offline queue system

### Phase 3: Article Preview & Editor (Week 3)

#### Day 1-2: Preview Modal
- [ ] Create `src/components/review/ArticlePreview.tsx`
- [ ] Implement slide-up modal with gesture close
- [ ] Add markdown renderer
- [ ] Create sticky action bar

#### Day 3-4: Quick Editor
- [ ] Create `src/components/editor/MarkdownEditor.tsx`
- [ ] Create `src/components/editor/EditorToolbar.tsx`
- [ ] Implement auto-save to localStorage
- [ ] Add image upload functionality

```typescript
// Example: MarkdownEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

export function MarkdownEditor({ articleId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent)
  const debouncedContent = useDebounce(content, 1000)

  useEffect(() => {
    // Auto-save to localStorage
    localStorage.setItem(`draft-${articleId}`, debouncedContent)
  }, [debouncedContent, articleId])

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-full h-full p-4 font-mono resize-none"
      placeholder="Start writing..."
    />
  )
}
```

#### Day 5: Action Handlers
- [ ] Create `src/lib/api/articles.ts` (API functions)
- [ ] Implement approve/reject/schedule actions
- [ ] Add optimistic UI updates
- [ ] Handle offline queue

### Phase 4: Schedule & Analytics (Week 4)

#### Day 1-3: Schedule View
- [ ] Create `src/app/(dashboard)/schedule/page.tsx`
- [ ] Create `src/components/schedule/WeekCalendar.tsx`
- [ ] Create `src/components/schedule/ScheduledArticleBlock.tsx`
- [ ] Implement drag-to-reschedule
- [ ] Add time picker modal

#### Day 4-5: Analytics Dashboard
- [ ] Create `src/app/(dashboard)/analytics/page.tsx`
- [ ] Create `src/components/analytics/MetricCard.tsx`
- [ ] Create `src/components/analytics/ViewsChart.tsx`
- [ ] Create `src/components/analytics/CategoryPieChart.tsx`
- [ ] Integrate Recharts

```typescript
// Example: MetricCard.tsx
export function MetricCard({ title, value, change, icon: Icon }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        <Icon className="w-5 h-5 text-safety-blue" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change > 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  )
}
```

### Phase 5: Settings & Polish (Week 5)

#### Day 1-2: Settings Page
- [ ] Create `src/app/(dashboard)/settings/page.tsx`
- [ ] Create `src/components/settings/ProfileSection.tsx`
- [ ] Create `src/components/settings/NotificationSettings.tsx`
- [ ] Create `src/components/settings/AppearanceSettings.tsx`
- [ ] Create `src/components/settings/WorkflowSettings.tsx`

#### Day 3-4: Push Notifications
- [ ] Create `src/lib/notifications/push.ts`
- [ ] Request notification permission
- [ ] Subscribe to push notifications
- [ ] Handle notification clicks
- [ ] Test on iOS & Android

```typescript
// Example: push.ts
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  const permission = await Notification.requestPermission()

  if (permission === 'granted') {
    await subscribeToPush()
  }

  return permission === 'granted'
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  })

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
}
```

#### Day 5: Testing & Refinement
- [ ] Test all gestures on real devices
- [ ] Test offline functionality
- [ ] Verify PWA installation
- [ ] Check haptic feedback
- [ ] Optimize performance

---

## 🎯 Key Components to Build

### 1. Article Card

**File**: `src/components/review/ArticleCard.tsx`

**Features**:
- Featured image with overlay
- Category pill and priority badge
- Title and excerpt
- Quality score meter
- Swipe gesture handlers
- Action buttons

### 2. Card Stack

**File**: `src/components/review/CardStack.tsx`

**Features**:
- Stacked card layout (Tinder-style)
- Spring physics animations
- Gesture-driven interactions
- Card removal with animations

### 3. Bottom Tab Bar

**File**: `src/components/shared/BottomTabBar.tsx`

**Features**:
- Fixed bottom navigation
- Safe area inset support
- Active state indicators
- Haptic feedback on tap

**Tabs**:
- Review (list icon)
- Schedule (calendar icon)
- Analytics (chart icon)
- Settings (gear icon)

### 4. Article Preview Modal

**File**: `src/components/review/ArticlePreview.tsx`

**Features**:
- Slide-up animation
- Swipe-down to close
- Markdown content
- Action bar with buttons
- Schedule picker

### 5. Week Calendar

**File**: `src/components/schedule/WeekCalendar.tsx`

**Features**:
- 7-day horizontal scroll
- Scheduled articles as blocks
- Tap to edit
- Drag to reschedule
- Color-coded by category

---

## 🔧 Essential Utilities

### Haptic Feedback

**File**: `src/lib/haptics.ts`

```typescript
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error'

export function triggerHaptic(pattern: HapticPattern = 'medium') {
  if (!('vibrate' in navigator)) return

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [50, 100, 50],
  }

  navigator.vibrate(patterns[pattern])
}
```

### Offline Queue

**File**: `src/lib/offline-queue.ts`

```typescript
import { openDB } from 'idb'

const DB_NAME = 'hse-admin-queue'
const STORE_NAME = 'actions'

export async function queueAction(action: ArticleAction) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    },
  })

  await db.add(STORE_NAME, {
    ...action,
    timestamp: Date.now(),
  })
}

export async function getQueuedActions() {
  const db = await openDB(DB_NAME, 1)
  return db.getAll(STORE_NAME)
}

export async function clearQueuedAction(id: number) {
  const db = await openDB(DB_NAME, 1)
  await db.delete(STORE_NAME, id)
}
```

### PWA Install

**File**: `src/lib/pwa.ts`

```typescript
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const result = await installPrompt.userChoice

    if (result.outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  return { install, isInstalled, canInstall: !!installPrompt }
}
```

---

## 🎨 Design Implementation Tips

### Safe Area Insets

```css
/* In tailwind.config.ts, already configured */
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Use in components */
<div className="pb-safe-bottom">
  <BottomTabBar />
</div>
```

### Dark Mode (OLED Black)

```typescript
// In dark mode, use true black for OLED
<body className="bg-white dark:bg-oled-black">
```

### Smooth Animations

```typescript
// Use Framer Motion for complex animations
<motion.div
  initial={{ x: 300 }}
  animate={{ x: 0 }}
  exit={{ x: -300 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  <ArticleCard />
</motion.div>
```

---

## 🚀 Deployment

### Build

```bash
npm run build
```

### Test PWA

```bash
npm start
```

Visit on mobile device and test:
1. Install to home screen
2. Go offline (airplane mode)
3. Test offline functionality
4. Go online and verify sync

### Deploy to Vercel

```bash
vercel --prod
```

**Important**: Set all environment variables in Vercel dashboard

---

## 📱 Testing Strategy

### Manual Testing

**iOS (Safari)**:
- [ ] Install to home screen
- [ ] Fullscreen launch
- [ ] Safe area insets correct
- [ ] Swipe gestures work
- [ ] Haptics work (vibration)
- [ ] Offline mode works
- [ ] Push notifications (requires HTTPS)

**Android (Chrome)**:
- [ ] Install prompt appears
- [ ] Install works
- [ ] Gestures responsive
- [ ] Vibration patterns correct
- [ ] Service worker active
- [ ] Background sync works

### Automated Testing

```bash
# Lighthouse PWA audit
npm run lighthouse

# Should score:
# Performance: 90+
# Accessibility: 100
# Best Practices: 95+
# SEO: 90+
# PWA: 100
```

---

## 🐛 Common Issues & Solutions

### Service Worker Not Updating

**Solution**: Implement update notification
```typescript
useEffect(() => {
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          // Show "Update available" message
          showUpdateNotification()
        }
      })
    })
  })
}, [])
```

### Gestures Conflicting with Scroll

**Solution**: Prevent scroll during swipe
```typescript
const bind = useGesture({
  onDrag: ({ event }) => {
    event.preventDefault()
    // Your swipe logic
  },
}, {
  drag: { filterTaps: true, preventDefault: true }
})
```

### iOS Not Showing Install Prompt

**Solution**: iOS requires manual installation
```typescript
// Show custom iOS install instructions
if (isIOS() && !isInStandaloneMode()) {
  return <IOSInstallInstructions />
}
```

---

## 📚 Resources

### Documentation
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Framer Motion](https://www.framer.com/motion/)
- [react-use-gesture](https://use-gesture.netlify.app/)

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Generate icons
- [Maskable.app](https://maskable.app/) - Test maskable icons
- [ngrok](https://ngrok.com/) - Test on real device

---

## ✅ Final Checklist

Before considering complete:

- [ ] All 5 tabs implemented
- [ ] Swipe gestures working smoothly
- [ ] Offline queue functional
- [ ] Push notifications setup
- [ ] PWA installable on iOS & Android
- [ ] Haptic feedback on all interactions
- [ ] Dark mode (OLED black) working
- [ ] Service worker caching correctly
- [ ] Performance optimized (60fps)
- [ ] Tested on real devices
- [ ] Documentation complete

---

**Estimated Development Time**: 5 weeks (1 developer)

**Priority Order**:
1. Week 1: Auth & Layout
2. Week 2: Review Queue (core feature)
3. Week 3: Preview & Editor
4. Week 4: Schedule & Analytics
5. Week 5: Polish & Testing

This creates a production-ready mobile admin PWA for the HSE News platform!
