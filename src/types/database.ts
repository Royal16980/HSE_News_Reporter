export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Core article types ──────────────────────────────────────────────────────

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  published_at: string
  featured_image_url: string | null
  status: 'draft' | 'published' | 'archived'
  views_count: number
  reading_time: number
  created_at: string
  updated_at: string
  // SafetyNews Pro extensions
  governance_signoff: Json | null
  editor_pick: boolean
  editor_note: string | null
  development_status: 'developing' | 'final'
  last_developed_at: string | null
  regulation_refs: string[]
  defendant_refs: string[]
  ai_generated: boolean
  byline: string
  audio_url: string | null
  audio_peaks: Json | null
  audio_chapters: Json | null
  audio_transcript: string | null
  embedding: unknown | null
  sector: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  quality_score: number | null
  investigation: boolean
  views_last_60min: number
  views_60_120min: number
  velocity_score: number
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  description: string | null
  created_at: string
}

// ─── SafetyNews Pro entity types ─────────────────────────────────────────────

export interface Party {
  id: string
  slug: string
  name: string
  type: 'company' | 'individual' | 'partnership' | 'local_authority' | 'other'
  sector: string | null
  companies_house_no: string | null
  headquarters: string | null
  employee_band: string | null
  verified_domains: string[]
  logo_url: string | null
  website_url: string | null
  defamation_cleared: boolean
  defamation_cleared_at: string | null
  total_fines: number
  total_prosecutions: number
  created_at: string
  updated_at: string
}

export interface Regulation {
  id: string
  slug: string
  short_name: string
  full_name: string
  act: string
  section: string | null
  year: number | null
  type: 'act' | 'regulation' | 'acop' | 'guidance' | 'directive' | null
  plain_summary: string | null
  canonical_url: string | null
  priority: number
  embedding: unknown | null
  created_at: string
  updated_at: string
}

export interface Prosecution {
  id: string
  defendant_id: string | null
  article_id: string | null
  court: string | null
  court_abbreviation: string | null
  hearing_date: string | null
  sentence_date: string | null
  sentence_type: 'fine' | 'imprisonment' | 'conditional_discharge' | 'absolute_discharge' | 'community_order' | 'suspended' | 'other' | null
  fine_amount: number | null
  imprisonment_months: number | null
  regulations_breached: string[]
  summary: string | null
  sentencing_remarks_url: string | null
  hse_press_release_url: string | null
  sector: string | null
  region: string | null
  verified: boolean
  source_verifier_agent: string | null
  created_at: string
  updated_at: string
  // Joined
  party?: Party
  article?: Article
}

export interface Incident {
  id: string
  incident_date: string | null
  sector: string | null
  region: string | null
  type: 'fatal' | 'major_injury' | 'dangerous_occurrence' | 'occupational_disease' | 'riddor_reportable' | null
  description: string | null
  source_url: string | null
  verified: boolean
  created_at: string
}

export interface Source {
  id: string
  article_id: string | null
  url: string
  source_name: string
  source_type: 'hse_press_release' | 'court_remarks' | 'legislation' | 'foi' | 'press' | 'official_stats' | 'primary' | 'other' | null
  excerpt: string | null
  verified_by: string | null
  verified_at: string | null
  embedding: unknown | null
  created_at: string
}

export interface EditorialDecision {
  id: string
  cycle_at: string
  decision_type: string
  rationale: string
  affected_ids: string[]
  directives: Json | null
  cost_pence: number
  model: string | null
  created_at: string
}

export interface AgentRun {
  id: string
  agent_name: string
  swarm: string
  run_at: string
  trigger_type: string | null
  status: 'running' | 'success' | 'failed' | 'timeout' | 'cancelled' | null
  duration_ms: number | null
  input_tokens: number
  output_tokens: number
  cost_pence: number
  model: string | null
  output_summary: string | null
  error_message: string | null
  langfuse_trace: string | null
  metadata: Json | null
}

export interface QaSession {
  id: string
  session_id: string
  question: string
  answer: string | null
  sources_cited: string[]
  sector_context: string | null
  helpful_rating: number | null
  promoted_to_faq: boolean
  embedding: unknown | null
  created_at: string
}

export interface RightOfReplyRequest {
  id: string
  article_id: string | null
  party_id: string | null
  requester_email: string
  requester_name: string
  requester_role: string | null
  submission: string
  status: 'pending_verification' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'published'
  verification_token: string | null
  verified_at: string | null
  reviewed_by: string | null
  published_at: string | null
  created_at: string
}

export interface PodcastEpisode {
  id: string
  episode_number: number | null
  type: 'daily_brief' | 'weekly_digest' | 'investigation'
  title: string
  articles_referenced: string[]
  audio_url: string | null
  duration_seconds: number | null
  peaks_json: Json | null
  transcript_md: string | null
  chapters: Json | null
  spotify_url: string | null
  apple_url: string | null
  published_at: string | null
  created_at: string
}

export interface SectorStats {
  sector: string
  prosecution_count: number
  total_fines: number | null
  latest_prosecution: string | null
  prosecutions_last_30d: number
}

// ─── Legacy newsletter subscriber ────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
  verified: boolean
  verification_token: string | null
}
