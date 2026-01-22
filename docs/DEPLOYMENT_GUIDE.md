# Deployment Guide

## Pre-Deployment Checklist
- Configure environment variables for the public site and admin PWA.
- Ensure Supabase schema and seed data are applied.
- Import all n8n workflows and set credentials.

## Public Website (Next.js)
1. Deploy with Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`.
3. Verify homepage and article pages.

## Admin PWA
1. Deploy `admin-pwa` with Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Verify login, review queue, analytics, and schedule.

## n8n
1. Import workflows from `n8n-workflows/IMPROVED`.
2. Configure credentials.
3. Activate workflows in the required order.

## Verification
- Confirm Workflow 1 creates queue items.
- Confirm Workflow 2 processes queue items.
- Confirm Workflow 3 publishes and triggers revalidation.
- Confirm Workflow 4 logs social posts.
