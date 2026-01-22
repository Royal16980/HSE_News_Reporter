# n8n Workflows Guide

## Overview
This guide covers the 7 automated workflows that power HSE News.

## Workflow List
1. Content Aggregation Engine (`mXlxtZkd83aCDpps`)
2. AI Processing Pipeline (`fUdZM9bkWrBXxSOR`)
3. Smart Publisher (`4ZlT2WywMfKFVBzM`)
4. Social Media Distribution (`pLw2wJYng2hb1Bqq`)
5. Newsletter Compiler (`UvKgpMPZmlKIUvJr`)
6. Analytics Monitor (`uM1D5Njot53Sux47`)
7. Error Handler (`7Ww7AY08s2pzsGd5`)

## Activation Order
1. Error Handler
2. Content Aggregation
3. AI Processing
4. Smart Publisher
5. Social Media
6. Newsletter
7. Analytics

## Webhooks
- AI Processing: `POST /webhook/ai-processing`
- Social Distribution: `POST /webhook/article-published`

## Required Credentials
- Supabase (service role)
- Anthropic (Claude)
- LinkedIn OAuth2
- Twitter OAuth2
- SMTP

## Operational Notes
- Smart Publisher respects daily and 3-hour quotas.
- Error Handler sends alerts for high/critical issues.
- Newsletter runs weekly on Friday at 10 AM UK time.
