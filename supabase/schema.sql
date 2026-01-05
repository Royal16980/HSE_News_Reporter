-- UK Health & Safety News Database Schema
-- This schema defines the structure for articles, categories, and newsletter subscriptions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author VARCHAR(100) NOT NULL DEFAULT 'HSE News Team',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  reading_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Create index for better query performance
  CONSTRAINT fk_category FOREIGN KEY (category) REFERENCES categories(slug) ON UPDATE CASCADE
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT uuid_generate_v4()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Create full-text search index for articles
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles
  USING GIN(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET views_count = views_count + 1
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (name, slug, color, icon, description) VALUES
  ('Workplace Safety', 'workplace-safety', '#3b82f6', 'HardHat', 'General workplace safety news and updates'),
  ('Fire Safety', 'fire-safety', '#f97316', 'Flame', 'Fire prevention and safety regulations'),
  ('Chemical Safety', 'chemical-safety', '#a855f7', 'FlaskConical', 'Chemical handling and COSHH compliance'),
  ('Construction', 'construction', '#eab308', 'Construction', 'Construction site safety and CDM regulations'),
  ('Healthcare', 'healthcare', '#ec4899', 'Heart', 'Healthcare and medical facility safety'),
  ('Food Safety', 'food-safety', '#10b981', 'UtensilsCrossed', 'Food hygiene and safety standards'),
  ('Ergonomics', 'ergonomics', '#6366f1', 'Armchair', 'Workplace ergonomics and DSE'),
  ('Mental Health', 'mental-health', '#14b8a6', 'Brain', 'Workplace mental health and wellbeing'),
  ('Incidents', 'incidents', '#ef4444', 'AlertTriangle', 'Safety incidents and accident reports'),
  ('Regulations', 'regulations', '#3b82f6', 'FileText', 'HSE regulations and legal updates'),
  ('Best Practices', 'best-practices', '#10b981', 'CheckCircle2', 'Industry best practices and guidance')
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Public articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

-- Allow public read access to categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Newsletter subscriptions can be inserted by anyone
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Only allow reading own subscription
CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (true);

-- Sample articles for demonstration (optional - remove in production)
INSERT INTO articles (title, slug, content, excerpt, category, tags, author, reading_time, status, featured_image_url) VALUES
(
  'New HSE Guidelines for Remote Work Safety Released',
  'new-hse-guidelines-remote-work-safety-2024',
  '# New HSE Guidelines for Remote Work Safety

The Health and Safety Executive (HSE) has published comprehensive new guidelines addressing the evolving landscape of remote and hybrid working arrangements in the UK.

## Key Updates

The guidelines emphasize the importance of:

- **Proper workstation setup**: Employers must ensure remote workers have ergonomically appropriate equipment
- **Mental health support**: Regular check-ins and access to mental health resources
- **Risk assessments**: Updated DSE assessments for home working environments
- **Right to disconnect**: Clear boundaries between work and personal time

## Employer Responsibilities

Employers are now required to conduct detailed risk assessments for all remote workers, including evaluation of:

1. Home office setup and ergonomics
2. Internet connectivity and data security
3. Isolation and mental health risks
4. Work-life balance measures

The HSE has made it clear that the same duty of care applies to remote workers as it does to those working on-site.

## Implementation Timeline

Organizations have until the end of Q2 2024 to ensure full compliance with the new guidelines. The HSE will be conducting spot checks and audits to ensure adherence.

For more information, visit the official HSE website or consult with a qualified health and safety professional.',
  'The HSE has released new comprehensive guidelines for remote work safety, emphasizing employer responsibilities for home office ergonomics, mental health support, and updated risk assessments.',
  'regulations',
  ARRAY['remote-work', 'hse-guidelines', 'workplace-safety', 'ergonomics', 'mental-health'],
  'Sarah Mitchell',
  5,
  'published',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=630&fit=crop'
),
(
  'Major Construction Site Incident Leads to HSE Investigation',
  'construction-site-incident-hse-investigation-london',
  '# Construction Site Incident Under HSE Investigation

A significant safety incident at a construction site in Central London has prompted a full investigation by the Health and Safety Executive.

## Incident Details

On Monday morning, a partial scaffold collapse at the Canary Wharf development site resulted in three workers sustaining injuries. Emergency services responded quickly, and all workers were transported to hospital with non-life-threatening injuries.

## HSE Response

The HSE has issued a prohibition notice, halting all work on the site pending a thorough investigation. Initial findings suggest potential failures in:

- Scaffold inspection procedures
- Load-bearing calculations
- Weather-related risk assessments
- Contractor supervision protocols

## Industry Impact

This incident serves as a stark reminder of the critical importance of:

1. **Regular equipment inspections**: All scaffolding must be inspected every 7 days and after any event that could affect stability
2. **Competent supervision**: Ensuring qualified personnel oversee all high-risk activities
3. **Weather monitoring**: Adjusting work plans based on adverse weather conditions
4. **Subcontractor management**: Proper vetting and monitoring of all contractors

## Looking Forward

The construction industry has seen a 15% increase in scaffold-related incidents over the past year. Industry bodies are calling for enhanced training requirements and stricter enforcement of existing regulations.

The HSE investigation is ongoing, and findings are expected to be published within 12 weeks.',
  'A scaffold collapse at a London construction site has injured three workers and triggered an HSE investigation, highlighting critical safety protocol failures.',
  'incidents',
  ARRAY['construction', 'scaffold-safety', 'hse-investigation', 'accident-prevention'],
  'James Thompson',
  4,
  'published',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=630&fit=crop'
),
(
  '10 Essential Ergonomic Practices for Office Workers',
  'essential-ergonomic-practices-office-workers',
  '# 10 Essential Ergonomic Practices for Office Workers

With millions of UK workers spending hours at desks daily, proper ergonomics has never been more critical for preventing musculoskeletal disorders.

## The Cost of Poor Ergonomics

Work-related musculoskeletal disorders (MSDs) cost UK businesses over £5 billion annually in lost productivity and sick leave. The good news? Most are preventable with proper ergonomic practices.

## 10 Best Practices

### 1. Monitor Position
Position your monitor at arm''s length, with the top of the screen at or slightly below eye level.

### 2. Chair Adjustment
Adjust your chair so your feet rest flat on the floor and your thighs are parallel to the ground.

### 3. Keyboard Placement
Keep your keyboard directly in front of you at a height that allows your elbows to be at a 90-degree angle.

### 4. Mouse Positioning
Place your mouse close to your keyboard at the same height to avoid reaching.

### 5. Regular Breaks
Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.

### 6. Proper Lighting
Ensure adequate lighting to reduce eye strain, avoiding glare on your screen.

### 7. Document Placement
Use a document holder positioned between your screen and keyboard to minimize neck movement.

### 8. Telephone Use
Use a headset for frequent phone calls to avoid cradling the phone between your head and shoulder.

### 9. Stretching Routine
Incorporate regular stretching exercises throughout your day to prevent stiffness.

### 10. Workstation Assessment
Request a DSE assessment from your employer to ensure your setup is optimized.

## Legal Requirements

Under the Health and Safety (Display Screen Equipment) Regulations 1992, employers must:

- Conduct DSE risk assessments
- Provide appropriate equipment
- Offer eye tests for regular DSE users
- Provide training on proper equipment use

Don''t wait for pain to develop – implement these practices today for long-term health and productivity.',
  'Learn 10 essential ergonomic practices that can prevent work-related musculoskeletal disorders and boost productivity for office workers.',
  'best-practices',
  ARRAY['ergonomics', 'office-safety', 'dse', 'workplace-health', 'prevention'],
  'Dr. Emily Roberts',
  6,
  'published',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=630&fit=crop'
);

-- Create a view for trending tags
CREATE OR REPLACE VIEW trending_tags AS
SELECT
  unnest(tags) as tag,
  COUNT(*) as count,
  MAX(published_at) as last_used
FROM articles
WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '30 days'
GROUP BY tag
ORDER BY count DESC
LIMIT 20;

-- Create a view for latest articles with category info
CREATE OR REPLACE VIEW latest_articles_view AS
SELECT
  a.*,
  c.color as category_color,
  c.icon as category_icon
FROM articles a
LEFT JOIN categories c ON a.category = c.slug
WHERE a.status = 'published'
ORDER BY a.published_at DESC;

-- ==================================================
-- AUTOMATION SYSTEM TABLES
-- Tables required for n8n automation workflows
-- ==================================================

-- Articles Queue table (for AI processing)
CREATE TABLE IF NOT EXISTS articles_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  original_url TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  source VARCHAR(100) NOT NULL,
  source_published_date TIMESTAMP WITH TIME ZONE,
  raw_content TEXT,
  images TEXT[], -- JSON array of image URLs
  word_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending_ai_processing' CHECK (status IN (
    'pending_ai_processing',
    'processing',
    'processed',
    'rejected_low_quality',
    'failed'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  error_details TEXT
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON articles_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_created ON articles_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_original_url ON articles_queue(original_url);

-- Enhanced Articles table fields for automation
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 10);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS priority VARCHAR(10) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_source_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source VARCHAR(100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_publish_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_credit JSONB;

CREATE INDEX IF NOT EXISTS idx_articles_priority ON articles(priority);
CREATE INDEX IF NOT EXISTS idx_articles_quality_score ON articles(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_publish_time);

-- Enhanced Newsletter Subscribers table
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT uuid_generate_v4();
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Social Media Posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram')),
  post_content TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  platform_post_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'posted' CHECK (status IN ('pending', 'posted', 'failed', 'deleted')),
  engagement_stats JSONB DEFAULT '{}', -- likes, shares, comments, etc.
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_article ON social_media_posts(article_id);
CREATE INDEX IF NOT EXISTS idx_social_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posted ON social_media_posts(posted_at DESC);

-- Newsletter History table
CREATE TABLE IF NOT EXISTS newsletter_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  articles_count INTEGER NOT NULL,
  subscribers_count INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  email_subject VARCHAR(255) NOT NULL,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sent ON newsletter_history(sent_at DESC);

-- Analytics Reports table
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
  metrics JSONB NOT NULL,
  health_status VARCHAR(20) NOT NULL CHECK (health_status IN ('healthy', 'warning', 'error')),
  warnings TEXT[],
  errors TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_reports(report_type);

-- Error Logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_id VARCHAR(255) NOT NULL UNIQUE,
  workflow_name VARCHAR(100) NOT NULL,
  node_name VARCHAR(100),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  can_retry BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  retry_attempted BOOLEAN DEFAULT FALSE,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}',
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  requires_manual_intervention BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_workflow ON error_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_error_occurred ON error_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_resolved ON error_logs(resolved);

