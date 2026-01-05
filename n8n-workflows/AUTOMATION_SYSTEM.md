# Complete HSE News Automation System

## Overview

A comprehensive n8n automation system that handles content aggregation, AI processing, quality control, publishing, and distribution - fully automated from source to social media.

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTOMATION WORKFLOW SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

1. CONTENT AGGREGATION (Runs every 6 hours)
   ├── Scrape HSE Press Releases
   ├── Scrape GOV.UK Health & Safety
   ├── Scrape IOSH Magazine
   ├── Scrape Construction News
   ├── RSS Feed Monitoring
   └── Google News API

2. AI PROCESSING & ENHANCEMENT
   ├── Claude API: Rewrite & Enhance
   ├── Quality Scoring Algorithm
   ├── Category Classification
   ├── Tag Generation
   ├── SEO Optimization
   └── Featured Image Selection

3. DEDUPLICATION & VALIDATION
   ├── Check Against Existing Articles
   ├── Similarity Detection (TF-IDF)
   ├── URL Tracking
   └── Content Quality Validation

4. SMART SCHEDULING
   ├── Analyze Best Publishing Times
   ├── Distribute Throughout Day
   ├── Priority-Based Scheduling
   └── Category Balance

5. AUTO-PUBLISHING
   ├── Publish Scheduled Articles
   ├── Trigger ISR Revalidation
   ├── Update Search Index
   └── Log Published Articles

6. SOCIAL MEDIA DISTRIBUTION
   ├── LinkedIn Auto-Post
   ├── Twitter/X Auto-Post
   ├── Facebook Auto-Post
   └── Track Engagement

7. ANALYTICS & MONITORING
   ├── Article Performance Tracking
   ├── Source Quality Analysis
   ├── Error Notification
   └── Daily/Weekly Reports

8. NEWSLETTER AUTOMATION
   ├── Compile Weekly Digest
   ├── Personalize by Preferences
   ├── Send via Resend/SendGrid
   └── Track Open Rates
```

---

## 📋 Workflow Breakdown

### Workflow 1: Content Aggregation Engine
**File**: `1-content-aggregation-engine.json`
**Schedule**: Every 6 hours (4 times daily)
**Purpose**: Scrape multiple sources and store raw content

### Workflow 2: AI Processing Pipeline
**File**: `2-ai-processing-pipeline.json`
**Trigger**: When new raw content added
**Purpose**: Claude AI processes and enhances content

### Workflow 3: Smart Publisher
**File**: `3-smart-publisher.json`
**Schedule**: Every hour
**Purpose**: Publishes approved articles at optimal times

### Workflow 4: Social Media Distributor
**File**: `4-social-media-distributor.json`
**Trigger**: When article published
**Purpose**: Auto-posts to social platforms

### Workflow 5: Newsletter Compiler
**File**: `5-newsletter-compiler.json`
**Schedule**: Weekly (Sunday 8 AM)
**Purpose**: Creates and sends weekly digest

### Workflow 6: Analytics Monitor
**File**: `6-analytics-monitor.json`
**Schedule**: Daily (midnight)
**Purpose**: Tracks performance and sends reports

### Workflow 7: Error Handler
**File**: `7-error-handler.json`
**Trigger**: On any workflow error
**Purpose**: Logs errors and sends alerts

---

## 🔧 Detailed Workflow Specifications

### WORKFLOW 1: Content Aggregation Engine

**Sources to Scrape**:

1. **HSE Press Releases**
   - URL: `https://press.hse.gov.uk/`
   - Method: HTML scraping
   - Selector: `.press-release`
   - Frequency: Every 6 hours

2. **GOV.UK Health & Safety**
   - URL: `https://www.gov.uk/search/news-and-communications?keywords=health+safety`
   - Method: API
   - Fields: title, link, description, date
   - Frequency: Every 6 hours

3. **IOSH Magazine**
   - URL: `https://www.ioshmagazine.com/`
   - Method: RSS Feed
   - Feed: `https://www.ioshmagazine.com/rss`
   - Frequency: Every 6 hours

4. **Construction News Safety**
   - URL: `https://www.constructionnews.co.uk/safety`
   - Method: HTML scraping
   - Selector: `.article-card`
   - Frequency: Every 6 hours

