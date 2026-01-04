# n8n Integration Guide

## Overview

This document explains how to integrate the n8n automation platform with the UK Health & Safety News website for automated content aggregation, processing, and publishing.

## n8n MCP Server Configuration

Your n8n MCP server is already configured and accessible at:
```
https://n8n.srv1246730.hstgr.cloud/mcp-server/http
```

### MCP Server Settings

The MCP configuration in your Claude Code settings:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://n8n.srv1246730.hstgr.cloud/mcp-server/http",
        "--header",
        "authorization:Bearer [YOUR_TOKEN]"
      ]
    }
  }
}
```

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Content Flow Pipeline                     │
└─────────────────────────────────────────────────────────────┘

1. Content Sources (External)
   ├── HSE Press Releases
   ├── GOV.UK H&S News
   ├── IOSH Magazine
   └── Industry Publications
         ↓
2. n8n Workflow (Scheduled - Every 6 hours)
   ├── HTTP Request nodes (fetch content)
   ├── HTML Parser / RSS Reader
   ├── Deduplication Check (against Supabase)
   ├── Claude API (rewrite & enhance)
   ├── Quality Scoring Algorithm
   └── Insert to Supabase (status: pending_review)
         ↓
3. Supabase Database
   ├── Articles table (status: pending_review)
   └── Trigger notification to admin
         ↓
4. Admin Review (Future: PWA)
   ├── Swipe gesture review
   ├── Approve/Reject/Edit
   └── Schedule publication time
         ↓
5. Auto-Publisher Workflow (Runs hourly)
   ├── Query approved articles with scheduled_publish_time <= NOW()
   ├── Update status to 'published'
   └── Invalidate Next.js cache
         ↓
6. Website (ISR Updates)
   ├── New articles appear automatically
   └── Social media distribution (optional)
```

## Workflow Templates

### 1. Content Aggregation Workflow

**Workflow Name**: `hse-content-aggregator`

**Schedule**: Every 6 hours

**Nodes**:

1. **Schedule Trigger**
   - Cron: `0 */6 * * *`
   - Timezone: Europe/London

2. **HTTP Request - HSE Press Releases**
   ```json
   {
     "method": "GET",
     "url": "https://press.hse.gov.uk/",
     "responseFormat": "text/html"
   }
   ```

3. **HTML Extract - Parse Articles**
   ```json
   {
     "cssSelector": "article.press-release",
     "extractionValues": {
       "title": "h2.title",
       "url": "a[href]",
       "date": "time",
       "summary": "p.summary"
     }
   }
   ```

4. **Supabase - Check for Duplicates**
   ```json
   {
     "operation": "select",
     "table": "articles",
     "filter": "source_url.eq.{{$json.url}}"
   }
   ```

5. **IF - Skip if Exists**
   - Condition: `{{ $json.length === 0 }}`

6. **HTTP Request - Fetch Full Article**
   ```json
   {
     "url": "{{ $('HTML Extract').item.json.url }}"
   }
   ```

7. **Claude AI - Rewrite Article**
   ```json
   {
     "model": "claude-sonnet-4-5",
     "prompt": "Rewrite this UK health and safety news article for a professional audience. Maintain accuracy and add analysis where appropriate:\n\nTitle: {{$json.title}}\nContent: {{$json.content}}\n\nProvide response in this JSON format:\n{\n  \"title\": \"Improved headline\",\n  \"content\": \"Full article in Markdown\",\n  \"excerpt\": \"150-200 character summary\",\n  \"category\": \"workplace-safety|fire-safety|etc\",\n  \"tags\": [\"tag1\", \"tag2\"],\n  \"priority\": \"HIGH|MEDIUM|LOW\",\n  \"quality_score\": 8.5\n}"
   }
   ```

8. **Code - Calculate Reading Time**
   ```javascript
   const content = $input.item.json.content;
   const words = content.split(/\s+/).length;
   const readingTime = Math.ceil(words / 200);

   return {
     json: {
       ...$input.item.json,
       reading_time: readingTime
     }
   };
   ```

9. **Code - Generate Slug**
   ```javascript
   const title = $input.item.json.title;
   const slug = title
     .toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/(^-|-$)/g, '');

   return {
     json: {
       ...$input.item.json,
       slug
     }
   };
   ```

