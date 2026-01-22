# API Reference

## Admin PWA API
Location: `admin-pwa/src/lib/api`

### Articles
- `fetchPendingArticles()`
- `fetchQueuedArticles()`
- `approveArticle(id, userId)`
- `rejectArticle(id, reason?)`
- `snoozeArticle(id, snoozeUntil?)`
- `updateArticle(id, data)`
- `deleteArticle(id)`
- `batchUpdateArticles(ids, updates)`
- `searchArticles(query)`
- `getArticleStats()`
- `subscribeToArticles(callback)`

### Schedule
- `fetchScheduledArticles(startDate, endDate)`
- `fetchArticlesForDay(date)`
- `fetchWeekSchedule()`
- `scheduleArticle(id, publishTime)`
- `rescheduleArticle(id, newPublishTime)`
- `unscheduleArticle(id)`
- `suggestPublishTime(category, priority)`
- `checkSchedulingConflicts(publishTime, windowMinutes?)`
- `batchScheduleArticles(schedules)`
- `getScheduleStats()`
- `autoScheduleApprovedArticles()`

### Analytics
- `fetchAnalyticsOverview()`
- `fetchViewsData()`
- `fetchCategoryPerformance()`
- `fetchTopArticles(limit?)`
- `fetchPublishingFrequency(days?)`
- `fetchWorkflowMetrics()`
- `fetchQualityScores()`
- `generateWeeklyReport()`