5. **SHP Online**
   - URL: `https://www.shponline.co.uk/`
   - Method: RSS Feed
   - Feed: `https://www.shponline.co.uk/feed/`
   - Frequency: Every 6 hours

**Process Flow**:
```
Trigger (Schedule: 0 */6 * * *)
  ↓
For each source (Loop)
  ↓
HTTP Request (Fetch content)
  ↓
Parse (HTML/RSS/JSON)
  ↓
Extract Data:
  - title
  - url
  - content
  - published_date
  - source_name
  ↓
Check Duplicates (Supabase)
  ↓
If New → Insert Raw Content
  ↓
Trigger AI Processing Workflow
```

**Expected Output**: 20-40 raw articles per day

---

### WORKFLOW 2: AI Processing Pipeline

**Claude AI Prompt Template**:

```
You are a professional UK Health & Safety news editor. Your task is to transform raw news content into polished, professional articles for safety professionals.

**Source Article:**
Title: {title}
URL: {url}
Content: {raw_content}
Source: {source_name}

**Your Tasks:**

1. **Rewrite** the article in a professional, engaging style
2. **Enhance** with additional context and analysis
3. **Structure** with proper Markdown formatting (H2, H3, lists, quotes)
4. **Optimize** for SEO with relevant keywords
5. **Categorize** into one of these categories:
   - workplace-safety
   - fire-safety
   - chemical-safety
   - construction
   - healthcare
   - food-safety
   - ergonomics
   - mental-health
   - incidents
   - regulations
   - best-practices

6. **Generate** 5-7 relevant tags
7. **Create** a compelling 150-200 character excerpt
8. **Assign** priority (HIGH/MEDIUM/LOW) based on:
   - HIGH: Regulatory changes, major incidents, breaking news
   - MEDIUM: Best practices, case studies, industry updates
   - LOW: General information, historical context

9. **Quality Score** (0-10) based on:
   - Relevance to UK H&S professionals
   - Timeliness and newsworthiness
   - Quality of information
   - Actionability

**Output Format (JSON only):**
{
  "title": "Professional headline (50-70 characters)",
  "content": "Full article in Markdown with ## headings, lists, **bold**, etc.",
  "excerpt": "Compelling summary (150-200 chars)",
  "category": "category-slug",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "priority": "HIGH|MEDIUM|LOW",
  "quality_score": 8.5,
  "seo_keywords": ["keyword1", "keyword2", "keyword3"],
  "recommended_publish_time": "morning|afternoon|evening",
  "target_audience": "general|specialist|executive"
}

**Guidelines:**
- Maintain factual accuracy
- Use UK English spelling
- Include statistics and specifics
- Add expert analysis where appropriate
- Ensure compliance with journalism standards
- Make it actionable for H&S professionals
```

**Process Flow**:
```
Trigger (New raw content)
  ↓
Fetch Full Article Content
  ↓
Call Claude API with Prompt
  ↓
Parse JSON Response
  ↓
Validate Output:
  - Check all required fields
  - Validate category exists
  - Ensure quality_score in range
  ↓
Generate URL Slug
  ↓
Calculate Reading Time
  ↓
Search for Featured Image:
  - Unsplash API (search by keywords)
  - Or use default by category
  ↓
Insert to Supabase (articles table):
  - status: 'pending_review' OR 'approved' (if quality_score > 8.0)
  - ai_generated: true
  - All processed fields
  ↓
If HIGH Priority → Send Push Notification
  ↓
Trigger Smart Scheduling
```

**Expected Output**: 15-30 quality articles per day

---

### WORKFLOW 3: Smart Publisher

**Smart Scheduling Algorithm**:

