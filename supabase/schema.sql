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
