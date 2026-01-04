# n8n Workflow Templates

This folder contains n8n workflow templates for automating the UK Health & Safety News platform.

## Available Workflows

### 1. HSE Content Aggregator (`hse-content-aggregator.json`)

**Purpose**: Automatically fetch, process, and store health & safety news articles

**Schedule**: Runs every 6 hours

**Process**:
1. Fetches articles from HSE press releases
2. Checks for duplicates in Supabase
3. Rewrites content using Claude AI
4. Calculates reading time and generates slug
5. Inserts article with `pending_review` status
6. Sends alert for high-priority articles

**Required Credentials**:
- Supabase API (for database operations)
- Anthropic API (for Claude AI)

## How to Import

### Method 1: Import via n8n UI

1. Open your n8n instance: https://n8n.srv1246730.hstgr.cloud
2. Click on **Workflows** in the sidebar
3. Click **Import from File**
4. Select the workflow JSON file
5. Click **Import**

### Method 2: Import via n8n API

```bash
curl -X POST \
  https://n8n.srv1246730.hstgr.cloud/api/v1/workflows \
  -H 'Authorization: Bearer YOUR_N8N_API_KEY' \
  -H 'Content-Type: application/json' \
  -d @hse-content-aggregator.json
```

## Configuration Steps

After importing, you need to configure:

### 1. Set Up Credentials

**Supabase**:
1. Go to **Credentials** > **Add Credential**
2. Search for "Supabase"
3. Enter:
   - **Host**: Your Supabase project URL
   - **Service Role Secret**: From Supabase dashboard

**Anthropic (Claude AI)**:
1. Go to **Credentials** > **Add Credential**
2. Search for "Anthropic"
3. Enter:
   - **API Key**: From Anthropic console

### 2. Update Credential IDs

Open each workflow and update these placeholders:
- `YOUR_SUPABASE_CREDENTIAL_ID` → Your actual Supabase credential ID
- `YOUR_ANTHROPIC_CREDENTIAL_ID` → Your actual Anthropic credential ID

### 3. Configure Environment Variables

Set these in your n8n environment or workflow settings:
- `NEXT_PUBLIC_SITE_URL`: Your website URL
- `WEBHOOK_SECRET`: Secret for webhook authentication

### 4. Test the Workflow

1. Click **Test workflow** in the n8n editor
2. Click **Execute Workflow** manually
3. Check the execution log for any errors
4. Verify data appears in Supabase

### 5. Activate the Workflow

1. Click the toggle switch to **Active**
2. The workflow will now run on schedule

## Customization

### Change Schedule

Edit the "Every 6 Hours" node:
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 6  // Change this value
      }
    ]
  }
}
```

### Add More Sources

Duplicate the "Fetch HSE Press Releases" node and update the URL:
```json
{
  "url": "https://your-news-source.com/feed"
}
```

### Modify Claude AI Prompt

Edit the "Claude AI Rewrite" node to change how articles are processed:
```json
{
  "prompt": "Your custom instructions here..."
}
```

## Monitoring

### View Executions

1. Go to **Executions** tab
2. Filter by workflow name
3. Click on any execution to see details

### Check for Errors

```sql
-- In Supabase SQL Editor
SELECT * FROM error_logs
WHERE workflow_name = 'HSE Content Aggregator'
ORDER BY created_at DESC
LIMIT 10;
```

### Monitor Article Queue

```sql
-- Check pending articles
SELECT status, priority, COUNT(*) as count
FROM articles
WHERE status = 'pending_review'
GROUP BY status, priority;
```

## Troubleshooting

### "Credential not found"
- Make sure you've set up credentials in n8n
- Update the credential IDs in the workflow

### "Supabase connection failed"
- Check your Supabase URL and service role key
- Verify RLS policies allow inserts

### "Claude API error"
- Check your Anthropic API key is valid
- Verify you have sufficient credits
- Check rate limits

### "No articles being created"
- Test the HTML parsing manually
- Check the source website structure hasn't changed
- Verify the deduplication logic

## Best Practices

1. **Start with Manual Tests**: Always test manually before activating
2. **Monitor First 24 Hours**: Watch executions closely after activation
3. **Set Up Alerts**: Configure error notifications
4. **Regular Backups**: Export workflows monthly
5. **Version Control**: Keep workflow JSON files in git

## Support

For help with n8n workflows:
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)
- [Project Documentation](../docs/N8N_INTEGRATION.md)

## Changelog

### v1.0.0 (2025-01-04)
- Initial workflow templates
- HSE Content Aggregator workflow
- Basic error handling
- Claude AI integration