10. **Supabase - Insert Article**
    ```json
    {
      "operation": "insert",
      "table": "articles",
      "data": {
        "title": "={{ $json.title }}",
        "slug": "={{ $json.slug }}",
        "content": "={{ $json.content }}",
        "excerpt": "={{ $json.excerpt }}",
        "category": "={{ $json.category }}",
        "tags": "={{ $json.tags }}",
        "source_url": "={{ $('HTML Extract').item.json.url }}",
        "status": "pending_review",
        "quality_score": "={{ $json.quality_score }}",
        "priority": "={{ $json.priority }}",
        "reading_time": "={{ $json.reading_time }}",
        "ai_generated": true
      }
    }
    ```

11. **IF - High Priority**
    - Condition: `{{ $json.priority === 'HIGH' }}`

12. **Send Notification** (if high priority)
    ```json
    {
      "method": "POST",
      "url": "https://api.onesignal.com/notifications",
      "body": {
        "app_id": "YOUR_ONESIGNAL_APP_ID",
        "contents": {
          "en": "New high-priority H&S article: {{ $json.title }}"
        },
        "included_segments": ["Admin"]
      }
    }
    ```

### 2. Auto-Publisher Workflow

**Workflow Name**: `hse-auto-publisher`

**Schedule**: Every hour

**Nodes**:

1. **Schedule Trigger**
   - Cron: `0 * * * *`

2. **Supabase - Get Scheduled Articles**
   ```json
   {
     "operation": "select",
     "table": "articles",
     "filter": "status.eq.approved,scheduled_publish_time.lte.now()"
   }
   ```

3. **IF - Has Articles**
   - Condition: `{{ $json.length > 0 }}`

4. **Split In Batches**
   - Batch Size: 10

5. **Supabase - Update Status**
   ```json
   {
     "operation": "update",
     "table": "articles",
     "filter": "id.eq.{{ $json.id }}",
     "data": {
       "status": "published",
       "published_at": "{{ new Date().toISOString() }}"
     }
   }
   ```

6. **HTTP Request - Invalidate ISR Cache**
   ```json
   {
     "method": "POST",
     "url": "https://your-site.vercel.app/api/revalidate",
     "body": {
       "secret": "YOUR_REVALIDATE_SECRET",
       "path": "/articles/{{ $json.slug }}"
     }
   }
   ```

7. **HTTP Request - Revalidate Homepage**
   ```json
   {
     "method": "POST",
     "url": "https://your-site.vercel.app/api/revalidate",
     "body": {
       "secret": "YOUR_REVALIDATE_SECRET",
       "path": "/"
     }
   }
   ```

### 3. Social Media Distribution Workflow

**Workflow Name**: `hse-social-distribution`

**Trigger**: Webhook (called after article is published)

**Nodes**:

1. **Webhook Trigger**
   - Path: `/webhook/article-published`

2. **Code - Format for Social**
   ```javascript
   const article = $input.item.json;
   const url = `https://your-site.com/articles/${article.slug}`;

   return {
     json: {
       linkedin: {
         text: `${article.title}\n\n${article.excerpt}\n\n#HealthAndSafety #SafetyFirst #UKHSE\n\n${url}`
       },
       twitter: {
         text: `${article.title.substring(0, 200)}...\n\n${url}\n\n#HealthSafety #HSE`
       }
     }
   };
   ```

3. **LinkedIn - Post**
   ```json
   {
     "method": "POST",
     "url": "https://api.linkedin.com/v2/shares",
     "authentication": "OAuth2",
     "body": {
       "content": {
         "contentEntities": [
           {
             "entityLocation": "{{ $json.url }}"
           }
         ],
         "title": "{{ $json.title }}"
       },
       "text": {
         "text": "{{ $json.linkedin.text }}"
       }
     }
   }
   ```

4. **Twitter - Post**
   ```json
   {
     "method": "POST",
     "url": "https://api.twitter.com/2/tweets",
     "authentication": "OAuth2",
     "body": {
       "text": "{{ $json.twitter.text }}"
     }
   }
   ```

5. **Supabase - Log Social Post**
   ```json
   {
     "operation": "insert",
     "table": "social_posts",
     "data": {
       "article_id": "={{ $('Webhook Trigger').item.json.id }}",
       "platform": "linkedin",
       "post_id": "={{ $json.id }}",
       "post_url": "={{ $json.shareUrl }}"
     }
   }
   ```

## API Endpoints for n8n Integration

### 1. Webhook Endpoint for Article Publishing

Create this file: `src/app/api/webhook/article-published/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const headersList = headers()
  const secret = headersList.get('x-webhook-secret')

  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { article_id, slug } = body

  // Trigger social media distribution via n8n
  try {
    await fetch(process.env.N8N_SOCIAL_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    console.error('Failed to trigger social distribution:', error)
  }

  return NextResponse.json({ success: true })
}

