# Troubleshooting

## Workflows Not Triggering
- Confirm the workflow is active in n8n.
- Validate cron expressions and server time zone.
- Inspect n8n executions for errors.

## Supabase Errors
- Verify Supabase credentials (service role for server workflows).
- Ensure RLS policies allow required access.
- Check table schemas match workflow fields.

## AI Processing Failures
- Confirm Anthropic API key and model availability.
- Check for rate limit responses in error logs.
- Inspect malformed source content.

## Social Posts Missing
- Confirm webhook delivery from Smart Publisher.
- Verify LinkedIn/Twitter credentials.
- Check `social_media_posts` table entries.

## Newsletter Issues
- Validate SMTP credentials and sender address.
- Confirm subscriber list has active, verified records.
- Check `newsletter_history` entries for send errors.
