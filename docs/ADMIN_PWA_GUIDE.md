# Admin PWA Guide

## Overview
The Admin PWA is the mobile-first moderation console for HSE News. It supports offline review, swipe actions, scheduling, analytics, and settings.

## Login
1. Open the Admin PWA URL.
2. Enter your email for a magic link.
3. Open the magic link on the same device to authenticate.

## Review Queue
- Swipe right to approve.
- Swipe left to reject.
- Swipe down to snooze (24 hours).
- Swipe up to open the preview.
- Pull down to refresh the queue.
- Offline actions are queued and synced when back online.

## Schedule
- Week view runs Monday through Sunday.
- Tap an item to view details.
- Use the refresh button or pull down to update.

## Analytics
- Pull down to refresh.
- Metrics and charts reflect live Supabase data.
- Errors surface inline with a retry option.

## Settings
- Profile shows your email and role.
- Notification toggles persist locally.
- Appearance settings control theme and OLED mode.
- Workflow settings manage auto-publish and quotas.
- Sign out clears the session and returns to login.

## Offline Mode
The app works offline for review actions. When connectivity returns, queued actions sync automatically.

## Support
If the PWA fails to load, clear cache in Settings and retry.
