# 🚀 Complete n8n Automation Setup Guide

Your HSE News platform automation system is ready to deploy! Follow this guide to import and configure all 7 workflows.

---

## 📋 Quick Summary

You have **7 workflow files** ready to import:
1. `1-content-aggregation-engine.json` - Scrapes 5 HSE news sources every 6 hours
2. `2-ai-processing-pipeline.json` - Rewrites articles with Claude AI
3. `3-smart-publisher.json` - Publishes articles on schedule (hourly)
4. `4-social-media-distributor.json` - Posts to LinkedIn, Twitter, Facebook
5. `5-newsletter-compiler.json` - Weekly newsletter (Sundays 8 AM)
6. `6-analytics-monitor.json` - Daily analytics report (9 AM)
7. `7-error-handler.json` - Global error handling and retry

**Expected Result**: 3-5 articles published daily, fully automated! 🎉

---

## 🔧 Step 1: Import Workflows via n8n UI

Since the API import has strict validation, use the n8n web interface:

### Method 1: Import Each Workflow

1. **Go to n8n**: https://n8n.srv1246730.hstgr.cloud
2. **Login** with your credentials
3. Click **Workflows** in the sidebar
4. Click the **"+"** button (Create New Workflow)
5. Click the **three dots** menu (⋮) in the top-right
6. Select **Import from File**
7. Select the workflow JSON file from `n8n-workflows/` folder
8. Click **Import**
9. **Repeat** for all 7 workflows

### Method 2: Copy-Paste (Alternative)

1. Open each JSON file in a text editor
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. In n8n, create a new workflow
4. Click the three dots menu → **Import from URL or File**
5. Paste the JSON content
6. Click **Import**

---

## 🔑 Step 2: Configure Credentials

For each workflow, you'll need to set up these credentials:

### A. Supabase (Required for all workflows)

**Create Credential:**
1. In n8n, go to **Credentials** → **Add Credential**
2. Search for "HTTP Request" or "Generic Credential Type"
3. Choose **Header Auth**
4. Configure:
   ```
   Name: apikey
   Value: sb_publishable_oe3mKyjPKWvk1IaywLQtgQ_ZX6FOQZm
   ```

**Alternative (if Supabase node available):**
```
Host: https://hsownlzxiqhnstvaftqm.supabase.co
Service Role Key: sb_secret_dL6B4m5AVmp_JNf-fI_tpg_Irv-iVsC
```

### B. Anthropic API (Claude - Required for AI Processing)

1. Get API key from: https://console.anthropic.com/settings/keys
2. In n8n: **Credentials** → **Add Credential**
3. Search for "HTTP Request"
4. Configure:
   ```
   Authentication: Header Auth
   Name: x-api-key
   Value: sk-ant-api03-[YOUR_KEY_HERE]
   ```

### C. Webhook Secret (For inter-workflow communication)

1. **Credentials** → **Header Auth**
2. Configure:
   ```
   Name: x-webhook-secret
   Value: hse-news-webhook-secret-2026
   ```

### D. Social Media (Optional but recommended)

**LinkedIn OAuth2:**
- Get credentials from: https://www.linkedin.com/developers/apps
- In n8n: **Credentials** → **LinkedIn OAuth2 API**

**Twitter/X OAuth:**
- Get credentials from: https://developer.twitter.com/en/portal/dashboard
- In n8n: **Credentials** → **Twitter OAuth2 API**

**Facebook Graph API:**
- Get token from: https://developers.facebook.com/tools/explorer
- In n8n: **Credentials** → **HTTP Request** with Bearer token

### E. Email (SMTP - For newsletters and alerts)

1. **Credentials** → **SMTP**
2. Configure:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: [App-specific password]
   Secure: TLS
   ```

---

## 🔧 Step 3: Update Each Workflow

Open each imported workflow and update these nodes:

### Workflow 1: Content Aggregation Engine
- **Supabase nodes**: Select your Supabase credential
- **Webhook nodes**: Set webhook URL pattern

### Workflow 2: AI Processing Pipeline
- **HTTP Request (Claude)**: Select Anthropic credential
- **Supabase nodes**: Select Supabase credential
- **Unsplash node**: Add Unsplash Access Key (optional)

### Workflow 3: Smart Publisher
- **Supabase nodes**: Select Supabase credential
- **HTTP Request (Revalidate)**: Add revalidate secret header

### Workflow 4: Social Media Distributor
- **LinkedIn node**: Select LinkedIn OAuth2 credential
- **Twitter node**: Select Twitter OAuth credential
- **Facebook node**: Select Facebook credential

### Workflow 5: Newsletter Compiler
- **Supabase nodes**: Select Supabase credential
- **Send Email node**: Select SMTP credential

### Workflow 6: Analytics Monitor
- **Supabase nodes**: Select Supabase credential
- **Send Email node**: Select SMTP credential
- **Update admin email**: Change recipient to your email

### Workflow 7: Error Handler
- **Send Email node**: Select SMTP credential
- **Update admin email**: Change recipient to your email

---

## ✅ Step 4: Test Workflows

Test in this order to ensure everything works:

### Test 1: Content Aggregation (Workflow 1)
```
1. Open "1. Content Aggregation Engine"
2. Click "Execute Workflow" (play button)
3. Check execution log - should see articles fetched
4. Verify in Supabase:
   SELECT * FROM articles_queue LIMIT 10;