export const runtime = 'edge'
```

### 2. Cache Revalidation Endpoint

Create this file: `src/app/api/revalidate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { secret, path } = body

  // Verify secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Revalidate the path
  revalidatePath(path)

  return NextResponse.json({ revalidated: true, path, now: Date.now() })
}

export const runtime = 'edge'
```

## Environment Variables for n8n Integration

Add these to your `.env.local`:

```env
# n8n Integration
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=https://n8n.srv1246730.hstgr.cloud/webhook/
N8N_SOCIAL_WEBHOOK_URL=https://n8n.srv1246730.hstgr.cloud/webhook/article-published

# Webhook Security
WEBHOOK_SECRET=generate_random_string_here
REVALIDATE_SECRET=generate_another_random_string

# OneSignal (Push Notifications)
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key

# Social Media APIs
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
TWITTER_API_KEY=your_twitter_key
TWITTER_API_SECRET=your_twitter_secret
```

## Testing n8n Workflows

### 1. Test Content Aggregation

```bash
# Manually trigger the workflow via n8n API
curl -X POST \
  https://n8n.srv1246730.hstgr.cloud/api/v1/workflows/{workflow_id}/activate \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### 2. Test Auto-Publisher

```bash
# Insert a test article with scheduled time in the past
curl -X POST \
  https://your-supabase-url/rest/v1/articles \
  -H 'apikey: YOUR_SUPABASE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Article",
    "slug": "test-article",
    "content": "# Test Content",
    "excerpt": "Test excerpt",
    "category": "workplace-safety",
    "tags": ["test"],
    "status": "approved",
    "scheduled_publish_time": "2024-01-01T00:00:00Z",
    "reading_time": 5
  }'
```

### 3. Monitor Workflow Executions

In your n8n dashboard:
1. Go to **Executions** tab
2. Filter by workflow name
3. Check success/failure rates
4. View detailed logs for debugging

## Monitoring & Error Handling

### n8n Error Workflow

Create a separate workflow that catches errors:

**Workflow Name**: `hse-error-handler`

**Trigger**: Webhook from failed workflows

**Nodes**:

1. **Webhook Trigger**
2. **Supabase - Log Error**
   ```json
   {
     "operation": "insert",
     "table": "error_logs",
     "data": {
       "workflow_name": "={{ $json.workflowName }}",
       "error_message": "={{ $json.error }}",
       "error_stack": "={{ $json.stack }}",
       "context": "={{ $json }}"
     }
   }
   ```
3. **Send Email Alert** (optional)

### Dashboard Monitoring

Create a simple monitoring dashboard by querying Supabase:

```sql
-- Recent errors
SELECT workflow_name, COUNT(*) as error_count, MAX(created_at) as last_error
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY workflow_name;

-- Articles pending review
SELECT COUNT(*) as pending_count,
       SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) as high_priority
FROM articles
WHERE status = 'pending_review';

-- Publishing statistics
SELECT DATE(published_at) as date, COUNT(*) as articles_published
FROM articles
WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(published_at)
ORDER BY date DESC;
```

## Best Practices

1. **Rate Limiting**: Add delays between HTTP requests to external sources
2. **Error Handling**: Use Try-Catch nodes for all API calls
3. **Logging**: Log all important steps to Supabase for debugging
4. **Testing**: Test workflows in development before activating in production
5. **Monitoring**: Set up alerts for failed executions
6. **Backups**: Export workflow JSON files regularly
7. **Documentation**: Document any custom code nodes
8. **Security**: Never hardcode API keys - use n8n credentials

## Troubleshooting

### Common Issues

**Issue**: Articles not appearing on website after publishing
- **Solution**: Check ISR revalidation endpoint, verify REVALIDATE_SECRET

**Issue**: Duplicate articles being created
- **Solution**: Verify deduplication logic in step 4 of aggregation workflow

**Issue**: Claude API rate limits
- **Solution**: Add delay nodes between API calls, reduce batch size

**Issue**: Social media posts failing
- **Solution**: Check OAuth tokens haven't expired, verify API quotas

## Next Steps

1. Set up your n8n workflows using the templates above
2. Configure credentials for external services
3. Test each workflow individually
4. Monitor executions for 24 hours
5. Adjust schedules based on content volume
6. Set up error notifications
7. Document any custom modifications

---

For questions or issues with n8n integration, refer to:
- [n8n Documentation](https://docs.n8n.io)
- [Supabase API Docs](https://supabase.com/docs/reference/javascript)
- [Next.js Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
