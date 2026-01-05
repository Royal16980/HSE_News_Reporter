# n8n Workflow Automation System

Complete automation system for the UK Health & Safety News platform with 7 interconnected workflows.

## 🎯 System Overview

This automation system handles the entire content lifecycle:
1. **Aggregation** → Scrape articles from 5 sources
2. **Processing** → AI rewrites with Claude
3. **Publishing** → Smart scheduling algorithm
4. **Distribution** → Social media posting
5. **Newsletters** → Weekly compilation
6. **Analytics** → Daily performance reports
7. **Error Handling** → Automatic retry and alerting

**Expected Output**: 5-8 high-quality articles published daily, fully automated.

---

## 📦 Available Workflows

### 1. Content Aggregation Engine (`1-content-aggregation-engine.json`)

**Schedule**: Every 6 hours
**Purpose**: Scrape and queue articles from multiple sources

**Sources**:
- HSE Press Releases (https://press.hse.gov.uk/)
- GOV.UK News (health-and-safety-executive)
- IOSH Magazine RSS
- Construction News Safety Feed
- SHP Online Feed

**Process**:
1. Fetches articles from all sources in parallel
2. Parses RSS/HTML content
3. Checks for duplicates via original URL
4. Fetches full article content
5. Inserts to `articles_queue` table
6. Triggers AI Processing workflow

**Expected Output**: 20-40 raw articles per day

---

### 2. AI Processing Pipeline (`2-ai-processing-pipeline.json`)

**Trigger**: Webhook from Content Aggregation
**Purpose**: Transform raw content into publication-ready articles

**Process**:
1. Retrieves queue item from database
2. Sends to Claude AI with comprehensive prompt
3. Parses JSON metadata response
4. Searches Unsplash for featured image
5. Quality check (minimum score: 7/10)
6. Inserts to `articles` table with status `pending_review`
7. Updates queue status

**Claude AI Instructions**:
- Rewrite in professional UK English
- 1200-1500 words target
- Include UK regulations (HSWA 1974, COSHH, CDM, RIDDOR)
- Generate metadata (category, tags, SEO keywords, priority)
- Quality score (0-10)
- Markdown formatting with H2/H3 structure

**Expected Output**: 15-25 processed articles per day, 70%+ quality score

---

### 3. Smart Publisher (`3-smart-publisher.json`)

**Schedule**: Every hour
**Purpose**: Intelligently publish articles based on optimal timing

**Publishing Rules**:
- Maximum 5 articles per day
- Maximum 3 articles per 3-hour window
- Business hours only (7 AM - 7 PM UK) except HIGH priority
- Priority-based scheduling

**Process**:
1. Query articles with `scheduled_publish_time <= NOW()`
2. Apply quota limits
3. Filter by business hours
4. Publish top priority articles
5. Revalidate ISR cache
6. Trigger social media distribution
7. Log publication event

**Expected Output**: 3-5 articles published daily

---

### 4. Social Media Distribution (`4-social-media-distributor.json`)

**Trigger**: Webhook after article published
**Purpose**: Post to LinkedIn, Twitter/X, and Facebook

**Platform-Specific Formatting**:
- **LinkedIn**: Professional tone, full excerpt, relevant hashtags
- **Twitter/X**: Concise (280 chars), URL, #HSE #WorkplaceSafety
- **Facebook**: Casual, emoji, call-to-action

**Process**:
1. Receives article data via webhook
2. Formats posts for each platform
3. Posts to all platforms in parallel
4. Logs to `social_media_posts` table
5. Returns summary

**Expected Output**: 3 social posts per published article (9-15/day)

---

### 5. Weekly Newsletter Compiler (`5-newsletter-compiler.json`)

**Schedule**: Every Sunday 8 AM
**Purpose**: Send weekly digest to subscribers

**Content Structure**:
- Summary stats (articles count, categories, reading time)
- Featured articles (top 3 by views)
- Quick reads (under 5 minutes)
- Articles grouped by category
- Responsive HTML email template

**Process**:
1. Fetch last week's published articles
2. Organize by category and performance
3. Build HTML email with inline CSS
4. Get active verified subscribers
5. Send in batches of 500 (2s delay between)
6. Log to `newsletter_history` table

**Expected Output**: 1 newsletter per week to all subscribers

---

### 6. Analytics Monitor (`6-analytics-monitor.json`)

**Schedule**: Every day 9 AM
**Purpose**: Generate daily performance reports

**Metrics Tracked**:
- Articles published (24h, 7d)
- View counts and averages
- Top 5 performing articles
- Newsletter subscriber growth
- Category performance
- Social media posting stats
- AI processing success rate

**Health Checks**:
- **Warning**: No articles published, low views, no new subscribers
- **Error**: AI success rate < 70%, critical failures

**Process**:
1. Query all metrics in parallel
2. Compile comprehensive report
3. Format for email
4. Send to admin email
5. Save to `analytics_reports` table
6. Alert if critical issues found

**Expected Output**: 1 daily report email

---

### 7. Global Error Handler (`7-error-handler.json`)

**Triggers**:
- Webhook from any workflow on error
- Scheduled cleanup (every 6 hours)

**Purpose**: Centralized error logging, classification, and retry

**Error Classification**:
- **Critical**: Database, authentication, API key, AI processing failures
- **High**: Claude errors, Supabase issues, timeouts, publishing
- **Medium**: Social media, newsletter, image search
- **Low**: Warnings, transient errors

**Retry Logic**:
- Exponential backoff (1min, 2min, 4min)
- Maximum 3 retry attempts
- Only retry network/timeout errors
- Skip auth/validation errors

**Process**:
1. Classify error severity
2. Log to `error_logs` table
3. Send critical alert email if critical
4. Retry if appropriate (< 3 attempts)
5. Mark for manual intervention if max retries
6. Periodic cleanup (delete resolved > 30 days)

**Expected Output**: Error emails only on critical issues

---

## 🚀 Setup Instructions

### Step 1: Import Workflows

**Option A: n8n UI**
```
1. Open https://n8n.srv1246730.hstgr.cloud
2. Workflows → Import from File
3. Select each workflow JSON (1-7)
4. Import all 7 workflows
```

**Option B: n8n CLI**
```bash
# If you have n8n CLI installed
n8n import:workflow --input=1-content-aggregation-engine.json
n8n import:workflow --input=2-ai-processing-pipeline.json
# ... repeat for all 7
```

---

### Step 2: Configure Credentials

Create these credentials in n8n (**Settings → Credentials**):

#### 1. Supabase API
```
Name: Supabase HSE News
Type: Supabase
Host: https://your-project.supabase.co
Service Role Key: eyJhbG... (from Supabase dashboard)
```

#### 2. Webhook Secret Auth
```
Name: Webhook Secret Auth
Type: Header Auth
Name: x-webhook-secret
Value: [generate random 32-char string]
```

#### 3. Anthropic API
```
Name: Anthropic Claude API
Type: Anthropic
API Key: sk-ant-... (from Anthropic console)
```

#### 4. LinkedIn OAuth2
```
Name: LinkedIn OAuth2
Type: LinkedIn OAuth2 API
Client ID: [from LinkedIn Developer Portal]
Client Secret: [from LinkedIn Developer Portal]
```

#### 5. Twitter OAuth2
```
Name: Twitter OAuth2
Type: Twitter OAuth2 API
API Key: [from Twitter Developer Portal]
API Secret: [from Twitter Developer Portal]
Access Token: [generated via OAuth]
Access Token Secret: [generated via OAuth]
```

#### 6. Facebook Graph API
```
Name: Facebook Graph API
Type: Facebook Graph API
Access Token: [from Facebook Developers]
```

#### 7. SMTP Email Service
```
Name: SMTP Email Service
Type: SMTP
Host: smtp.gmail.com (or your provider)
Port: 587
User: your-email@domain.com
Password: your-app-password
```

---

### Step 3: Configure Environment Variables

Add to your n8n environment (`docker-compose.yml` or n8n settings):

```env
# Website
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app

# n8n
N8N_WEBHOOK_URL=https://n8n.srv1246730.hstgr.cloud/webhook/
N8N_API_KEY=your_n8n_api_key

# Security
WEBHOOK_SECRET=your_webhook_secret_here
REVALIDATE_SECRET=your_revalidate_secret_here

# Supabase (automatically available if using Supabase credential)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Social Media
FACEBOOK_PAGE_ID=your_facebook_page_id

# Images
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Admin
ADMIN_EMAIL=your-email@domain.com
```

---

### Step 4: Update Database Schema

Run the updated schema in Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql
# Paste in Supabase Dashboard → SQL Editor → New Query
# Click "Run"
```

This adds:
- `articles_queue` table
- `social_media_posts` table
- `newsletter_history` table
- `analytics_reports` table
- `error_logs` table
- `activity_log` table
- Enhanced `articles` columns (ai_generated, quality_score, priority, etc.)
- RLS policies for automation
- Helper functions

---

### Step 5: Update Workflow Credential References

For each workflow, update the credential IDs:

1. Open workflow in n8n editor
2. Click on nodes with credentials (Supabase, Anthropic, etc.)
3. Select your configured credentials from dropdown
4. Save workflow

**Nodes to update**:
- All Supabase nodes → "Supabase HSE News"
- Claude nodes → "Anthropic Claude API"
- LinkedIn nodes → "LinkedIn OAuth2"
- Twitter nodes → "Twitter OAuth2"
- Facebook nodes → "Facebook Graph API"
- Email nodes → "SMTP Email Service"
- Webhook nodes → "Webhook Secret Auth"

---

### Step 6: Test Each Workflow

**Workflow 1: Content Aggregation**
```
1. Open workflow
2. Click "Test workflow"
3. Click "Execute Workflow"
4. Verify: Check articles_queue table has new entries
```

**Workflow 2: AI Processing**
```
1. Manually trigger via webhook:
   curl -X POST https://n8n.srv1246730.hstgr.cloud/webhook/workflow/ai-processing-trigger \
     -H "x-webhook-secret: YOUR_SECRET" \
     -d '{"queue_id":"UUID-FROM-QUEUE-TABLE"}'
2. Verify: Check articles table has new entry
```

**Workflow 3: Smart Publisher**
```
1. Update an article: SET scheduled_publish_time = NOW() WHERE status = 'pending_review'
2. Execute workflow
3. Verify: Article status changed to 'published'
```

**Workflows 4-7**: Follow similar test patterns

---

### Step 7: Activate Workflows

1. Toggle each workflow to **Active** (green toggle switch)
2. Verify in **Executions** tab that they run on schedule
3. Monitor for first 24 hours

**Recommended Activation Order**:
1. Error Handler (7) - First, so errors are caught
2. Content Aggregation (1)
3. AI Processing (2)
4. Smart Publisher (3)
5. Social Distribution (4)
6. Analytics Monitor (6)
7. Newsletter Compiler (5) - Last, after content builds up

---

## 📊 Monitoring & Maintenance

### Daily Checks

1. **Email Reports**: Check daily analytics email (9 AM)
2. **Error Logs**: Review error logs for critical issues
3. **Article Count**: Verify 3-5 articles published daily

```sql
-- Quick health check query
SELECT
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as new_queue_items,
  COUNT(*) FILTER (WHERE status = 'processed') as processed_24h,
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review
FROM articles_queue
WHERE created_at > NOW() - INTERVAL '1 day';
```

### Weekly Checks

1. **Newsletter**: Verify Sunday newsletter sent
2. **Social Stats**: Check engagement on social posts
3. **Subscriber Growth**: Monitor newsletter subscribers
4. **Quality Scores**: Review AI processing quality

```sql
-- Weekly performance
SELECT
  DATE_TRUNC('week', published_at) as week,
  COUNT(*) as articles_published,
  AVG(quality_score) as avg_quality,
  SUM(views_count) as total_views
FROM articles
WHERE published_at > NOW() - INTERVAL '4 weeks'
GROUP BY week
ORDER BY week DESC;
```

### Monthly Review

1. **Workflow Performance**: Check execution times
2. **Cost Analysis**: Review API usage (Claude, social media)
3. **Content Quality**: Manual review of sample articles
4. **Backup Workflows**: Export JSON files to git

---

## 🔧 Troubleshooting

### Common Issues

**"Workflow not triggering"**
```
✓ Check workflow is Active (green toggle)
✓ Verify schedule trigger configuration
✓ Check n8n execution logs
✓ Restart n8n if needed
```

**"Claude API errors"**
```
✓ Verify API key valid
✓ Check Anthropic account credits
✓ Review rate limits (tier-based)
✓ Check prompt token count < 4000
```

**"Supabase connection failed"**
```
✓ Verify service role key correct
✓ Check RLS policies allow service role
✓ Test connection in n8n credential test
✓ Verify table names match schema
```

**"Social media posting failed"**
```
✓ Check OAuth tokens not expired
✓ Verify app permissions (LinkedIn/Twitter/Facebook)
✓ Test API connection manually
✓ Review platform rate limits
```

**"No articles being published"**
```
✓ Check articles have scheduled_publish_time set
✓ Verify Smart Publisher workflow active
✓ Review quota limits (5/day, 3/3hours)
✓ Check business hours filter (7AM-7PM)
```

**"Newsletter not sending"**
```
✓ Verify SMTP credentials correct
✓ Check subscriber count > 0
✓ Review email service rate limits
✓ Test SMTP connection manually
```

### Debug Mode

Enable debug logging in n8n:

```yaml
# docker-compose.yml
environment:
  - N8N_LOG_LEVEL=debug
  - N8N_LOG_OUTPUT=console,file
```

View logs:
```bash
docker logs n8n -f --tail 100
```

---

## 🎨 Customization Guide

### Modify Content Sources

**Add New RSS Feed**:
```javascript
// In workflow 1, duplicate HTTP Request node
{
  "parameters": {
    "url": "https://new-source.com/feed.xml",
    "options": {}
  },
  "name": "New Source Feed"
}
```

**Add Non-RSS Source**:
```javascript
// Use Puppeteer or HTTP Request + HTML parse
// Then format to match queue structure
```

### Adjust AI Prompt

Edit Workflow 2, "Claude - Rewrite Article" node:
```
Change target word count: 800-1200 instead of 1200-1500
Modify tone: "casual" vs "professional"
Add industry focus: "construction" vs "general"
Change UK regulations emphasis
```

### Modify Publishing Schedule

**Change Daily Quota**:
```javascript
// Workflow 3, "Apply Publishing Rules" node
const MAX_PER_DAY = 8; // Change from 5
const MAX_PER_3_HOURS = 4; // Change from 3
```

**Change Business Hours**:
```javascript
// Workflow 3
if (currentHour < 6 || currentHour > 20) { // 6 AM - 8 PM instead of 7-7
  return article.priority === 'HIGH';
}
```

### Customize Social Posts

**LinkedIn Professional Format**:
```javascript
// Workflow 4, "Format Platform-Specific Posts"
const linkedInPost = `🔍 NEW INSIGHT: ${data.title}

${data.excerpt}

Key Takeaways:
• [Auto-extract from article]
• [Key point 2]

Full analysis: ${data.url}

#HSE #SafetyFirst #UKWorkplace`;
```

### Modify Newsletter Template

Edit Workflow 5, "Build Email HTML" function:
- Change color scheme (currently blue/purple gradient)
- Modify section order
- Add/remove content blocks
- Customize email footer

---

## 📈 Performance Optimization

### Reduce API Costs

**Claude**:
- Reduce max tokens: 4000 → 3000
- Use Claude Haiku instead of Sonnet (cheaper, faster)
- Batch processing instead of per-item

**Unsplash**:
- Cache images in Supabase Storage
- Use fallback placeholder images
- Limit to 1 search per article

### Improve Processing Speed

**Parallel Execution**:
```javascript
// Already implemented in workflow 1
// All sources fetched simultaneously
```

**Reduce Queue Time**:
```
Trigger AI processing immediately (webhook)
Instead of polling queue every hour
```

### Scale Up

**Handle More Articles**:
- Increase daily quota (5 → 10)
- Add more content sources
- Reduce quality threshold (7 → 6)

**Multi-Language Support**:
- Duplicate workflows for each language
- Update Claude prompt for translation
- Separate Supabase tables per language

---

## 🔒 Security Best Practices

1. **Webhook Security**: Always use `x-webhook-secret` header
2. **Environment Variables**: Never commit secrets to git
3. **API Keys**: Rotate every 90 days
4. **RLS Policies**: Keep service_role access limited
5. **Error Logs**: Don't log sensitive data (API keys, passwords)
6. **Email**: Use app-specific passwords, not account passwords
7. **Social OAuth**: Review app permissions regularly

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [Claude API Reference](https://docs.anthropic.com)
- [Supabase Documentation](https://supabase.com/docs)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Twitter API](https://developer.twitter.com/en/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)

---

## 🆘 Support

### Quick Help

**Check Workflow Status**:
```sql
SELECT
  workflow_name,
  COUNT(*) as executions,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical_errors
FROM error_logs
WHERE occurred_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_name;
```

**Monitor Queue Health**:
```sql
SELECT
  status,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM articles_queue
GROUP BY status;
```

**Review Recent Publications**:
```sql
SELECT title, published_at, quality_score, priority
FROM articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;
```

---

## 📝 Changelog

### v2.0.0 (2026-01-05)
- ✅ Complete 7-workflow automation system
- ✅ AI Processing Pipeline with Claude
- ✅ Smart Publishing with quota management
- ✅ Social Media Distribution (3 platforms)
- ✅ Weekly Newsletter Compiler
- ✅ Daily Analytics Monitor
- ✅ Global Error Handler with retry logic
- ✅ Enhanced database schema with automation tables
- ✅ Comprehensive documentation

### v1.0.0 (2025-01-04)
- Initial HSE Content Aggregator workflow
- Basic Claude AI integration
- Supabase connection

---

**Your HSE News platform is now fully automated!** 🎉

Expected daily output:
- 📰 20-40 articles scraped
- 🤖 15-25 articles processed by AI
- ✅ 3-5 articles published
- 📱 9-15 social media posts
- 📧 1 weekly newsletter (Sundays)
- 📊 1 daily analytics report

**Zero manual intervention required** - just monitor the daily email reports.