```

**Expected**: 20-40 articles added to `articles_queue`

### Test 2: AI Processing (Workflow 2)
```
1. Get a queue item ID from Supabase:
   SELECT id FROM articles_queue WHERE status = 'pending_ai_processing' LIMIT 1;

2. Open "2. AI Processing Pipeline"
3. In the webhook trigger node, note the webhook URL
4. Test with curl (replace QUEUE_ID):
   curl -X POST https://n8n.srv1246730.hstgr.cloud/webhook/ai-processing \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: hse-news-webhook-secret-2026" \
     -d '{"queue_id":"YOUR_QUEUE_ID_HERE"}'

5. Check Supabase:
   SELECT * FROM articles WHERE ai_generated = true LIMIT 5;
```

**Expected**: Article rewritten and added to `articles` table with `pending_review` status

### Test 3: Smart Publisher (Workflow 3)
```
1. In Supabase, manually schedule an article:
   UPDATE articles
   SET scheduled_publish_time = NOW(),
       status = 'pending_review'
   WHERE id = (SELECT id FROM articles LIMIT 1);

2. Open "3. Smart Publisher"
3. Click "Execute Workflow"
4. Check if article status changed to 'published'
```

**Expected**: Article published and status updated

### Test 4-7: Other Workflows
- **Social Media**: Trigger when an article is published
- **Newsletter**: Run manually on Sunday or change schedule
- **Analytics**: Run manually to test email report
- **Error Handler**: Automatically catches errors from other workflows

---

## 🚀 Step 5: Activate Workflows

Once all tests pass:

1. ✅ Activate **7. Error Handler** first (catches errors from others)
2. ✅ Activate **1. Content Aggregation Engine**
3. ✅ Activate **2. AI Processing Pipeline**
4. ✅ Activate **3. Smart Publisher**
5. ✅ Activate **4. Social Media Distributor**
6. ✅ Activate **6. Analytics Monitor**
7. ✅ Activate **5. Newsletter Compiler**

**How to Activate:**
- Open the workflow
- Toggle the switch in the top-right to **Active** (green)
- Verify in **Executions** tab that it runs on schedule

---

## 📊 Monitor & Verify

### Daily Checks (via email)
- **9 AM**: Analytics report email
- Check: 3-5 articles published, no critical errors

### Weekly Checks
- **Sunday 8 AM**: Newsletter sent to all subscribers
- Review social media engagement

### Database Queries
```sql
-- Today's published articles
SELECT title, published_at, quality_score
FROM articles
WHERE status = 'published'
  AND DATE(published_at) = CURRENT_DATE
ORDER BY published_at DESC;

-- Queue health
SELECT status, COUNT(*) as count
FROM articles_queue
GROUP BY status;

-- Social media posts
SELECT platform, COUNT(*) as posts
FROM social_media_posts
WHERE DATE(posted_at) = CURRENT_DATE
GROUP BY platform;
```

---

## 🎯 Expected Results (When Fully Active)

**Daily Output:**
- 📰 20-40 articles scraped
- 🤖 15-25 articles AI-processed
- ✅ 3-5 articles published
- 📱 9-15 social media posts (3 per article)
- 📊 1 analytics email

**Weekly:**
- 📧 1 newsletter to all subscribers (Sunday)

**Monthly:**
- 📈 ~100 published articles
- 📊 Performance trends
- 🎯 Growing audience

---

## 🆘 Troubleshooting

### Workflows Not Running
- Check they're **Active** (green toggle)
- Verify schedule trigger configuration
- Check n8n execution logs

### No Articles Being Published
- Check `scheduled_publish_time` is set for articles
- Verify quota limits (5/day, 3/3-hours)
- Check business hours filter (7 AM - 7 PM UK)

### Claude API Errors
- Verify API key is valid
- Check Anthropic account credits
- Review rate limits

### Social Media Not Posting
- Check OAuth tokens not expired
- Verify app permissions
- Test API connection manually

---

## 📞 Need Help?

1. Check n8n execution logs for detailed errors
2. Review error emails from Error Handler workflow
3. Query `error_logs` table in Supabase
4. Check n8n community: https://community.n8n.io

---

**Your automation system is ready! Once activated, your HSE News platform will publish 3-5 high-quality articles daily with ZERO manual effort!** 🎉

---

## 📝 Next Steps After Setup

1. Monitor for 48 hours to ensure stability
2. Adjust AI prompts if needed (Workflow 2)
3. Fine-tune publishing schedule (Workflow 3)
4. Customize social media posts (Workflow 4)
5. Build up content library
6. Deploy website to production (Vercel)
7. Point custom domain
8. Launch! 🚀
