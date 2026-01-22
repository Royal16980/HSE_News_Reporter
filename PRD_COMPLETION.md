# Product Requirements Document (PRD) - HSE News Reporter Completion

**Version:** 2.0
**Date:** January 21, 2026
**Status:** Ready for Implementation
**Project:** HSE News Reporter - Automated Health & Safety News Platform
**Current Completion:** 85%
**Target Completion:** 100%

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Overview](#current-system-overview)
3. [Implementation Priorities](#implementation-priorities)
4. [Feature Requirements](#feature-requirements)
5. [Technical Specifications](#technical-specifications)
6. [Testing Requirements](#testing-requirements)
7. [Deployment Plan](#deployment-plan)
8. [Success Metrics](#success-metrics)

---

## Executive Summary

### Project Vision
An automated UK Health & Safety news platform that aggregates, processes, and publishes 3-5 high-quality articles daily with minimal manual intervention, managed through a mobile-first Progressive Web App.

### Current State
- ✅ Public website (Next.js) - 100% complete
- ✅ Database schema (Supabase) - 100% complete
- ⚠️ Admin PWA - 85% complete (needs integration)
- ⚠️ n8n Workflows - 15% complete (1 of 7 workflows fixed)

### Goal
Complete the remaining 15% to achieve a fully operational automated content platform ready for production deployment.

---

## Current System Overview

### What's Working ✅

#### 1. Public Website (100%)
- **Framework:** Next.js 14 with App Router
- **Features:**
  - Homepage with hero, featured articles, category navigation
  - Article detail pages with markdown rendering
  - Category filtering and search
  - Newsletter subscription
  - Dark mode
  - SEO optimization (sitemap, structured data)
  - Responsive design

#### 2. Database (100%)
- **Platform:** Supabase (PostgreSQL)
- **Tables Implemented:**
  - `articles` - Main content with automation fields
  - `categories` - 11 predefined categories
  - `newsletter_subscribers` - Email list
  - `articles_queue` - AI processing pipeline
  - `social_media_posts` - Social distribution tracking
  - `newsletter_history` - Campaign tracking
  - `analytics_reports` - Performance metrics
  - `error_logs` - System monitoring
  - `rss_sources` - Feed management
  - `workflow_runs` - n8n execution tracking
  - `publishing_schedule` - Smart scheduler

#### 3. Admin PWA (85%)
- **Complete:**
  - Authentication system
  - API layer (32 functions)
  - UI components (Button, Card, MetricCard, Charts)
  - Layout components (Navigation, SafeArea, BottomTabs)
  - PWA configuration (manifest, offline support)
  - Analytics dashboard (charts and metrics)

- **Partially Complete:**
  - Review queue page (needs API integration)
  - Schedule page (needs API integration)
  - Settings page (needs completion)

#### 4. n8n Automation (15%)
- **Working:**
  - Workflow 1: Content Aggregation Engine (fixed and ready)

- **Not Working:**
  - Workflow 2: AI Processing Pipeline
  - Workflow 3: Smart Publisher
  - Workflow 4: Social Media Distributor
  - Workflow 5: Newsletter Compiler
  - Workflow 6: Analytics Monitor
  - Workflow 7: Error Handler

---

## Implementation Priorities

### Phase 1: Critical Path (Week 1) 🚨
**Objective:** Get core automation running

1. **Admin PWA Integration (4-6 hours)**
   - Priority: CRITICAL
   - Integrate Analytics page
   - Integrate Review Queue page
   - Integrate Schedule page
   - Complete Settings page
   - Test on mobile devices

2. **Fix n8n Workflow 2 - AI Processing (6-8 hours)**
   - Priority: CRITICAL
   - Debug Claude API integration
   - Fix content rewriting logic
   - Test with queue items
   - Ensure proper error handling

3. **Fix n8n Workflow 3 - Smart Publisher (4-6 hours)**
   - Priority: CRITICAL
   - Fix scheduling logic
   - Implement publishing quotas (5/day, 3/3-hours)
   - Test auto-publish flow
   - Verify status updates

### Phase 2: Enhanced Features (Week 2) 📊
**Objective:** Complete automation system

4. **Fix n8n Workflow 7 - Error Handler (2-3 hours)**
   - Priority: HIGH
   - Implement error catching
   - Set up email notifications
   - Test retry logic

5. **Fix n8n Workflow 4 - Social Media (6-8 hours)**
   - Priority: MEDIUM
   - Fix LinkedIn integration
   - Fix Twitter/X integration
   - Test Facebook posting
   - Verify engagement tracking

6. **Fix n8n Workflows 5 & 6 (4-6 hours)**
   - Priority: LOW
   - Newsletter compiler
   - Analytics monitor
   - Test email delivery

### Phase 3: Testing & Deployment (Week 3) 🚀
**Objective:** Production-ready system

7. **End-to-End Testing (8-10 hours)**
8. **Production Deployment (4-6 hours)**
9. **Monitoring Setup (2-3 hours)**
10. **Documentation Completion (3-4 hours)**

---

## Feature Requirements

### 1. Admin PWA Integration

#### 1.1 Analytics Dashboard Integration
**File:** `admin-pwa/src/app/(dashboard)/analytics/page.tsx`

**Requirements:**
- Replace existing page with complete version (`page-complete.tsx`)
- Verify API integration with `src/lib/api/analytics.ts`
- Ensure all charts render correctly:
  - Total articles metric card
  - Today's articles metric card
  - Pending review metric card
  - Scheduled articles metric card
  - 30-day views chart
  - Category pie chart
- Implement pull-to-refresh
- Add loading states
- Add error handling

**Acceptance Criteria:**
- [ ] Dashboard loads within 2 seconds
- [ ] All metrics display real-time data
- [ ] Charts are responsive on mobile
- [ ] Pull-to-refresh updates data
- [ ] Loading skeleton displays during fetch
- [ ] Error messages show when API fails

---

#### 1.2 Review Queue Integration
**File:** `admin-pwa/src/app/(dashboard)/review/page.tsx`

**Requirements:**
- Connect to `fetchPendingArticles()` from `src/lib/api/articles.ts`
- Implement swipe gesture handlers:
  - Swipe right → Approve article
  - Swipe left → Reject article
  - Swipe down → Snooze article (24 hours)
  - Swipe up → Full preview
- Add haptic feedback on gestures
- Implement offline queue for actions
- Show article count badge
- Auto-load next article after action

**Technical Details:**
```typescript
// API Calls
- fetchPendingArticles() → Get articles with status='pending_review'
- approveArticle(id, userId) → Update status to 'approved'
- rejectArticle(id) → Update status to 'rejected'
- snoozeArticle(id) → Update reviewed_at + 24 hours

// Gesture Detection
- Use react-use-gesture or custom hooks
- Threshold: 100px horizontal for approve/reject
- Threshold: 80px vertical for snooze/preview
- Animation: spring physics
```

**Acceptance Criteria:**
- [ ] Swipe gestures work smoothly (60fps)
- [ ] Haptic feedback triggers on action
- [ ] Article cards stack with z-index animation
- [ ] Offline actions queue and sync
- [ ] Empty state shows when no articles
- [ ] Preview modal opens on swipe up

---

#### 1.3 Schedule Calendar Integration
**File:** `admin-pwa/src/app/(dashboard)/schedule/page.tsx`

**Requirements:**
- Connect to `fetchWeekSchedule()` from `src/lib/api/schedule.ts`
- Display 7-day week view (Monday-Sunday)
- Group articles by day and time
- Show article count per day
- Highlight today's date
- Allow tap to view article details
- Show category badges
- Implement drag-to-reschedule (optional enhancement)

**Data Structure:**
```typescript
interface ScheduleDay {
  date: Date
  isToday: boolean
  articles: Array<{
    id: string
    title: string
    scheduled_publish_time: Date
    category: string
    status: 'scheduled' | 'published' | 'cancelled'
  }>
}
```

**Acceptance Criteria:**
- [ ] Week view displays Monday-Sunday
- [ ] Articles grouped correctly by date
- [ ] Today's date highlighted
- [ ] Time displayed for each article (e.g., "2:30 PM")
- [ ] Category badges show correct colors
- [ ] Empty days show "No articles scheduled"
- [ ] Smooth scroll between days

---

#### 1.4 Settings Page Completion
**File:** `admin-pwa/src/app/(dashboard)/settings/page.tsx`

**Requirements:**
- Profile section:
  - Display email (from auth context)
  - Display role (admin/editor)
  - Edit name/avatar (optional)
- Notification preferences:
  - Push notifications toggle
  - Email digest toggle
  - Notification frequency dropdown
- Appearance settings:
  - Dark mode toggle (integrate with next-themes)
  - OLED black mode toggle
  - Accent color picker (optional)
- Workflow settings:
  - Auto-publish toggle
  - AI processing toggle
  - Publishing quota settings
- Account actions:
  - Sign out button
  - Clear cache button
  - About/version info

**Acceptance Criteria:**
- [ ] Profile displays current user data
- [ ] Toggles persist to local storage
- [ ] Dark mode syncs with system preference
- [ ] Sign out clears session and redirects
- [ ] All settings save immediately
- [ ] Version number displays at bottom

---

### 2. n8n Workflow Fixes

#### 2.1 Workflow 2: AI Processing Pipeline
**File:** `n8n-workflows/IMPROVED/2-ai-processing-v2.json`

**Current Issues:**
- Claude API integration failing
- Content rewriting not producing quality output
- Image fetching from Unsplash broken
- Category classification inaccurate

**Requirements:**

**Step 1: Fix Webhook Trigger**
- Set webhook path: `/webhook/ai-processing`
- Method: POST
- Authentication: Header Auth (`x-webhook-secret`)
- Expected payload:
  ```json
  {
    "queue_id": "uuid-here"
  }
  ```

**Step 2: Fix Supabase Fetch**
- Node: "Get Queue Item"
- Operation: Get Many
- Table: articles_queue
- Filters:
  - `id` = `{{$json.queue_id}}`
  - `status` = 'pending_ai_processing'

**Step 3: Fix Claude API Node**
- Node: "Rewrite with Claude"
- Method: POST
- URL: `https://api.anthropic.com/v1/messages`
- Headers:
  ```
  x-api-key: [ANTHROPIC_KEY]
  anthropic-version: 2023-06-01
  content-type: application/json
  ```
- Body:
  ```json
  {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4000,
    "temperature": 0.7,
    "system": "You are an expert UK Health & Safety journalist...",
    "messages": [
      {
        "role": "user",
        "content": "Rewrite this HSE article professionally:\n\nTitle: {{$json.title}}\nContent: {{$json.raw_content}}\n\nProvide:\n1. New engaging title\n2. Professional rewrite (600-1000 words)\n3. SEO meta description\n4. 5 relevant tags\n5. Category (choose from: workplace-safety, fire-safety, etc.)\n6. Quality score (1-10)\n7. Priority (LOW/MEDIUM/HIGH)"
      }
    ]
  }
  ```

**Step 4: Parse Claude Response**
- Extract: title, content, excerpt, category, tags, quality_score, priority
- Use Code node or Set node with expressions

**Step 5: Fetch Featured Image**
- Use Unsplash API or default image
- Search query based on category
- Store URL in `featured_image_url`

**Step 6: Insert to Articles Table**
- Node: "Insert Article"
- Table: articles
- Fields:
  - title, slug (generate from title), content, excerpt
  - category, tags, quality_score, priority
  - featured_image_url
  - ai_generated: true
  - status: 'pending_review'
  - source, original_source_url (from queue)

**Step 7: Update Queue Status**
- Node: "Mark as Processed"
- Table: articles_queue
- Set:
  - status: 'processed'
  - processed_at: NOW()
  - article_id: [inserted article ID]

**Error Handling:**
- Add Error Trigger node
- On failure:
  - Update queue status: 'failed'
  - Set error_details
  - Send to Error Handler workflow

**Acceptance Criteria:**
- [ ] Webhook receives queue_id correctly
- [ ] Fetches queue item from database
- [ ] Calls Claude API successfully
- [ ] Parses JSON response correctly
- [ ] Generates unique slug from title
- [ ] Inserts article with all required fields
- [ ] Updates queue status to 'processed'
- [ ] Handles errors gracefully
- [ ] Quality score calculated (7-10 = auto-approve option)

---

#### 2.2 Workflow 3: Smart Publisher
**File:** `n8n-workflows/IMPROVED/3-smart-publisher-v2.json`

**Current Issues:**
- Scheduling logic broken
- Publishing quotas not enforced
- Business hours filter not working
- Status updates failing

**Requirements:**

**Step 1: Schedule Trigger**
- Schedule: Every 1 hour
- Active hours: 7 AM - 7 PM UK time (GMT)

**Step 2: Fetch Articles to Publish**
- Node: "Get Scheduled Articles"
- Table: articles
- Filters:
  - status: 'approved' OR status='pending_review' (if auto-publish enabled)
  - scheduled_publish_time <= NOW()
  - scheduled_publish_time > NOW() - INTERVAL '1 hour'
- Order by: priority DESC, scheduled_publish_time ASC
- Limit: 5

**Step 3: Apply Publishing Quotas**
- Check daily quota: Max 5 articles/day
  ```sql
  SELECT COUNT(*) FROM articles
  WHERE status='published'
  AND DATE(published_at) = CURRENT_DATE
  ```
  - If count >= 5, skip publishing

- Check 3-hour quota: Max 3 articles per 3-hour window
  ```sql
  SELECT COUNT(*) FROM articles
  WHERE status='published'
  AND published_at > NOW() - INTERVAL '3 hours'
  ```
  - If count >= 3, skip publishing

**Step 4: Business Hours Check**
- Current hour: 7-19 (7 AM - 7 PM)
- Current day: Monday-Friday
- If outside hours, reschedule to next valid time

**Step 5: Publish Article**
- Node: "Publish Article"
- Update articles:
  - status: 'published'
  - published_at: NOW()
- Insert to publishing_schedule:
  - article_id
  - scheduled_time: original scheduled_publish_time
  - status: 'published'
  - published_at: NOW()

**Step 6: Trigger Revalidation**
- Call Next.js revalidation webhook
- URL: `https://your-site.vercel.app/api/revalidate?secret=[SECRET]`
- Paths to revalidate: `/`, `/articles/[slug]`, `/articles`

**Step 7: Trigger Social Media Workflow**
- Webhook call to Workflow 4
- Send article data

**Acceptance Criteria:**
- [ ] Runs every hour during business hours
- [ ] Respects daily quota (5/day)
- [ ] Respects 3-hour quota (3 per 3 hours)
- [ ] Only publishes during 7 AM - 7 PM Mon-Fri
- [ ] Updates article status correctly
- [ ] Triggers website revalidation
- [ ] Calls social media workflow
- [ ] Logs execution to workflow_runs table

---

#### 2.3 Workflow 4: Social Media Distributor
**File:** `n8n-workflows/IMPROVED/4-social-media-v4.json`

**Requirements:**

**Platforms:**
1. LinkedIn - Professional HSE community
2. Twitter/X - Quick updates, breaking news
3. Facebook - Broader audience reach (optional)

**Step 1: Webhook Trigger**
- Receives article data from Workflow 3
- Payload:
  ```json
  {
    "article_id": "uuid",
    "title": "string",
    "excerpt": "string",
    "category": "string",
    "url": "https://site.com/articles/slug"
  }
  ```

**Step 2: Generate Platform-Specific Content**

**LinkedIn Post Template:**
```
[CATEGORY EMOJI] [TITLE]

[EXCERPT - First 200 chars]

Key highlights:
• [Point 1 from article]
• [Point 2 from article]
• [Point 3 from article]

Read the full article: [URL]

#HealthAndSafety #HSE #[CategoryTag] #WorkplaceSafety
```

**Twitter/X Post Template:**
```
🚨 [TITLE - shortened to 180 chars]

[URL]

#HSE #[CategoryTag] #Safety
```

**Step 3: Post to LinkedIn**
- Node: LinkedIn node
- Authentication: OAuth2
- Operation: Create Post
- Visibility: Public
- Content: Generated LinkedIn text

**Step 4: Post to Twitter/X**
- Node: Twitter node
- Authentication: OAuth
- Operation: Tweet
- Content: Generated Twitter text

**Step 5: Log Social Posts**
- Insert to social_media_posts table:
  - article_id
  - platform
  - post_content
  - platform_post_id (from API response)
  - status: 'posted'
  - posted_at: NOW()

**Error Handling:**
- If LinkedIn fails, continue with Twitter
- If all fail, log error
- Don't block main workflow

**Acceptance Criteria:**
- [ ] Posts to LinkedIn with proper formatting
- [ ] Posts to Twitter with hashtags
- [ ] Stores post IDs for tracking
- [ ] Handles API rate limits
- [ ] Continues on individual platform failures
- [ ] Logs all attempts to database

---

#### 2.4 Workflow 5: Newsletter Compiler
**File:** `n8n-workflows/IMPROVED/5-newsletter-v2.json`

**Requirements:**

**Trigger:**
- Schedule: Every Friday at 10:00 AM UK time

**Step 1: Fetch Week's Articles**
```sql
SELECT * FROM articles
WHERE status='published'
AND published_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY views_count DESC, published_at DESC
LIMIT 10
```

**Step 2: Fetch Subscribers**
```sql
SELECT email FROM newsletter_subscribers
WHERE active=true AND verified=true
```

**Step 3: Generate HTML Email**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Responsive email template styles */
  </style>
</head>
<body>
  <div class="container">
    <h1>HSE News Weekly Digest</h1>
    <p class="date">Week of {{startDate}} - {{endDate}}</p>

    <h2>📰 Top Stories This Week</h2>

    {{#each articles}}
    <div class="article">
      <img src="{{featured_image_url}}" alt="{{title}}" />
      <h3>{{title}}</h3>
      <p>{{excerpt}}</p>
      <a href="{{url}}" class="btn">Read More →</a>
      <div class="meta">
        <span class="category">{{category}}</span>
        <span class="views">{{views_count}} views</span>
      </div>
    </div>
    {{/each}}

    <div class="footer">
      <p>You're receiving this because you subscribed to HSE News.</p>
      <a href="{{unsubscribeUrl}}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
```

**Step 4: Send Emails**
- Use SMTP node or email service
- Batch send to avoid rate limits
- Include unsubscribe link with token

**Step 5: Log Newsletter**
- Insert to newsletter_history:
  - week_start, week_end
  - articles_count
  - subscribers_count
  - sent_at: NOW()
  - email_subject

**Acceptance Criteria:**
- [ ] Runs every Friday at 10 AM
- [ ] Includes top 10 articles from past week
- [ ] Sends to all active subscribers
- [ ] Email is mobile-responsive
- [ ] Unsubscribe link works
- [ ] Logs send in database
- [ ] Handles SMTP errors gracefully

---

#### 2.5 Workflow 6: Analytics Monitor
**File:** `n8n-workflows/IMPROVED/6-analytics-v3.json`

**Requirements:**

**Trigger:**
- Schedule: Every day at 9:00 AM UK time

**Step 1: Calculate Daily Metrics**
```sql
-- Articles published today
SELECT COUNT(*) as published_today
FROM articles
WHERE status='published' AND DATE(published_at)=CURRENT_DATE;

-- Total views today
SELECT SUM(views_count) as total_views_today
FROM articles
WHERE DATE(published_at)=CURRENT_DATE;

-- Pending review count
SELECT COUNT(*) as pending_review
FROM articles WHERE status='pending_review';

-- Queue health
SELECT status, COUNT(*) as count
FROM articles_queue
GROUP BY status;

-- Error count
SELECT COUNT(*) as errors
FROM error_logs
WHERE occurred_at > NOW() - INTERVAL '24 hours'
AND resolved=false;

-- Social media posts
SELECT platform, COUNT(*) as posts
FROM social_media_posts
WHERE DATE(posted_at)=CURRENT_DATE
GROUP BY platform;
```

**Step 2: Determine Health Status**
```javascript
let healthStatus = 'healthy';
const warnings = [];
const errors = [];

if (publishedToday === 0) {
  healthStatus = 'warning';
  warnings.push('No articles published today');
}

if (pendingReview > 20) {
  healthStatus = 'warning';
  warnings.push(`${pendingReview} articles pending review`);
}

if (unresolvedErrors > 5) {
  healthStatus = 'error';
  errors.push(`${unresolvedErrors} unresolved errors`);
}

if (queuePending > 50) {
  warnings.push(`${queuePending} items in queue`);
}
```

**Step 3: Generate Email Report**
```html
<h1>HSE News Daily Report</h1>
<div class="status {{healthStatus}}">
  System Status: {{healthStatus}}
</div>

<h2>Today's Metrics</h2>
<ul>
  <li>Articles Published: {{publishedToday}}</li>
  <li>Total Views: {{totalViews}}</li>
  <li>Pending Review: {{pendingReview}}</li>
  <li>Queue Items: {{queuePending}}</li>
</ul>

<h2>Social Media</h2>
<ul>
  <li>LinkedIn Posts: {{linkedInPosts}}</li>
  <li>Twitter Posts: {{twitterPosts}}</li>
</ul>

{{#if warnings}}
<h2>⚠️ Warnings</h2>
<ul>
  {{#each warnings}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{/if}}

{{#if errors}}
<h2>🚨 Errors</h2>
<ul>
  {{#each errors}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{/if}}
```

**Step 4: Store Report**
- Insert to analytics_reports:
  - report_date: CURRENT_DATE
  - report_type: 'daily'
  - metrics: JSON object
  - health_status
  - warnings, errors arrays
  - generated_at: NOW()

**Step 5: Send Email**
- To: admin email
- Subject: `HSE News Daily Report - {{date}} - {{status}}`
- Body: HTML report

**Acceptance Criteria:**
- [ ] Runs daily at 9 AM
- [ ] Calculates all metrics accurately
- [ ] Determines health status correctly
- [ ] Sends email to admin
- [ ] Stores report in database
- [ ] Email is readable on mobile

---

#### 2.6 Workflow 7: Error Handler
**File:** `n8n-workflows/IMPROVED/7-error-handler-v3.json`

**Requirements:**

**Trigger:**
- Error Trigger (catches errors from all workflows)

**Step 1: Parse Error Data**
```javascript
const errorData = {
  errorId: generateId(),
  workflowName: $workflow.name,
  workflowId: $workflow.id,
  nodeName: $node.name,
  errorMessage: $error.message,
  errorStack: $error.stack,
  context: $json,
  occurredAt: new Date()
};
```

**Step 2: Classify Error Severity**
```javascript
let severity = 'medium';
let canRetry = true;
let requiresManualIntervention = false;

// Critical errors
if (errorMessage.includes('Authentication') ||
    errorMessage.includes('API key')) {
  severity = 'critical';
  canRetry = false;
  requiresManualIntervention = true;
}

// High severity
if (errorMessage.includes('Database') ||
    errorMessage.includes('Connection')) {
  severity = 'high';
  canRetry = true;
}

// Low severity
if (errorMessage.includes('rate limit') ||
    errorMessage.includes('timeout')) {
  severity = 'low';
  canRetry = true;
}
```

**Step 3: Log Error**
- Insert to error_logs:
  - error_id, workflow_name, node_name
  - severity, error_message, error_stack
  - can_retry, context (JSON)
  - occurred_at
  - requires_manual_intervention

**Step 4: Retry Logic**
```javascript
if (canRetry && retryCount < 3) {
  // Wait exponentially: 1min, 5min, 15min
  const waitTime = Math.pow(5, retryCount) * 60 * 1000;

  // Schedule retry
  await scheduleRetry(workflowId, context, waitTime);

  // Update retry count
  await updateRetryCount(errorId, retryCount + 1);
}
```

**Step 5: Send Alert**
- If severity === 'critical' or 'high':
  - Send email to admin
  - Include: error details, context, retry status

- If requiresManualIntervention:
  - Send urgent alert
  - Include resolution steps

**Acceptance Criteria:**
- [ ] Catches errors from all workflows
- [ ] Classifies severity correctly
- [ ] Logs errors to database
- [ ] Implements retry logic with backoff
- [ ] Sends alerts for critical errors
- [ ] Provides resolution guidance
- [ ] Updates error status after resolution

---

### 3. Testing Requirements

#### 3.1 Unit Testing
**Admin PWA:**
- Test API functions in isolation
- Mock Supabase responses
- Verify state management (Zustand stores)

**Test Files to Create:**
```
admin-pwa/src/lib/api/__tests__/
├── articles.test.ts
├── schedule.test.ts
└── analytics.test.ts
```

**Example Test:**
```typescript
// articles.test.ts
import { fetchPendingArticles } from '../articles';

describe('Articles API', () => {
  it('should fetch pending articles', async () => {
    const articles = await fetchPendingArticles();
    expect(articles).toBeInstanceOf(Array);
    expect(articles[0]).toHaveProperty('status', 'pending_review');
  });
});
```

---

#### 3.2 Integration Testing
**Workflows:**
- Test each workflow end-to-end
- Verify data flows between workflows
- Test error scenarios

**Test Checklist:**
```
Workflow 1 → Workflow 2 → Workflow 3 → Workflow 4
  ↓            ↓            ↓            ↓
Queue        Article      Published    Social Posts
```

---

#### 3.3 End-to-End Testing

**Scenario 1: Article Lifecycle**
1. Workflow 1 aggregates article from RSS
2. Article added to queue
3. Workflow 2 processes with AI
4. Article in pending_review status
5. Admin approves via PWA
6. Workflow 3 publishes article
7. Workflow 4 posts to social media
8. Article visible on public website

**Scenario 2: Error Recovery**
1. Workflow 2 fails (API timeout)
2. Error Handler catches error
3. Error logged to database
4. Admin receives email alert
5. Automatic retry after 5 minutes
6. Workflow 2 succeeds on retry

---

#### 3.4 Performance Testing

**Metrics to Measure:**
- Public website Lighthouse score: 95+
- Admin PWA load time: < 2 seconds
- API response time: < 500ms
- Workflow execution time:
  - Workflow 1: < 5 minutes
  - Workflow 2: < 60 seconds per article
  - Workflow 3: < 30 seconds

**Load Testing:**
- 100 concurrent users on public site
- 10 admins using PWA simultaneously
- 50 articles in queue being processed

---

### 4. Deployment Plan

#### 4.1 Pre-Deployment Checklist

**Environment Variables:**
```bash
# Public Website (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
REVALIDATE_SECRET=

# Admin PWA (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# n8n Credentials
- Supabase API Key
- Anthropic API Key
- LinkedIn OAuth
- Twitter OAuth
- SMTP credentials
```

**Database Migrations:**
- [ ] Run schema.sql on production Supabase
- [ ] Verify all tables created
- [ ] Check RLS policies enabled
- [ ] Insert default categories
- [ ] Insert RSS sources

**n8n Workflows:**
- [ ] Import all 7 workflows
- [ ] Configure credentials
- [ ] Test each workflow
- [ ] Activate in order: 7, 1, 2, 3, 4, 6, 5

---

#### 4.2 Deployment Steps

**Step 1: Deploy Public Website**
```bash
# Using Vercel
cd HSE_News_Reporter
vercel --prod

# Set environment variables in Vercel dashboard
# Point custom domain (if applicable)
```

**Step 2: Deploy Admin PWA**
```bash
cd admin-pwa
vercel --prod

# Use different project name
# Set environment variables
```

**Step 3: Configure n8n**
- Import workflows via UI
- Add all credentials
- Test each workflow manually
- Activate workflows

**Step 4: Verify**
- Check public site loads
- Check admin PWA loads
- Verify Workflow 1 runs and adds to queue
- Verify Workflow 2 processes articles
- Monitor for 24 hours

---

#### 4.3 Rollback Plan

**If Critical Issues Occur:**
1. Deactivate all n8n workflows immediately
2. Revert Vercel deployment to previous version
3. Review error logs in Supabase
4. Fix issues in staging environment
5. Re-deploy after testing

**Rollback Commands:**
```bash
# Revert Vercel deployment
vercel rollback

# Disable workflows via n8n API
curl -X PATCH https://n8n.srv1246730.hstgr.cloud/api/v1/workflows/:id \
  -H "X-N8N-API-KEY: your-key" \
  -d '{"active": false}'
```

---

### 5. Monitoring & Maintenance

#### 5.1 Monitoring Setup

**Vercel Analytics:**
- Enable for public website
- Track: page views, performance, errors

**Supabase Monitoring:**
- Database performance
- Query slow logs
- Connection pool usage

**n8n Execution Logs:**
- Daily review of workflow executions
- Check error rates
- Monitor execution times

**Custom Dashboards:**
- Create in Admin PWA analytics page
- Key metrics:
  - Articles published/day
  - Queue health
  - Error rate
  - Social media engagement

---

#### 5.2 Daily Maintenance Tasks

**Morning (9 AM):**
- [ ] Check daily analytics email
- [ ] Review pending articles count
- [ ] Check error logs for critical issues
- [ ] Verify workflows ran overnight

**Afternoon (2 PM):**
- [ ] Review and approve pending articles
- [ ] Check social media engagement
- [ ] Monitor website performance

**Evening (6 PM):**
- [ ] Final review of published articles
- [ ] Check queue is processing
- [ ] Verify scheduled articles for next day

---

#### 5.3 Weekly Maintenance Tasks

**Monday:**
- [ ] Review previous week's analytics report
- [ ] Plan content focus for the week
- [ ] Check RSS sources are active

**Friday:**
- [ ] Review newsletter before send (10 AM)
- [ ] Check subscriber list health
- [ ] Generate weekly performance report

---

### 6. Success Metrics

#### 6.1 Technical Metrics

**Automation Success:**
- ✅ 90%+ of articles auto-processed without errors
- ✅ 100% uptime for workflows during business hours
- ✅ < 5% article rejection rate

**Performance:**
- ✅ Lighthouse score: 95+ (all metrics)
- ✅ Admin PWA loads in < 2 seconds
- ✅ Workflow 1 completes in < 5 minutes
- ✅ Workflow 2 processes article in < 60 seconds

**Content Output:**
- ✅ 3-5 articles published per day
- ✅ 20-40 articles aggregated per day
- ✅ 15-25 articles AI-processed per day
- ✅ 9-15 social media posts per day

---

#### 6.2 Business Metrics

**Audience Growth:**
- 🎯 1,000+ page views/day within 1 month
- 🎯 500+ newsletter subscribers within 1 month
- 🎯 10,000+ monthly page views within 3 months

**Engagement:**
- 🎯 Average time on page: > 2 minutes
- 🎯 Bounce rate: < 60%
- 🎯 Social media engagement rate: > 2%

**Content Quality:**
- 🎯 AI-generated articles quality score: 7-10
- 🎯 < 10% rejection rate on review
- 🎯 SEO ranking for HSE keywords: Page 1-3

---

### 7. Risk Management

#### 7.1 Identified Risks

**Risk 1: Claude API Rate Limits**
- **Impact:** HIGH
- **Probability:** MEDIUM
- **Mitigation:**
  - Implement exponential backoff
  - Queue processing with delays
  - Monitor API usage daily
  - Have backup plan (manual writing)

**Risk 2: RSS Feeds Go Down**
- **Impact:** MEDIUM
- **Probability:** LOW
- **Mitigation:**
  - Monitor feed health
  - Have 6+ diverse sources
  - Add new sources regularly
  - Manual article submission fallback

**Risk 3: Supabase Downtime**
- **Impact:** CRITICAL
- **Probability:** VERY LOW
- **Mitigation:**
  - Use Supabase's 99.9% SLA
  - Implement retry logic
  - Have database backups
  - Monitor status page

**Risk 4: OAuth Tokens Expire**
- **Impact:** MEDIUM
- **Probability:** MEDIUM
- **Mitigation:**
  - Implement token refresh
  - Alert on expiration
  - Document renewal process
  - Test quarterly

---

#### 7.2 Contingency Plans

**If Automation Fails Completely:**
1. Switch to manual mode
2. Use Admin PWA to create articles
3. Schedule manually
4. Notify stakeholders

**If Admin PWA Is Unavailable:**
1. Use Supabase dashboard directly
2. Update article status via SQL
3. Fix PWA and redeploy

**If Public Website Goes Down:**
1. Check Vercel status
2. Rollback to last working deployment
3. Fix in staging
4. Redeploy

---

### 8. Documentation Requirements

#### 8.1 User Documentation

**For Admins:**
- Admin PWA user guide
  - How to review articles
  - How to schedule articles
  - How to use analytics
  - How to manage settings

**For Developers:**
- Architecture documentation
- API reference
- Component library
- Deployment guide

**For Content Writers:**
- Article submission process
- Style guide
- SEO best practices

---

#### 8.2 Technical Documentation

**Files to Create/Update:**

```
/docs/
├── ADMIN_PWA_GUIDE.md
├── N8N_WORKFLOWS_GUIDE.md
├── API_REFERENCE.md
├── DEPLOYMENT_GUIDE.md
├── TROUBLESHOOTING.md
└── MAINTENANCE_GUIDE.md
```

**Code Comments:**
- Add JSDoc comments to all API functions
- Document complex business logic
- Explain non-obvious decisions

---

### 9. Timeline & Milestones

#### Week 1: Critical Path (Jan 21-27)
**Days 1-2: Admin PWA Integration**
- Integrate Analytics page ✅
- Integrate Review Queue page ✅
- Integrate Schedule page ✅
- Complete Settings page ✅
- Test on mobile devices ✅

**Days 3-4: Workflow 2 (AI Processing)**
- Fix Claude API integration ✅
- Test with queue items ✅
- Deploy to n8n ✅

**Days 5-6: Workflow 3 (Publisher)**
- Fix scheduling logic ✅
- Test publishing flow ✅
- Deploy to n8n ✅

**Day 7: Testing & Review**
- End-to-end test ✅
- Fix any critical bugs ✅

---

#### Week 2: Enhanced Features (Jan 28 - Feb 3)
**Days 1-2: Workflow 7 (Error Handler)**
- Implement error catching ✅
- Test retry logic ✅

**Days 3-5: Workflow 4 (Social Media)**
- Fix LinkedIn integration ✅
- Fix Twitter integration ✅
- Test posting ✅

**Days 6-7: Workflows 5 & 6**
- Newsletter compiler ✅
- Analytics monitor ✅

---

#### Week 3: Deployment (Feb 4-10)
**Days 1-3: Testing**
- End-to-end testing ✅
- Performance testing ✅
- Security review ✅

**Days 4-5: Deployment**
- Deploy to production ✅
- Monitor for issues ✅

**Days 6-7: Documentation**
- Complete all documentation ✅
- Create user guides ✅

---

### 10. Post-Launch Plan

#### First 30 Days
**Week 1:**
- Monitor daily
- Fix critical bugs immediately
- Tune AI prompts if needed
- Adjust publishing schedule

**Week 2-3:**
- Analyze content performance
- Optimize workflows
- Gather user feedback
- Add new RSS sources if needed

**Week 4:**
- Performance review
- Cost analysis
- Plan next features

#### Future Enhancements (Phase 4)
- Advanced editor with live preview
- Multi-user support with roles
- Push notifications
- Mobile native apps (iOS/Android)
- Advanced analytics (Google Analytics 4)
- A/B testing for headlines
- Automated image generation (DALL-E)
- Video content support
- Podcast integration
- Multi-language support

---

## Implementation Order Summary

### Must Complete Now (Critical) 🔴
1. **Admin PWA Integration** (6 hours)
2. **n8n Workflow 2 - AI Processing** (8 hours)
3. **n8n Workflow 3 - Smart Publisher** (6 hours)

**Total Critical Path: ~20 hours (2.5 days)**

### Should Complete Next (High Priority) 🟡
4. **n8n Workflow 7 - Error Handler** (3 hours)
5. **End-to-end testing** (8 hours)
6. **Production deployment** (4 hours)

**Total High Priority: ~15 hours (2 days)**

### Nice to Have (Medium Priority) 🟢
7. **n8n Workflow 4 - Social Media** (8 hours)
8. **n8n Workflows 5 & 6** (6 hours)
9. **Documentation completion** (4 hours)

**Total Medium Priority: ~18 hours (2 days)**

---

## Total Estimated Effort

**Total Hours:** 53 hours
**Total Days:** ~7 working days
**Target Completion:** February 10, 2026

---

## Appendix

### A. File Structure Reference

```
HSE_News_Reporter/
├── src/                          # Public Website
│   ├── app/
│   ├── components/
│   └── lib/
├── admin-pwa/                    # Admin PWA
│   ├── src/
│   │   ├── app/(dashboard)/
│   │   ├── components/
│   │   ├── lib/api/
│   │   └── stores/
│   └── package.json
├── n8n-workflows/                # Automation
│   └── IMPROVED/
│       ├── 1-content-aggregation-FINAL-v4.json ✅
│       ├── 2-ai-processing-v2.json ⏳
│       ├── 3-smart-publisher-v2.json ⏳
│       ├── 4-social-media-v4.json ⏳
│       ├── 5-newsletter-v2.json ⏳
│       ├── 6-analytics-v3.json ⏳
│       └── 7-error-handler-v3.json ⏳
├── supabase/
│   └── schema.sql ✅
└── docs/
    ├── ARCHITECTURE.md ✅
    ├── PROJECT.md ✅
    └── PRD_COMPLETION.md ✅ (this file)
```

---

### B. API Endpoints Reference

#### Admin PWA API Functions

**Articles API** (`lib/api/articles.ts`)
```typescript
fetchPendingArticles() → Article[]
fetchApprovedArticles() → Article[]
approveArticle(id, userId) → void
rejectArticle(id) → void
snoozeArticle(id) → void
updateArticle(id, data) → Article
deleteArticle(id) → void
searchArticles(query) → Article[]
batchApprove(ids[]) → void
subscribeToArticles(callback) → Subscription
getArticleStats() → Stats
```

**Schedule API** (`lib/api/schedule.ts`)
```typescript
fetchScheduledArticles() → Article[]
fetchWeekSchedule() → Article[]
fetchDaySchedule(date) → Article[]
scheduleArticle(id, time) → void
rescheduleArticle(id, newTime) → void
unscheduleArticle(id) → void
getScheduleConflicts(time) → Conflict[]
suggestPublishTime(article) → Date
batchSchedule(items[]) → void
getScheduleStats() → Stats
```

**Analytics API** (`lib/api/analytics.ts`)
```typescript
fetchOverviewData() → Overview
fetchViewsChart(days) → ChartData
fetchCategoryPerformance() → CategoryStats[]
fetchTopArticles(limit) → Article[]
fetchPublishingTrends() → TrendData
fetchWorkflowMetrics() → WorkflowStats
generateWeeklyReport() → Report
```

---

### C. Database Schema Quick Reference

**Key Tables:**
- `articles` - Main content (status: draft/pending_review/approved/published)
- `articles_queue` - AI processing pipeline
- `categories` - 11 predefined categories
- `newsletter_subscribers` - Email list
- `social_media_posts` - Social distribution tracking
- `error_logs` - System errors
- `workflow_runs` - n8n execution tracking
- `publishing_schedule` - Scheduled publications

**Key Indexes:**
- `idx_articles_status` - Filter by status
- `idx_articles_scheduled` - Fetch scheduled articles
- `idx_queue_status` - Process queue efficiently
- `idx_error_logs_occurred` - Recent errors

---

### D. Environment Variables

**Public Website:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hsownlzxiqhnstvaftqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
REVALIDATE_SECRET=your-secret-here
```

**Admin PWA:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hsownlzxiqhnstvaftqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

**n8n Credentials:**
- Supabase API Key: (from env)
- Anthropic API Key: `sk-ant-api03-...`
- Webhook Secret: `hse-news-webhook-secret-2026`
- LinkedIn OAuth: (from LinkedIn Developer Portal)
- Twitter OAuth: (from Twitter Developer Portal)
- SMTP: (Gmail app password or similar)

---

### E. Testing Checklist

#### Pre-Deployment Testing

**Admin PWA:**
- [ ] Login/logout works
- [ ] Analytics dashboard loads data
- [ ] Review queue swipe gestures work
- [ ] Schedule calendar displays correctly
- [ ] Settings save properly
- [ ] Offline mode works
- [ ] PWA installs on mobile
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

**Public Website:**
- [ ] Homepage loads < 2s
- [ ] Article pages render correctly
- [ ] Newsletter signup works
- [ ] Search returns results
- [ ] Dark mode toggles correctly
- [ ] Mobile responsive
- [ ] Lighthouse score 95+

**n8n Workflows:**
- [ ] Workflow 1 aggregates articles
- [ ] Workflow 2 processes with AI
- [ ] Workflow 3 publishes articles
- [ ] Workflow 4 posts to social
- [ ] Workflow 5 sends newsletter
- [ ] Workflow 6 sends daily report
- [ ] Workflow 7 catches errors

**Integration:**
- [ ] Full article lifecycle works
- [ ] Error recovery works
- [ ] Quotas enforced correctly
- [ ] Business hours respected
- [ ] Social posts successful

---

## Conclusion

This PRD provides a complete roadmap to finish the HSE News Reporter platform. By following this plan, your coding agent can systematically complete all remaining tasks and deliver a production-ready automated news platform.

**Key Takeaways:**
1. **Critical Path:** Focus on Admin PWA integration and Workflows 2-3 first
2. **Timeline:** 7 working days to 100% completion
3. **Testing:** Comprehensive testing before production deployment
4. **Monitoring:** Daily maintenance and monitoring post-launch
5. **Future:** Clear roadmap for Phase 4 enhancements

**Next Steps:**
1. Start with Admin PWA integration (highest impact)
2. Fix Workflow 2 (unblocks content flow)
3. Fix Workflow 3 (enables publishing)
4. Test end-to-end
5. Deploy to production
6. Monitor and iterate

---

**Document Version:** 2.0
**Last Updated:** January 21, 2026
**Status:** ✅ Ready for Implementation
**Estimated Completion:** February 10, 2026
