# HSE News Automation Agents

## Overview

This document describes the 7 autonomous n8n workflow agents deployed to automate content aggregation, AI processing, publishing, and distribution for the UK Health & Safety News platform.

**n8n Instance**: `https://n8n.srv1246730.hstgr.cloud`

---

## Changelog

- 2026-01-22 (Codex): Updated agent statuses, webhook path, and added implementation notes.

---

## Deployed Agents

| # | Agent Name | Workflow ID | Trigger | Status |
|---|------------|-------------|---------|--------|
| 1 | Content Aggregation Engine | `mXlxtZkd83aCDpps` | Schedule (6h) | Deployed |
| 2 | AI Processing Pipeline | `fUdZM9bkWrBXxSOR` | Webhook | Updated in repo (pending import) |
| 3 | Smart Publisher | `4ZlT2WywMfKFVBzM` | Schedule (1h) | Updated in repo (pending import) |
| 4 | Social Media Distribution | `pLw2wJYng2hb1Bqq` | Webhook | Updated in repo (pending import) |
| 5 | Newsletter Compiler | `UvKgpMPZmlKIUvJr` | Schedule (Weekly) | Updated in repo (pending import) |
| 6 | Analytics Monitor | `uM1D5Njot53Sux47` | Schedule (Daily) | Updated in repo (pending import) |
| 7 | Error Handler | `7Ww7AY08s2pzsGd5` | Error Trigger | Updated in repo (pending import) |

---

## Agent 1: Content Aggregation Engine

**Workflow ID**: `mXlxtZkd83aCDpps`
**File**: `n8n-workflows/IMPROVED/1-content-aggregation-v2.json`
**Schedule**: Every 6 hours (`0 */6 * * *`)

### Purpose
Scrapes multiple RSS feeds and news sources, extracts relevant health & safety content, and queues articles for AI processing.

### Data Flow
```
Schedule Trigger (Every 6 hours)
       ↓
RSS Feed Reader (Multiple sources)
       ↓
Parse & Extract Articles
       ↓
Check Duplicates (Supabase)
       ↓
Insert to articles_queue
       ↓
Trigger AI Processing Webhook
```

### RSS Sources (from `rss_sources` table)
- HSE Gov UK News (priority: 10)
- IOSH Magazine (priority: 8)
- Safety & Health Practitioner (priority: 8)
- Construction Enquirer Safety (priority: 7)
- Fire Safety Matters (priority: 7)
- Food Safety News (priority: 6)

### Output
- New articles inserted into `articles_queue` table
- Status: `pending_ai_processing`

---

## Agent 2: AI Processing Pipeline

**Workflow ID**: `fUdZM9bkWrBXxSOR`
**File**: `n8n-workflows/IMPROVED/2-ai-processing-v2.json`
**Trigger**: Webhook (`/webhook/ai-processing`)

### Purpose
Uses Claude AI to rewrite, enhance, categorize, and score raw articles from the queue.

### Data Flow
```
Webhook Trigger (article_id)
       ↓
Fetch Article from Queue
       ↓
Claude AI Processing
  - Rewrite content
  - Assign category
  - Generate tags
  - Calculate quality score
  - Set priority (HIGH/MEDIUM/LOW)
       ↓
Generate Slug & Reading Time
       ↓
Insert to articles table
       ↓
Update queue status → 'processed'
```

### Claude AI Prompt Tasks
1. Rewrite in professional UK English style
2. Categorize into one of 11 categories
3. Generate 5-7 relevant tags
4. Create 150-200 char excerpt
5. Assign priority based on content type
6. Calculate quality score (0-10)
7. Generate SEO keywords

### Categories
- `workplace-safety`, `fire-safety`, `chemical-safety`
- `construction`, `healthcare`, `food-safety`
- `ergonomics`, `mental-health`, `incidents`
- `regulations`, `best-practices`

### Output
- Processed article in `articles` table
- Status: `draft` (requires review) or `approved` (if quality_score > 8.0)

---

## Agent 3: Smart Publisher

**Workflow ID**: `4ZlT2WywMfKFVBzM`
**File**: `n8n-workflows/IMPROVED/3-smart-publisher-v2.json`
**Schedule**: Every hour (`0 * * * *`)

### Purpose
Publishes approved articles at optimal times and triggers ISR cache revalidation.

### Data Flow
```
Schedule Trigger (Hourly)
       ↓
Query Approved Articles
  - status = 'approved'
  - scheduled_publish_time <= NOW()
       ↓
For Each Article:
  ├── Update status → 'published'
  ├── Set published_at timestamp
  ├── Trigger ISR Revalidation
  └── Trigger Social Media Webhook
       ↓
Log to activity_log
```