```javascript
// Calculate optimal publish time
function calculatePublishTime(article) {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0-6 (Sun-Sat)
  const hour = now.getHours()

  // Best times based on analytics
  const optimalTimes = {
    // Weekdays
    weekday: {
      morning: { hour: 9, engagement: 1.2 },
      lunch: { hour: 13, engagement: 1.0 },
      afternoon: { hour: 15, engagement: 0.9 },
      evening: { hour: 18, engagement: 0.7 }
    },
    // Weekends
    weekend: {
      morning: { hour: 10, engagement: 0.8 },
      afternoon: { hour: 14, engagement: 0.6 }
    }
  }

  // Get article priority and category
  const { priority, category, recommended_publish_time } = article

  // Priority multiplier
  const priorityMultiplier = {
    HIGH: 1.5,
    MEDIUM: 1.0,
    LOW: 0.7
  }

  // Category best times
  const categoryTimes = {
    'incidents': 'morning', // Breaking news
    'regulations': 'morning', // Important updates
    'best-practices': 'afternoon', // Educational
    'mental-health': 'lunch' // When people have time
  }

  // Determine time slot
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const timeSlot = categoryTimes[category] || recommended_publish_time

  // Calculate publish time
  let publishHour = isWeekday
    ? optimalTimes.weekday[timeSlot].hour
    : optimalTimes.weekend.morning.hour

  // Add randomization (±30 mins) to avoid clustering
  const randomMinutes = Math.floor(Math.random() * 60) - 30

  // Calculate next available slot
  const publishTime = new Date()
  publishTime.setHours(publishHour, randomMinutes, 0, 0)

  // If time has passed today, schedule for tomorrow
  if (publishTime < now) {
    publishTime.setDate(publishTime.getDate() + 1)
  }

  // Check article quota for that time slot (max 3 per hour)
  // This would query existing scheduled articles

  return publishTime
}
```

**Process Flow**:
```
Trigger (Every hour)
  ↓
Query Supabase:
  - status = 'approved'
  - scheduled_publish_time <= NOW()
  ↓
For each article:
  ↓
  Update status = 'published'
  Set published_at = NOW()
  ↓
  Call Website API:
    POST /api/revalidate
    {
      secret: REVALIDATE_SECRET,
      path: "/"
    }
  ↓
  Call Website API:
    POST /api/revalidate
    {
      secret: REVALIDATE_SECRET,
      path: "/articles/{slug}"
    }
  ↓
  Trigger Social Media Workflow
  ↓
  Log to published_articles table
```

**Auto-Scheduling for Approved Articles**:
```
Trigger (New approved article)
  ↓
Calculate Optimal Publish Time
  ↓
Check Daily Quota:
  - Max 5 articles per day
  - Max 3 per hour
  - Min 2 hours between same category
  ↓
Find Next Available Slot
  ↓
Update Article:
  - scheduled_publish_time = calculated_time
  - scheduling_reason = "Auto-scheduled based on {criteria}"
  ↓
Send Confirmation Notification
```

---

### WORKFLOW 4: Social Media Distributor

**Platform-Specific Templates**:

**LinkedIn**:
```javascript
function formatLinkedInPost(article) {
  return `${article.title}

${article.excerpt}

Key points:
${extractKeyPoints(article.content, 3)} // Extract 3 bullet points

Read the full article: ${article.url}

#HealthAndSafety #SafetyFirst #UKHSE #WorkplaceSafety ${article.tags.map(t => '#' + t.replace(/-/g, '')).join(' ')}
`
}
```

**Twitter/X**:
```javascript
function formatTweet(article) {
  const maxLength = 280
  const urlLength = 23 // Twitter's t.co length
  const hashtagsLength = 30 // Reserve for hashtags
  const availableLength = maxLength - urlLength - hashtagsLength

  let text = article.title
  if (text.length > availableLength) {
    text = text.substring(0, availableLength - 3) + '...'
  }

  return `${text}

${article.url}

#HealthSafety #UKHSE #SafetyFirst`
}
```

**Facebook**:
```javascript
function formatFacebookPost(article) {
  return `📢 ${article.title}

${article.excerpt}

This article covers:
${extractKeyPoints(article.content, 4)}

👉 Read more: ${article.url}

#HealthAndSafety #WorkplaceSafety #SafetyManagement
`
}
```

**Process Flow**:
```
Trigger (Article published webhook)
  ↓
Receive Article Data
  ↓
