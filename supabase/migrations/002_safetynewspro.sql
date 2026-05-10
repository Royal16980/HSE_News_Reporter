-- SafetyNews Pro — Full schema migration
-- Extends the existing HSE News base schema with SafetyNews Pro tables
-- Run AFTER 001_base_schema (schema.sql)
-- 2026-05-10

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- trigram for fuzzy search

-- ============================================================
-- PARTIES — defendants, companies, individuals named in articles
-- ============================================================
CREATE TABLE IF NOT EXISTS parties (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('company', 'individual', 'partnership', 'local_authority', 'other')),
  sector              TEXT,
  companies_house_no  TEXT,
  headquarters        TEXT,
  employee_band       TEXT,                         -- '1-10', '11-50', '51-200', '201-1000', '1000+'
  verified_domains    TEXT[] DEFAULT '{}',           -- for verified-commenter feature
  logo_url            TEXT,
  website_url         TEXT,
  defamation_cleared  BOOLEAN NOT NULL DEFAULT false,
  defamation_cleared_at TIMESTAMPTZ,
  total_fines         NUMERIC(14,2) DEFAULT 0,
  total_prosecutions  INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_parties_slug ON parties(slug);
CREATE INDEX idx_parties_name_trgm ON parties USING gin(name gin_trgm_ops);
CREATE INDEX idx_parties_sector ON parties(sector);

-- ============================================================
-- REGULATIONS — statutes and regulation references
-- ============================================================
CREATE TABLE IF NOT EXISTS regulations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,               -- 'hswa-1974-s2', 'mhswr-1999-r3'
  short_name    TEXT NOT NULL,                      -- 'HSWA 1974 § 2(1)'
  full_name     TEXT NOT NULL,                      -- 'Health and Safety at Work etc. Act 1974, Section 2(1)'
  act           TEXT NOT NULL,                      -- 'HSWA 1974'
  section       TEXT,                              -- '2(1)'
  year          INTEGER,
  type          TEXT CHECK (type IN ('act', 'regulation', 'acop', 'guidance', 'directive')),
  plain_summary TEXT,                               -- ≤3-sentence plain English (written by Editorial Swarm)
  canonical_url TEXT,                               -- legislation.gov.uk
  priority      INTEGER DEFAULT 0,                  -- higher = generate page sooner
  embedding     vector(1536),                       -- for semantic search
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_regulations_slug ON regulations(slug);
CREATE INDEX idx_regulations_act ON regulations(act);
CREATE INDEX idx_regulations_embedding ON regulations USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- PROSECUTIONS — individual enforcement actions
-- ============================================================
CREATE TABLE IF NOT EXISTS prosecutions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  defendant_id        UUID REFERENCES parties(id) ON DELETE SET NULL,
  article_id          UUID REFERENCES articles(id) ON DELETE SET NULL,
  court               TEXT,                         -- 'Westminster Magistrates' Court'
  court_abbreviation  TEXT,                         -- 'WMC' — for Solari ticker
  hearing_date        DATE,
  sentence_date       DATE,
  sentence_type       TEXT CHECK (sentence_type IN ('fine', 'imprisonment', 'conditional_discharge', 'absolute_discharge', 'community_order', 'suspended', 'other')),
  fine_amount         NUMERIC(14,2),
  imprisonment_months INTEGER,
  regulations_breached UUID[] DEFAULT '{}',          -- references regulations.id
  summary             TEXT,                         -- one-paragraph factual summary
  sentencing_remarks_url TEXT,
  hse_press_release_url  TEXT,
  sector              TEXT,
  region              TEXT,
  verified            BOOLEAN NOT NULL DEFAULT false,
  source_verifier_agent TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prosecutions_defendant ON prosecutions(defendant_id);
CREATE INDEX idx_prosecutions_sentence_date ON prosecutions(sentence_date DESC);
CREATE INDEX idx_prosecutions_sector ON prosecutions(sector);
CREATE INDEX idx_prosecutions_region ON prosecutions(region);
CREATE INDEX idx_prosecutions_sentence_type ON prosecutions(sentence_type);

-- ============================================================
-- INCIDENTS — fatalities and non-prosecution incidents
-- (feeds the fatality clock)
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_date DATE,
  sector        TEXT,
  region        TEXT,
  type          TEXT CHECK (type IN ('fatal', 'major_injury', 'dangerous_occurrence', 'occupational_disease', 'riddor_reportable')),
  description   TEXT,                               -- redacted/plain language
  source_url    TEXT,
  verified      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_sector ON incidents(sector);