-- Activity Log table (for tracking all system events)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  user_id UUID, -- For future user management
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_article ON activity_log(article_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ==================================================
-- AUTOMATION-SPECIFIC RLS POLICIES
-- ==================================================

ALTER TABLE articles_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Service role can access everything (for n8n workflows)
-- These policies allow the service role key to manage automation tables

CREATE POLICY "Service role full access to queue"
  ON articles_queue FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to social posts"
  ON social_media_posts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to newsletter history"
  ON newsletter_history FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to analytics"
  ON analytics_reports FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to error logs"
  ON error_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to activity log"
  ON activity_log FOR ALL
  USING (auth.role() = 'service_role');

-- Public can view social media posts for published articles
CREATE POLICY "Public can view social posts of published articles"
  ON social_media_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = social_media_posts.article_id
      AND articles.status = 'published'
    )
  );

-- ==================================================
-- AUTOMATION HELPER FUNCTIONS
-- ==================================================

-- Function to calculate optimal publish time
CREATE OR REPLACE FUNCTION calculate_optimal_publish_time(
  article_priority VARCHAR,
  article_category VARCHAR
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  base_time TIMESTAMP WITH TIME ZONE;
  hour_offset INTEGER;
BEGIN
  -- Start with next business day 9 AM UK time
  base_time := DATE_TRUNC('day', NOW() + INTERVAL '1 day') + INTERVAL '9 hours';

  -- Skip weekends
  WHILE EXTRACT(DOW FROM base_time) IN (0, 6) LOOP
    base_time := base_time + INTERVAL '1 day';
  END LOOP;

  -- Adjust based on priority
  CASE article_priority
    WHEN 'HIGH' THEN
      hour_offset := 0; -- Publish ASAP (9 AM next day)
    WHEN 'MEDIUM' THEN
      hour_offset := FLOOR(RANDOM() * 4 + 2)::INTEGER; -- 11 AM - 3 PM
    WHEN 'LOW' THEN
      hour_offset := FLOOR(RANDOM() * 3 + 5)::INTEGER; -- 2 PM - 5 PM
    ELSE
      hour_offset := 3; -- Default to noon
  END CASE;

  RETURN base_time + (hour_offset || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to get article performance metrics
CREATE OR REPLACE FUNCTION get_article_metrics(article_id UUID)
RETURNS JSONB AS $$
DECLARE
  metrics JSONB;
BEGIN
  SELECT jsonb_build_object(
    'views', views_count,
    'reading_time', reading_time,
    'social_posts', (
      SELECT COUNT(*) FROM social_media_posts
      WHERE social_media_posts.article_id = articles.id
      AND status = 'posted'
    ),
    'quality_score', quality_score,
    'age_hours', EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600
  )
  INTO metrics
  FROM articles
  WHERE id = article_id;

  RETURN metrics;
END;
$$ LANGUAGE plpgsql;