Branch by Platform:
  ├── LinkedIn
  │   ├── Format Post
  │   ├── Add Featured Image
  │   ├── POST to LinkedIn API
  │   └── Store Post ID
  │
  ├── Twitter/X
  │   ├── Format Tweet
  │   ├── Upload Image (if available)
  │   ├── POST to Twitter API
  │   └── Store Tweet ID
  │
  └── Facebook
      ├── Format Post
      ├── Upload Image
      ├── POST to Facebook Graph API
      └── Store Post ID
  ↓
Insert to social_posts table:
  - article_id
  - platform
  - post_id
  - post_url
  - posted_at
  ↓
Schedule Engagement Check (in 24 hours)
```

---

### WORKFLOW 5: Newsletter Compiler

**Newsletter Template Structure**:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Responsive email CSS */
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="logo-url" alt="HSE News">
      <h1>Weekly H&S Digest - {date}</h1>
    </div>

    <!-- Top Story -->
    <div class="top-story">
      <h2>🔥 Top Story This Week</h2>
      <img src="{featured_image}">
      <h3>{title}</h3>
      <p>{excerpt}</p>
      <a href="{url}">Read More →</a>
    </div>

    <!-- This Week's Articles -->
    <div class="articles">
      <h2>📰 This Week in Health & Safety</h2>

      <!-- By Category -->
      <h3>🚨 Incidents & Alerts</h3>
      {incidents_articles}

      <h3>📋 Regulations & Compliance</h3>
      {regulations_articles}

      <h3>✅ Best Practices</h3>
      {best_practices_articles}
    </div>

    <!-- Quick Stats -->
    <div class="stats">
      <h2>📊 By The Numbers</h2>
      <div class="stat-card">
        <span class="number">{total_articles}</span>
        <span class="label">Articles Published</span>
      </div>
      <div class="stat-card">
        <span class="number">{total_views}</span>
        <span class="label">Total Views</span>
      </div>
      <div class="stat-card">
        <span class="number">{trending_topic}</span>
        <span class="label">Trending Topic</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>You're receiving this because you subscribed to HSE News</p>
      <a href="{unsubscribe_url}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
```

**Process Flow**:
```
Trigger (Sunday 8 AM)
  ↓
Query Articles:
  - published_at >= 7 days ago
  - status = 'published'
  - ORDER BY views_count DESC
  ↓
Group by Category
  ↓
Select Top 10 Articles
  ↓
Get Weekly Stats:
  - Total articles published
  - Total views
  - Top trending tags
  - Most popular category
  ↓
Render HTML Template
  ↓
Query Subscribers:
  - verified = true
  - preferences.weekly_digest = true
  ↓
Batch Send (500 at a time):
  ↓
  For each batch:
    ├── Personalize (name, preferences)
    ├── Add tracking pixels
    ├── Generate unsubscribe token
    ├── Send via Resend/SendGrid
    └── Log to email_sent table
  ↓
Wait 1 minute between batches
  ↓
Send Completion Report
```

---

### WORKFLOW 6: Analytics Monitor

**Daily Report Structure**:

```javascript
{
  "date": "2025-01-05",
  "summary": {
    "articles_published": 5,
    "total_views": 1247,
    "avg_reading_time": "4.2 minutes",
    "bounce_rate": "32%",
    "top_referrer": "google.com"
  },
  "top_articles": [
    {
      "title": "...",
      "views": 456,
      "engagement_rate": "78%"
    }
  ],
  "categories": {
    "workplace-safety": { "articles": 2, "views": 567 },
    "regulations": { "articles": 1, "views": 234 }
  },
  "sources": {
    "hse-press": { "quality_avg": 8.2, "articles": 3 },
    "iosh": { "quality_avg": 7.8, "articles": 2 }
  },
  "alerts": [
    {
      "type": "low_engagement",
      "message": "Article views down 15% vs last week"
    }
  ]
}
```

**Process Flow**:
```
Trigger (Daily at midnight)
  ↓
Query Analytics Data:
  - Articles published today
  - Total views (last 24h)
  - Top performing articles
  - Category breakdown
  - Traffic sources
  - Source quality metrics
  ↓
Calculate Metrics:
  - Avg views per article
  - Engagement rates
  - Bounce rates
  - Time on page
  ↓
Generate Insights:
  - Trending topics
  - Best performing categories
  - Optimal publish times
  - Source effectiveness
  ↓
Check Alerts:
  - Low engagement (< threshold)
  - High bounce rate (> threshold)
  - No articles published
  - Workflow errors
  ↓
Format Report (Markdown/HTML)
  ↓
Send via Email:
  - To: admin@hsenews.co.uk
  - Subject: "Daily Analytics Report - {date}"
  - Attach: Charts/graphs
  ↓
Store in analytics_reports table
```