### Publishing Rules
- Max 5 articles per day
- Max 3 articles per hour
- Min 2 hours between same category
- Priority-based scheduling (HIGH → ASAP)

### ISR Revalidation
Calls website API to invalidate Next.js cache:
- `POST /api/revalidate` with path: `/`
- `POST /api/revalidate` with path: `/articles/{slug}`

---

## Agent 4: Social Media Distribution

**Workflow ID**: `pLw2wJYng2hb1Bqq`
**File**: `n8n-workflows/IMPROVED/4-social-media-v4.json`
**Trigger**: Webhook (`/webhook/article-published`)

### Purpose
Automatically creates and logs social media posts when articles are published.

### Data Flow
```
Webhook Trigger (article data)
       ↓
Format Posts for Each Platform
  - LinkedIn: Full excerpt + hashtags
  - Twitter: Short title + link + hashtags
       ↓
Insert to social_media_posts table
  - platform: 'linkedin' / 'twitter'
  - status: 'pending'
       ↓
Return Success Response
```

### Post Formats

**LinkedIn**:
```
{title}

{excerpt}

{url}

#HealthAndSafety #WorkplaceSafety #HSE
```

**Twitter**:
```
{title (max 200 chars)}
{url} #HSE
```

### Output
- Records in `social_media_posts` table
- Status: `pending` (ready for actual posting via social APIs)

---

## Agent 5: Newsletter Compiler

**Workflow ID**: `UvKgpMPZmlKIUvJr`
**File**: `n8n-workflows/IMPROVED/5-newsletter-v2.json`
**Schedule**: Weekly - Friday 10 AM (`0 10 * * 5`)

### Purpose
Compiles weekly digest of top articles and sends to newsletter subscribers.

### Data Flow
```
Schedule Trigger (Friday 10 AM)
       ↓
Query Week's Articles
  - published_at >= 7 days ago
  - status = 'published'
  - ORDER BY views_count DESC
  - LIMIT 10
       ↓
Query Active Subscribers
  - active = true
  - verified = true
       ↓
Compile Newsletter HTML
       ↓
Send via SMTP (batch of 50)
       ↓
Log to newsletter_history
```

### Newsletter Content
- Top story of the week
- Articles by category
- Weekly statistics
- Unsubscribe link

### Output
- Emails sent to subscribers
- Record in `newsletter_history` table

---

## Agent 6: Analytics Monitor

**Workflow ID**: `uM1D5Njot53Sux47`
**File**: `n8n-workflows/IMPROVED/6-analytics-v3.json`
**Schedule**: Daily at 9 AM (`0 9 * * *`)

### Purpose
Generates daily analytics reports on article performance and system health.

### Data Flow
```
Schedule Trigger (9 AM Daily)
       ↓
Query All Published Articles
       ↓
Compile Report:
  - Total articles
  - Articles published yesterday
  - Total views
  - Generated timestamp
       ↓
Insert to analytics_reports table
```

### Metrics Tracked
- `total_articles`: Count of all published articles
- `published_yesterday`: Articles from last 24 hours
- `total_views`: Sum of all article views
- `generated_at`: Report timestamp

### Output
- Daily report in `analytics_reports` table
- Report type: `daily`
- Health status: `healthy`

---

## Agent 7: Error Handler

**Workflow ID**: `7Ww7AY08s2pzsGd5`
**File**: `n8n-workflows/IMPROVED/7-error-handler-v3.json`
**Trigger**: n8n Error Trigger (any workflow error)

### Purpose
Captures, classifies, and logs errors from all workflows for monitoring and debugging.

### Data Flow
```
Error Trigger (Any workflow error)
       ↓
Extract Error Details:
  - workflow_name
  - node_name
  - error_message
       ↓
Classify Severity:
  - critical: database/auth errors
  - high: timeout errors
  - medium: social media errors
  - low: other errors
       ↓
Insert to error_logs table
```

### Severity Classification
| Keyword | Severity |
|---------|----------|
| `database`, `authentication` | critical |
| `timeout` | high |
| `social` | medium |
| Other | low |

### Output
- Error record in `error_logs` table with:
  - `error_id`: Unique identifier
  - `workflow_name`: Source workflow
  - `node_name`: Failed node
  - `severity`: low/medium/high/critical
  - `error_message`: Error details
  - `occurred_at`: Timestamp

---

## Activation Order

Activate workflows in this order to ensure dependencies work correctly:

1. **Error Handler** (Agent 7) - Must be active first to catch errors
2. **Content Aggregation** (Agent 1) - Starts the pipeline
3. **AI Processing** (Agent 2) - Processes queued content
4. **Smart Publisher** (Agent 3) - Publishes approved articles
5. **Social Media** (Agent 4) - Distributes published articles
6. **Newsletter** (Agent 5) - Weekly digest
7. **Analytics** (Agent 6) - Daily monitoring

---

## Required Credentials

Configure these credentials in n8n Settings > Credentials:

| Credential | Used By | Purpose |
|------------|---------|---------|
| Supabase | All agents | Database operations |
| Anthropic | Agent 2 | Claude AI processing |
| SMTP | Agent 5 | Newsletter emails |

### Supabase Credential
- **URL**: Your Supabase project URL
- **Service Role Key**: For bypassing RLS

### Anthropic Credential
- **API Key**: Your Anthropic API key
- **Model**: `claude-3-5-sonnet-20241022`

---

## Database Tables Used

| Table | Agents | Purpose |
|-------|--------|---------|
| `articles_queue` | 1, 2 | Raw content queue |
| `articles` | 2, 3, 5, 6 | Published articles |
| `social_media_posts` | 4 | Social post records |
| `newsletter_history` | 5 | Newsletter logs |
| `analytics_reports` | 6 | Daily reports |
| `error_logs` | 7 | Error tracking |
| `rss_sources` | 1 | Feed configuration |

---

## Webhook URLs

After activating workflows, these webhooks become available:

| Agent | Webhook Path | Method |
|-------|--------------|--------|
| Agent 2 | `/webhook/ai-processing` | POST |
| Agent 4 | `/webhook/article-published` | POST |

**Base URL**: `https://n8n.srv1246730.hstgr.cloud`

---

## Monitoring

### Check Workflow Status
```bash
curl -X GET \
  "https://n8n.srv1246730.hstgr.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: YOUR_API_KEY"
```

### View Executions
1. Open n8n dashboard
2. Go to **Executions** tab
3. Filter by workflow name
4. Check success/failure rates

### Query Error Logs
```sql
SELECT workflow_name, severity, error_message, occurred_at
FROM error_logs
WHERE occurred_at > NOW() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;
```

### Check Automation Health
```sql
SELECT * FROM automation_health;
```

---

## Implementation Notes (Coder Status)

### App Integration Updates
- Admin PWA analytics, review, schedule, and settings pages are wired to live APIs.
- Added pull-to-refresh and offline action sync for review queue and analytics.
- Settings now persist locally and sync dark mode via next-themes.
- Schedule view aligns to Monday-Sunday and supports detail modal on tap.

### Workflow Updates (Repo Only)
- Workflow 2: Webhook path moved to `/webhook/ai-processing`, Claude model set to `claude-3-5-sonnet-20241022`, parsing hardened, auto-approve when quality score >= 8.
- Workflow 3: Hourly schedule, business-hours gate, daily and 3-hour quotas, reschedule outside business hours, logs to `publishing_schedule`.
- Workflow 4: LinkedIn + Twitter posting with platform formatting and error-tolerant logging (Facebook removed).
- Workflow 5: Friday 10 AM digest, top 10 by views, SMTP batching, unsubscribe link injected.
- Workflow 6: Expanded health metrics (queue, errors, social posts) with health status computation.
- Workflow 7: Severity classification, retry backoff, and alert emails for high/critical errors.

### Pending Actions
- Import updated workflows into n8n and activate in order.
- Verify `error_logs` has `resolved` column or adjust workflow 6 filter.
- Install and run Admin PWA tests (vitest) after dependency install.

---

## Troubleshooting

### Agent Not Triggering
1. Check if workflow is activated in n8n
2. Verify schedule trigger cron expression
3. Check n8n execution logs

### Database Errors
1. Verify Supabase credentials in n8n
2. Check RLS policies allow service_role
3. Confirm table schema matches workflow fields

### AI Processing Failures
1. Check Anthropic API key is valid
2. Verify rate limits not exceeded
3. Review article content for issues

### Social Posts Not Created
1. Verify webhook is receiving data
2. Check social_media_posts table for records
3. Review error_logs for failures

---

## File Locations

```
n8n-workflows/
├── IMPROVED/
│   ├── 1-content-aggregation-v2.json
│   ├── 2-ai-processing-v2.json
│   ├── 3-smart-publisher-v2.json
│   ├── 4-social-media-v4.json
│   ├── 5-newsletter-v2.json
│   ├── 6-analytics-v3.json
│   └── 7-error-handler-v3.json
├── AUTOMATION_SYSTEM.md
└── README.md
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.0 | 2025-01-15 | Complete rewrite with best practices |
| v1.0 | Initial | Original workflows |

---

## Support

- **n8n Docs**: https://docs.n8n.io
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: Check error_logs table