-- ============================================================
-- SOURCES — every factual claim has a source row
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    UUID REFERENCES articles(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  source_name   TEXT NOT NULL,                      -- 'HSE press release', 'HMCTS sentencing remarks'
  source_type   TEXT CHECK (source_type IN ('hse_press_release', 'court_remarks', 'legislation', 'foi', 'press', 'official_stats', 'primary', 'other')),
  excerpt       TEXT,                               -- cited sentence/paragraph
  verified_by   TEXT,                               -- agent name
  verified_at   TIMESTAMPTZ,
  embedding     vector(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sources_article ON sources(article_id);

-- ============================================================
-- Extend articles table for SafetyNews Pro
-- ============================================================
ALTER TABLE articles ADD COLUMN IF NOT EXISTS governance_signoff    JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS editor_pick           BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS editor_note           TEXT;   -- ≤120 chars from NOVA-PRIME
ALTER TABLE articles ADD COLUMN IF NOT EXISTS development_status    TEXT CHECK (development_status IN ('developing', 'final')) DEFAULT 'final';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS last_developed_at     TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS regulation_refs       UUID[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS defendant_refs        UUID[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_generated          BOOLEAN DEFAULT true;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS byline                TEXT DEFAULT 'NOVA-PRIME desk · Reviewed by Governance Swarm';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS audio_url             TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS audio_peaks           JSONB;   -- pre-rendered waveform peaks
ALTER TABLE articles ADD COLUMN IF NOT EXISTS audio_chapters        JSONB;   -- [{start, title}, ...]
ALTER TABLE articles ADD COLUMN IF NOT EXISTS audio_transcript      TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS embedding             vector(1536);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS sector                TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS priority              TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS quality_score         INTEGER CHECK (quality_score BETWEEN 1 AND 10);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS investigation         BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS views_last_60min      INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS views_60_120min       INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS velocity_score        NUMERIC(6,4) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_articles_editor_pick ON articles(editor_pick) WHERE editor_pick = true;
CREATE INDEX IF NOT EXISTS idx_articles_sector ON articles(sector);
CREATE INDEX IF NOT EXISTS idx_articles_velocity ON articles(velocity_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_embedding ON articles USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- EDITORIAL_DECISIONS — NOVA-PRIME audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS editorial_decisions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decision_type TEXT NOT NULL,                      -- 'editor_pick', 'agenda_priority', 'swarm_directive', 'escalation'
  rationale     TEXT NOT NULL,
  affected_ids  UUID[] DEFAULT '{}',
  directives    JSONB,                              -- structured directives emitted to swarms
  cost_pence    INTEGER DEFAULT 0,                  -- token cost in pence
  model         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_editorial_decisions_cycle ON editorial_decisions(cycle_at DESC);

-- ============================================================
-- AGENT_RUNS — per-invocation telemetry for all agents
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name      TEXT NOT NULL,
  swarm           TEXT NOT NULL,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_type    TEXT,                             -- 'cron', 'event', 'nova_directive', 'manual'
  status          TEXT CHECK (status IN ('running', 'success', 'failed', 'timeout', 'cancelled')),
  duration_ms     INTEGER,
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  cost_pence      INTEGER DEFAULT 0,
  model           TEXT,
  output_summary  TEXT,
  error_message   TEXT,
  langfuse_trace  TEXT,                             -- Langfuse trace URL
  metadata        JSONB
);
CREATE INDEX idx_agent_runs_agent ON agent_runs(agent_name, run_at DESC);
CREATE INDEX idx_agent_runs_swarm ON agent_runs(swarm, run_at DESC);
CREATE INDEX idx_agent_runs_status ON agent_runs(status, run_at DESC);

-- ============================================================
-- QA_SESSIONS — Ask AI interactions
-- ============================================================
CREATE TABLE IF NOT EXISTS qa_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      TEXT NOT NULL,
  question        TEXT NOT NULL,
  answer          TEXT,
  sources_cited   UUID[] DEFAULT '{}',
  sector_context  TEXT,
  helpful_rating  INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
  promoted_to_faq BOOLEAN DEFAULT false,
  embedding       vector(1536),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_qa_sessions_promoted ON qa_sessions(promoted_to_faq) WHERE promoted_to_faq = false;
CREATE INDEX idx_qa_sessions_created ON qa_sessions(created_at DESC);

-- ============================================================
-- RIGHT_OF_REPLY_REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS right_of_reply_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id      UUID REFERENCES articles(id) ON DELETE SET NULL,
  party_id        UUID REFERENCES parties(id) ON DELETE SET NULL,
  requester_email TEXT NOT NULL,
  requester_name  TEXT NOT NULL,
  requester_role  TEXT,
  submission      TEXT NOT NULL,
  status          TEXT CHECK (status IN ('pending_verification', 'verified', 'under_review', 'approved', 'rejected', 'published')) DEFAULT 'pending_verification',
  verification_token TEXT,
  verified_at     TIMESTAMPTZ,
  reviewed_by     TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PODCAST_EPISODES
-- ============================================================
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_number      INTEGER,
  type                TEXT CHECK (type IN ('daily_brief', 'weekly_digest', 'investigation')) DEFAULT 'daily_brief',
  title               TEXT NOT NULL,
  articles_referenced UUID[] DEFAULT '{}',
  audio_url           TEXT,
  duration_seconds    INTEGER,
  peaks_json          JSONB,
  transcript_md       TEXT,
  chapters            JSONB,
  spotify_url         TEXT,
  apple_url           TEXT,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_podcast_episodes_published ON podcast_episodes(published_at DESC);

-- ============================================================
-- SEARCH_LOG — for trending searches + Q&A placeholder rotation
-- ============================================================
CREATE TABLE IF NOT EXISTS search_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID,
  query           TEXT NOT NULL,
  results_clicked UUID[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_search_log_created ON search_log(created_at DESC);

-- ============================================================
-- EDITORIAL_PICKS — hero rotation log
-- ============================================================
CREATE TABLE IF NOT EXISTS editorial_picks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id      UUID REFERENCES articles(id) ON DELETE CASCADE,
  promoted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  demoted_at      TIMESTAMPTZ,
  novaprime_note  TEXT,                             -- ≤120 chars editor's note
  position        INTEGER DEFAULT 1
);
CREATE INDEX idx_editorial_picks_active ON editorial_picks(promoted_at DESC) WHERE demoted_at IS NULL;

-- ============================================================
-- RATE_LIMITS — API protection
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier      TEXT NOT NULL,
  endpoint        TEXT NOT NULL,
  window_start    TIMESTAMPTZ NOT NULL,
  count           INTEGER NOT NULL DEFAULT 1,
  UNIQUE(identifier, endpoint, window_start)
);
CREATE INDEX idx_rate_limits_window ON rate_limits(identifier, endpoint, window_start);

-- ============================================================
-- Seed data — priority regulations
-- ============================================================
INSERT INTO regulations (slug, short_name, full_name, act, section, year, type, canonical_url, priority) VALUES
  ('hswa-1974-s2', 'HSWA 1974 § 2', 'Health and Safety at Work etc. Act 1974, Section 2 — General duties of employers', 'HSWA 1974', '2', 1974, 'act', 'https://www.legislation.gov.uk/ukpga/1974/37/section/2', 100),
  ('hswa-1974-s3', 'HSWA 1974 § 3', 'Health and Safety at Work etc. Act 1974, Section 3 — Duties to persons other than employees', 'HSWA 1974', '3', 1974, 'act', 'https://www.legislation.gov.uk/ukpga/1974/37/section/3', 95),
  ('mhswr-1999-r3', 'MHSWR 1999 r.3', 'Management of Health and Safety at Work Regulations 1999, Regulation 3 — Risk assessment', 'MHSWR 1999', '3', 1999, 'regulation', 'https://www.legislation.gov.uk/uksi/1999/3242/regulation/3', 90),
  ('coshh-2002-r7', 'COSHH 2002 r.7', 'Control of Substances Hazardous to Health Regulations 2002, Regulation 7 — Prevention/control of exposure', 'COSHH 2002', '7', 2002, 'regulation', 'https://www.legislation.gov.uk/uksi/2002/2677/regulation/7', 85),
  ('riddor-2013-r4', 'RIDDOR 2013 r.4', 'Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013, Regulation 4 — Reporting deaths', 'RIDDOR 2013', '4', 2013, 'regulation', 'https://www.legislation.gov.uk/uksi/2013/1471/regulation/4', 85),
  ('cdm-2015-r13', 'CDM 2015 r.13', 'Construction (Design and Management) Regulations 2015, Regulation 13 — Duties of principal contractor', 'CDM 2015', '13', 2015, 'regulation', 'https://www.legislation.gov.uk/uksi/2015/51/regulation/13', 80),
  ('puwer-1998-r4', 'PUWER 1998 r.4', 'Provision and Use of Work Equipment Regulations 1998, Regulation 4 — Suitability of work equipment', 'PUWER 1998', '4', 1998, 'regulation', 'https://www.legislation.gov.uk/uksi/1998/2306/regulation/4', 75),
  ('loler-1998-r4', 'LOLER 1998 r.4', 'Lifting Operations and Lifting Equipment Regulations 1998, Regulation 4 — Strength and stability', 'LOLER 1998', '4', 1998, 'regulation', 'https://www.legislation.gov.uk/uksi/1998/2307/regulation/4', 75),
  ('manual-handling-1992-r4', 'Manual Handling Ops 1992 r.4', 'Manual Handling Operations Regulations 1992, Regulation 4 — Employer duties', 'Manual Handling Ops 1992', '4', 1992, 'regulation', 'https://www.legislation.gov.uk/uksi/1992/2793/regulation/4', 70),
  ('work-at-height-2005-r4', 'WAH 2005 r.4', 'Work at Height Regulations 2005, Regulation 4 — Employer duties', 'WAH 2005', '4', 2005, 'regulation', 'https://www.legislation.gov.uk/uksi/2005/735/regulation/4', 80)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed data — sectors (matches IMPLEMENTATION_PLAN_v2 sector lenses)
-- ============================================================
INSERT INTO categories (name, slug, color, icon, description) VALUES
  ('Construction',    'construction',    '#F6AD55', 'HardHat',      'Construction sites, scaffolding, CDM, working at height'),
  ('Manufacturing',   'manufacturing',   '#68D391', 'Factory',      'Factories, PUWER, LOLER, machinery guarding'),
  ('Healthcare',      'healthcare',      '#76E4F7', 'Heart',        'NHS, care homes, COSHH biological agents, patient handling'),
  ('Hospitality',     'hospitality',     '#F687B3', 'UtensilsCrossed', 'Hotels, restaurants, COSHH cleaning agents, fire safety'),
  ('Food',            'food',            '#FBD38D', 'ShoppingBasket','Food processing, allergens, HACCP, COSHH'),
  ('Agriculture',     'agriculture',     '#9AE6B4', 'Wheat',        'Farms, tractors, RIDDOR agricultural incidents, agro-chemicals'),
  ('Logistics',       'logistics',       '#90CDF4', 'Truck',        'Transport, warehousing, LGV, manual handling, racking'),
  ('Office',          'office',          '#B794F4', 'Monitor',      'DSE, ergonomics, fire safety, stress and wellbeing')
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  color       = EXCLUDED.color,
  icon        = EXCLUDED.icon,
  description = EXCLUDED.description;

-- ============================================================
-- RLS policies
-- ============================================================
ALTER TABLE parties                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE prosecutions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents                ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_decisions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE right_of_reply_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_picks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits              ENABLE ROW LEVEL SECURITY;

-- Public read for content tables
CREATE POLICY "Public read parties"             ON parties             FOR SELECT USING (true);
CREATE POLICY "Public read regulations"         ON regulations         FOR SELECT USING (true);
CREATE POLICY "Public read prosecutions"        ON prosecutions        FOR SELECT USING (verified = true);
CREATE POLICY "Public read incidents"           ON incidents           FOR SELECT USING (verified = true);
CREATE POLICY "Public read sources"             ON sources             FOR SELECT USING (true);
CREATE POLICY "Public read podcast episodes"    ON podcast_episodes    FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Public read editorial picks"     ON editorial_picks     FOR SELECT USING (demoted_at IS NULL);

-- Service role (agents) can write everything
CREATE POLICY "Service write parties"           ON parties             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write regulations"       ON regulations         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write prosecutions"      ON prosecutions        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write incidents"         ON incidents           FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write sources"           ON sources             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write editorial"         ON editorial_decisions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write agent_runs"        ON agent_runs          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write qa"                ON qa_sessions         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write ror"               ON right_of_reply_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write podcast"           ON podcast_episodes    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write editorial_picks"   ON editorial_picks     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write rate_limits"       ON rate_limits         FOR ALL USING (auth.role() = 'service_role');

-- Q&A: allow anon insert (public Q&A)
CREATE POLICY "Anon insert qa" ON qa_sessions FOR INSERT WITH CHECK (true);

-- Search log: allow anon insert
CREATE POLICY "Anon insert search" ON search_log FOR INSERT WITH CHECK (true);

-- Right of reply: public submit
CREATE POLICY "Public insert ror" ON right_of_reply_requests FOR INSERT WITH CHECK (true);

-- ============================================================
-- Materialised view — sector aggregates (refresh hourly via cron)
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS sector_stats AS
SELECT
  p.sector,
  COUNT(p.id) AS prosecution_count,
  SUM(p.fine_amount) AS total_fines,
  MAX(p.sentence_date) AS latest_prosecution,
  COUNT(p.id) FILTER (WHERE p.sentence_date >= NOW() - INTERVAL '30 days') AS prosecutions_last_30d
FROM prosecutions p
WHERE p.verified = true
GROUP BY p.sector;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sector_stats_sector ON sector_stats(sector);

-- ============================================================
-- Function: increment article views
-- ============================================================
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET views_count = views_count + 1
  WHERE slug = article_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: velocity score refresh (runs via Edge Function cron)
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_velocity_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET velocity_score = CASE
    WHEN views_60_120min = 0 THEN views_last_60min::NUMERIC
    ELSE (views_last_60min - views_60_120min)::NUMERIC / GREATEST(views_60_120min, 1)
  END
  WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parties_updated_at     BEFORE UPDATE ON parties     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER regulations_updated_at BEFORE UPDATE ON regulations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER prosecutions_updated_at BEFORE UPDATE ON prosecutions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