---

### WORKFLOW 7: Error Handler

**Error Categories**:

1. **Scraping Errors**
   - Source unavailable (404, 500)
   - Structure changed (selector not found)
   - Rate limited

2. **API Errors**
   - Claude API: Rate limit, invalid response
   - Supabase: Connection timeout, constraint violation
   - Social Media: Auth failed, post rejected

3. **Validation Errors**
   - Invalid article format
   - Missing required fields
   - Quality score too low

**Process Flow**:
```
Trigger (Any workflow error)
  ↓
Capture Error Details:
  - workflow_name
  - node_name
  - error_message
  - error_stack
  - input_data
  - timestamp
  ↓
Classify Error:
  - Critical: System down, data loss
  - High: Feature broken, workflow stopped
  - Medium: Partial failure, retry possible
  - Low: Expected failure, logged
  ↓
Insert to error_logs table
  ↓
If Critical or High:
  ├── Send Immediate Alert:
  │   - Email to admin
  │   - Push notification
  │   - SMS (optional)
  └── Create Incident in monitoring tool
  ↓
If Retry Possible:
  ├── Wait (exponential backoff)
  ├── Retry (max 3 attempts)
  └── Log retry result
  ↓
Update Error Status:
  - resolved
  - needs_attention
  - auto_recovered
```

---

## 🎛️ Configuration & Settings

### Environment Variables Needed

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# AI Services
ANTHROPIC_API_KEY=
OPENAI_API_KEY= # Optional fallback

# Social Media
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_ID=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
FACEBOOK_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=

# Email Service
RESEND_API_KEY=
# OR
SENDGRID_API_KEY=

# Website
SITE_URL=https://your-site.vercel.app
WEBHOOK_SECRET=
REVALIDATE_SECRET=

# Google Services (for image search, news API)
GOOGLE_API_KEY=
GOOGLE_CX= # Custom search engine ID

# Unsplash (for featured images)
UNSPLASH_ACCESS_KEY=

# Monitoring
SENTRY_DSN= # Optional
SLACK_WEBHOOK_URL= # For notifications
```

### Quality Control Settings

```javascript
const QUALITY_SETTINGS = {
  // Minimum quality score to auto-approve
  autoApproveThreshold: 8.0,

  // Maximum articles per day
  maxArticlesPerDay: 5,

  // Maximum articles per hour
  maxArticlesPerHour: 2,

  // Minimum time between same category (minutes)
  minCategoryInterval: 120,

  // Content length limits
  minContentLength: 500, // words
  maxContentLength: 3000, // words

  // Deduplication similarity threshold
  similarityThreshold: 0.85, // 85% similar = duplicate

  // Source weights (for quality calculation)
  sourceWeights: {
    'hse-press': 1.0,
    'gov-uk': 0.95,
    'iosh': 0.9,
    'construction-news': 0.85,
    'shp-online': 0.85
  }
}
```

---

## 📊 Expected Performance

### Daily Output
- **Raw Articles Scraped**: 40-60
- **AI Processed**: 30-40
- **Auto-Approved**: 15-25 (quality_score > 8.0)
- **Published**: 5-8
- **Social Posts**: 15-24 (3 platforms × 5-8 articles)

### Weekly Output
- **Articles Published**: 35-50
- **Newsletter Sent**: 1 (to all subscribers)
- **Social Engagement**: 500-1000 interactions

### Monthly Output
- **Articles Published**: 150-200
- **Total Views**: 10,000-50,000 (grows over time)
- **Newsletter Subscribers**: Growth 10-20%

---

## 🚀 Deployment Steps

See detailed implementation in:
- [Complete Workflow Files](./workflows/)
- [Setup Instructions](./SETUP.md)
- [Testing Guide](./TESTING.md)

---

**Next**: Implement individual workflow JSON files →
