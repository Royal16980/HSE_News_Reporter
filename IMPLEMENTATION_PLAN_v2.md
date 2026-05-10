# SafetyNews Pro — Autonomous Edition

**Implementation Plan v2.0 — Feature-by-Feature Build Spec**
Royal Odonkor · May 2026

A fully autonomous UK Health & Safety newsroom. Editor-in-chief brain (NOVA-PRIME) coordinating seven specialist swarms. Public site, mobile control room, agent-managed end-to-end. Studio-grade, not generic.

---

## How to read this document

Most "AI website plans" are sand. They say *homepage with hero, sector cards, newsletter signup* and the build that follows is identikit Tailwind soup. This document doesn't do that. Each feature has four parts:

1. **WHAT** — what it is, one line
2. **WHY IT'S NOT GENERIC** — what makes it different from the dross
3. **HOW IT'S BUILT** — exact libraries, patterns, data sources, interactions
4. **AGENT OWNERSHIP** — which swarm/agent runs it in production

Read in order. The reference points throughout: Bloomberg's data density, the FT's editorial gravity, The Verge's modern type, Defector's community feel, Stratechery's respect for the reader, NYT's interactive longform, your own BLACKSITE_AMBER aesthetic from KAI Investigates.

---

## 1. Strategic decisions (signed off — see Open Decisions §13 if changing)

| Decision | Choice | Rationale |
|---|---|---|
| Swarm framework | **Ruflo** primary, LangGraph fallback | Claude-native, MCP support, 60+ agent presets, AgentDB self-learning memory |
| Production runtime | **Hybrid**: Ruflo local + Claude Managed Agents in prod | Anthropic handles always-on agents at $0.08/session-hr; you don't run 24/7 infra |
| Models | Opus 4.7 (NOVA-PRIME) / Sonnet 4.6 (swarms) / Haiku 4.5 (classification) | Mixture of experts; cost-aware |
| CMS | Custom on Supabase | Articles are rows; RLS-scoped agent writes; no Sanity/Payload tax |
| Frontend | Next.js 15 (App Router) + React 19 | ISR + RSC + edge personalisation |
| Search | Typesense (keyword) + pgvector (semantic) | Separate concerns; both self-hostable |
| Animation | Framer Motion + View Transitions API | Spring physics on interaction; native cross-page morphs where supported |
| Type | **Newsreader** (editorial body), **Söhne** or **Inter** (UI), **IBM Plex Mono** (case numbers, data) | Type carries the editorial weight; mono for facts |
| Colour | Charcoal #0A0A0B base, BLACKSITE_AMBER #FFA51F primary, off-white #F2EFEA editorial paper | Dark first; amber as KAI continuity |
| Hosting | Vercel + Cloudflare R2 + Supabase managed | What you already use; R2 zero egress |
| Observability | Langfuse self-hosted on £30/mo VPS | Open source; full agent trace visualisation |
| Email | Resend | Already in the stack |
| Audio/video | Higsfield + Remotion + ElevenLabs | Your existing pipelines |

---

## 2. The NOVA-PRIME architecture

```
                    ┌─────────────────────────────────────┐
                    │      NOVA-PRIME (Opus 4.7)          │
                    │      Editor-in-Chief Brain          │
                    │  Stateful Ruflo orchestrator        │
                    │  Cycles: every 15 min + on-trigger  │
                    └────────────────┬────────────────────┘
                                     │
        ┌────────┬────────┬──────────┼──────────┬────────┬────────┐
        ▼        ▼        ▼          ▼          ▼        ▼        ▼
    Research Editorial Production Distribute Audience  Ops   Governance
    Swarm    Swarm    Swarm      Swarm     Swarm     Swarm  Swarm
        │        │        │          │          │        │        │
        └────────┴────────┴──────────┴──────────┴────────┴────────┘
                                     │
                       ┌─────────────┼─────────────┐
                       ▼             ▼             ▼
                 Supabase       pgvector      AgentDB
                 (CMS DB)       (RAG)         (Ruflo memory)
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
                 Public Site                Mobile Admin PWA
                 (readers)                  (Royal — control room)
```

**NOVA-PRIME's cycle (every 15 min):**

```
1. READ  → world state (Supabase queries: pending tasks, agent statuses,
           24h publishes, traffic, costs, escalation queue)
2. READ  → editorial calendar (Supabase: planned, overdue, audience signals)
3. PLAN  → priorities for next 15 min (which swarm, which agent, which model)
4. RESOLVE → conflicts (duplicate stories, contradicting fact-checks)
5. DECIDE → escalations to Royal (mobile push)
6. UPDATE → swarm-level memory (patterns, costs, failures)
7. EMIT  → directives via MCP to each swarm coordinator
8. LOG   → editorial_decisions row with rationale (audit trail)
```

NOVA-PRIME is the editor walking the newsroom. Doesn't write articles. Doesn't moderate comments. Decides what gets done and who does it.

---

## 3. The seven swarms (full agent roster)

### 3.1 Research Swarm (8 agents)

| Agent | Role | Model | Trigger |
|---|---|---|---|
| Hunter | Polls HSE.gov.uk press releases & prosecutions list | Sonnet | Every 10 min |
| Court Watch | HMCTS court lists + judiciary.uk sentencing remarks | Sonnet | Daily 9am, 2pm |
| Sector Scout | Construction News, IOSH Mag, BSIF, BOHS, RoSPA, SHP | Sonnet | Every 30 min |
| Legislation Tracker | Diff legislation.gov.uk + watch consultations.gov.uk | Sonnet | Daily |
| Statistics Watcher | HSE annual reports, ONS workplace data, RIDDOR datasets | Haiku | Weekly |
| International Monitor | EU-OSHA, OSHA US, WorkSafe AU/NZ comparative | Sonnet | Daily |
| Whistleblower Triage | Encrypted submission portal; redact PII; flag | Opus | On submit |
| Trend Detector | Cross-references Google Trends, social, internal analytics | Sonnet | Hourly |

### 3.2 Editorial Swarm (7 agents)

Brief Writer · Drafter · Investigator (Opus, longform) · Stylist (enforces your voice via skill) · Headline Smith · Subeditor · SEO/GEO Optimiser

### 3.3 Production Swarm (6 agents)

Image Director · Infographic Designer · Video Producer · Podcast Producer · Thumbnail Generator · Shorts Editor

### 3.4 Distribution Swarm (8 agents)

Publisher · Newsletter Curator · LinkedIn · X/Threads · TikTok/Shorts · Push Dispatcher · RSS Manager · Email Reply Engine

### 3.5 Audience Swarm (6 agents)

Q&A Responder · Comment Moderator · Personalisation Engine · Subscription Manager · Community Connector · Survey Synthesiser

### 3.6 Ops Swarm (6 agents)

SRE/Monitor · Cost Optimiser · Security Sentinel · Backup Custodian · Performance Auditor · Trend Analyst

### 3.7 Governance Swarm (7 agents — *most important*)

Defamation Guard (Opus) · Source Verifier · Hallucination Detector (Opus) · Editorial Standards Enforcer · Right-of-Reply Coordinator · Correction Manager · Legal Citation Validator

**Iron rule:** No article publishes without Governance Swarm sign-off written to `articles.governance_signoff` JSONB column. The Defamation Guard runs Opus because the cost of getting that wrong is a lawsuit.

---

## 4. Feature-by-feature build spec

### 4.1 Homepage — Hero / Editor's Pick

**WHAT.** The single story NOVA-PRIME has decided is most important right now. Above the fold, full-bleed.

**WHY IT'S NOT GENERIC.** Most "hero sections" are a stock image, a headline, a button. This is editorial. Split-screen layout: 60% cinematic image (Higsfield-generated, BLACKSITE_AMBER aesthetic), 40% editorial copy in Newsreader serif on the off-white "paper" panel. A live status strip at the bottom: *Reading time 4m · Updated 23m ago · 1,247 readers active · NOVA-PRIME's note* (italicised editor's-note in <120 chars from the brain). Subtle pulse animation on the "active readers" counter (CSS `@keyframes` on the digit). Hero rotates if NOVA-PRIME elevates a different story; transition uses View Transitions API for a film-cut morph between heroes, not a fade.

**HOW IT'S BUILT.**
- Server Component fetches `articles WHERE editor_pick = true LIMIT 1` plus realtime presence count via Supabase Realtime channel
- Image: 16:9 hero, served from R2 with Next.js `<Image>` priority + AVIF/WebP, blur placeholder pre-generated by Image Director agent
- Layout: CSS Grid `grid-template-columns: 60fr 40fr` desktop, stacked on mobile
- "NOVA-PRIME's note" pulled from `articles.editor_note` column (≤120 chars, written by NOVA-PRIME at hero-promotion time)
- Active readers: Supabase Realtime presence channel `room:hero` subscribed client-side
- Pulse animation: Tailwind `animate-pulse` overridden with a custom `@keyframes` that only animates the trailing digit
- View Transitions on hero swap: `document.startViewTransition(() => mutateHero())` with named pseudo-elements
- No CTA button. "Read the story" is a chevron link in editorial body. CTAs on news sites are a tell.

**AGENT OWNERSHIP.** Editor's pick selection: NOVA-PRIME. Image generation: Production Swarm → Image Director. Editor's note: NOVA-PRIME writes during promotion. Active readers count: infra (Supabase Realtime), no agent.

---

### 4.2 Homepage — Live Prosecution Ticker

**WHAT.** A horizontal strip directly under the hero showing the most recent prosecutions in real time.

**WHY IT'S NOT GENERIC.** Most "tickers" are a marquee scroll. Boring. This is a **Solari board** — the split-flap departure-board aesthetic from train stations and old airports. Each prosecution slot is six tiles: court abbreviation, defendant name, regulation cited, sentence type (FINE / IMPRISONMENT / CONDITIONAL), amount in IBM Plex Mono, date. When a new prosecution lands from Court Watch, the affected tiles flip mechanically through random characters before settling. Subtle amber glow on the new entry for 3 seconds. Tap a row → expands inline with the full sentencing remarks excerpt.

**HOW IT'S BUILT.**
- Solari flip: pure CSS with `transform: rotateX()` and 3D perspective on character spans, pseudo-elements for top/bottom halves of each character. There are good reference implementations on CodePen — adapt, don't reinvent.
- New entry detection: Supabase Realtime channel on `prosecutions` table INSERT events
- Glow on new: CSS animation `box-shadow: 0 0 0 2px var(--amber)` decay over 3s
- Tap-to-expand: Framer Motion `<motion.div>` with `layout` prop for FLIP animation; expanded view uses `AnimatePresence`
- Data: `prosecutions` table joined to `parties` (defendant) and `regulations` (cited)
- Mobile: same Solari mechanic but vertical stacked, 3 visible at a time, swipe-to-reveal more
- Sound: optional click-clack on flip (Web Audio API; off by default; user toggle in footer)

**AGENT OWNERSHIP.** Court Watch agent writes prosecution rows. Front-end is data-driven; no agent at render time.

---

### 4.3 Homepage — Sector Lenses

**WHAT.** Eight sector cards (Construction, Manufacturing, Healthcare, Hospitality, Food, Agriculture, Logistics, Office/Services). Each is a doorway into that sector's content.

**WHY IT'S NOT GENERIC.** Each card has a *bespoke visual motif*, not a stock icon:
- Construction: animated wireframe scaffold (SVG line draw on hover)
- Manufacturing: assembly-line motion (small dots translating across the card)
- Healthcare: ECG line drawing across the card (CSS `stroke-dasharray` animation)
- Hospitality: subtle steam-rising particles (Canvas)
- Food: knife-cut motion line
- Agriculture: wheat-sway oscillation
- Logistics: route-line drawing on a map abstract
- Office/Services: cursor-trail effect

Each card displays its own LIVE STAT — *"23 enforcements in your borough this month"* (geolocation-aware via Vercel Edge Config). Tapping a card doesn't navigate — it **reskins the entire site** to that sector's lens: navigation filters, accent colour shifts to the sector's secondary palette, all listings filter. A small "exit lens" pill appears top-right.

**HOW IT'S BUILT.**
- Card motifs: each is a tiny React component using SVG with Framer Motion `useScroll` or `useInView` for activation. Don't use Lottie — too heavy, too generic.
- Live stat: Edge Function reading `prosecutions` aggregated by sector + geo (request IP → borough via Vercel Geo headers)
- Sector lens mode: global Zustand store `sectorLensStore` with active sector id; Tailwind variants gated on `data-sector` root attribute; URL-persistent `?lens=construction`
- Accent shift: each sector has a secondary palette (still BLACKSITE_AMBER primary, sector accent for highlights only); CSS variables swap on root
- Exit lens pill: sticky top-right, shadcn `<Badge>` variant with × icon

**AGENT OWNERSHIP.** Sector Scout populates `articles.sector`. Personalisation Engine learns which sector the user actually engages with and elevates that card's order.

---

### 4.4 Homepage — Fatality Clock

**WHAT.** A solemn statistics block. UK workplace fatalities year-to-date.

**WHY IT'S NOT GENERIC.** Most stat blocks are colourful number counters. This is the opposite — a memorial. Set in dark grey, large Newsreader serif numerals counting fatalities YTD. The number doesn't animate festively when it ticks up; it just changes, with a one-line note: *"Last update: [date] — [name redacted/sector] — [verb in past tense, plain language]"*. Below: **"47 days since the last fatality in [your sector / your region]"** — personal where data allows. A small candle glyph, monoline, no colour. Not exploitative; respectful. The data tells the story.

**HOW IT'S BUILT.**
- Data: `prosecutions` joined with `incidents` (separate table for non-prosecution fatalities), aggregated by year via materialised view refreshed nightly
- Numerals: Newsreader 600 weight, font-feature-settings `"tnum"` (tabular numerals so digits don't shift width)
- Update animation: when number changes, `<span>` content swap with subtle 200ms fade — no celebration
- "47 days since" — calculated client-side from last fatality date + sector match (from session preference) or region (from geo)
- Candle glyph: hand-drawn SVG single-stroke, 1px line weight, `currentColor` so it inherits theme
- Accessibility: `aria-live="polite"` with descriptive text for screen readers

**AGENT OWNERSHIP.** Statistics Watcher updates the underlying data weekly + on RIDDOR notifications. Editorial Standards Enforcer reviews tone of any auto-generated copy here.

---

### 4.5 Homepage — Trending Now

**WHAT.** Three articles getting unusual traction in the last 4 hours.

**WHY IT'S NOT GENERIC.** Most "trending" sections are pageview-based and become self-fulfilling. This uses a **velocity score** — rate of change, not absolute volume. A small story breaking fast outranks a slow burn. Each card shows the velocity as a sparkline (last 4 hours of reads), so the *trending-ness itself is visualised*.

**HOW IT'S BUILT.**
- Velocity score: `(reads_last_60min - reads_60_to_120min_ago) / max(reads_60_to_120min_ago, 1)`, calculated by Edge Function from PostHog or self-hosted analytics every 15 min
- Sparkline: tiny SVG, ≤80×24px, drawn from 16 data points (15-min buckets over 4 hours)
- Cards: shadcn base, customised with sparkline at top, headline middle, sector badge bottom
- Auto-refresh: SWR with 60s `refreshInterval`

**AGENT OWNERSHIP.** Trend Analyst (Ops Swarm) computes the score; Personalisation Engine adjusts ordering per user.

---

### 4.6 Homepage — Audio Brief

**WHAT.** Today's 8-minute podcast, embedded.

**WHY IT'S NOT GENERIC.** Generic players are SoundCloud iframes. This is a **custom waveform player** with editorial chapters. The audio waveform is pre-rendered from the file (peaks JSON), drawn as a series of vertical bars. As the audio plays, played bars are amber, unplayed are off-white. Chapters (intro / story 1 / story 2 / story 3 / outro) appear as subtle dividers in the waveform with title labels above on hover. Click a chapter — jumps. Three speed buttons (1× / 1.25× / 1.5×). Transcript expandable below.

**HOW IT'S BUILT.**
- Waveform peaks: pre-computed by Podcast Producer agent at render time using `audiowaveform` CLI, stored as JSON in `articles.audio_peaks`
- Player: WaveSurfer.js v7 (lightweight, customisable) with custom render plugin OR roll your own with `<canvas>` + the peaks JSON (300 lines, owns the experience)
- Chapters: stored as `articles.audio_chapters` JSONB array `[{start: 0, title: "Intro"}, ...]`
- Transcript: ElevenLabs already returns transcript; store as `articles.audio_transcript` markdown
- Persistence: floating mini-player when scrolled past (Framer Motion `motion.div` with `position: fixed` and shared `layoutId`)

**AGENT OWNERSHIP.** Podcast Producer (Production Swarm) generates the audio + transcript + chapters JSONB. Distribution Swarm publishes to Spotify/Apple via RSS.

---

### 4.7 Article page — full breakdown

**WHAT.** Where the journalism lives. The single most-trafficked page type.

**WHY IT'S NOT GENERIC.** Generic article pages are blog-shaped. This is newsroom-shaped, with eight specific things most sites don't do:

#### 4.7.1 Drop cap + editorial typography
First letter of opening paragraph: 4-line drop cap, Newsreader 700 weight, amber accent. CSS `:first-letter` pseudo-selector with `float: left` + `font-size: 4em`. Pull quotes set in Newsreader Italic 500 weight at 1.5× body size with a hairline rule above and below. Body copy: 18px Newsreader Regular 400 with `line-height: 1.7` and `max-width: 68ch` (the optimal reading measure, not the random 80ch most sites use).

#### 4.7.2 Live "developing story" banner
If Research Swarm flags new info on this story (within 24h of publish), a subtle amber banner appears above the headline: *"This story is developing — last update [time]"*. Auto-removes after 24h or when Editorial Swarm marks `status = 'final'`.
- Backed by `articles.development_status` enum and `articles.last_developed_at` timestamp
- Banner is a Server Component — no client JS

#### 4.7.3 Inline citations as superscript chips
Every factual claim has a `<sup>` numeric citation (NYT-style). Tap → side drawer slides in from the right showing the source paragraph with the cited sentence highlighted. Drawer also shows source name, source type (HSE press release / court remarks / FOI / etc.), and "verified by [agent name] at [time]".
- Render: MDX or custom markdown processor that converts `[^1]` to `<sup data-source-id="...">1</sup>`
- Drawer: shadcn `<Sheet>` from the right, 480px on desktop / full-width mobile
- Source data from `sources` table joined on `source_id`

#### 4.7.4 Defendant card sidebar
Sticky right sidebar (when defendant named): company logo (or default geometric block), name, sector, total prosecutions to date, total fines to date, headquarters, latest 5 articles mentioning them. Tap → defendant page (§4.10).
- Component: `<DefendantCard partyId={...} />`, sticky `top-24`
- Data: aggregate query on `prosecutions WHERE defendant_id = ?`
- Mobile: collapsed by default into a "View defendant history" pill above the article body

#### 4.7.5 Regulations cited as chips
Top of article, under the byline: chips for each regulation cited (e.g., *HSWA 1974 § 2(1) · MHSWR 1999 § 3 · CDM 2015 § 13*). Each chip → regulation page (§4.11).
- IBM Plex Mono, 13px, charcoal background, amber border on hover
- Generated by Legal Citation Validator agent at write-time, stored as `articles.regulation_refs` UUID array

#### 4.7.6 Audio version with custom waveform
Play button at top of article. Click → article-bottom sticky audio bar appears with the same custom waveform player (§4.6). Auto-generated by Podcast Producer agent for every article.

#### 4.7.7 Print/PDF mode (Royal: this is a sleeper feature)
"Save as PDF" button generates a *properly designed* PDF — not a screenshot of the page, not the browser's hideous default. Multi-column layout, Newsreader serif body, footer with article URL + retrieval date + "© SafetyNews Pro". Compliance officers will save and circulate these in their organisations. Free SEO.
- Generated server-side via Puppeteer + a dedicated `/print/[slug]` route with print-specific CSS
- Endpoint: `GET /api/print/[slug]` returns PDF stream
- Honour the article's regulation chips, citations, and defendant card

#### 4.7.8 Right-of-reply portal
Below article body, a pill: *"Named in this story? Submit a right of reply."* Opens a form. Submission goes to Right-of-Reply Coordinator agent which authenticates the requester (verification email to a domain matching the named entity), routes to Royal for review, publishes as appended response if approved.
- Form: shadcn `<Form>` + Zod validation
- Backend: writes to `right_of_reply_requests` table + Resend transactional email for verification

**AGENT OWNERSHIP.** Drafter writes body. Stylist enforces voice. Subeditor cleans. SEO/GEO Optimiser handles schema. Source Verifier writes the `sources` rows. Legal Citation Validator writes regulation chips. Defamation Guard signs off before publish. Podcast Producer creates the audio. Right-of-Reply Coordinator handles the portal.

---

### 4.8 The killer feature — Ask AI

**WHAT.** A full-screen Q&A overlay that answers H&S questions with cited sources from your corpus + HSE / legislation.gov.uk / IOSH / ACOPs.

**WHY IT'S NOT GENERIC.** Generic AI chatboxes are the worst design pattern of 2024–25. This is different in five ways:

1. **Sticky search bar** — top of every page. Looks like a search bar, not a chat. Placeholder rotates: *"Ask: when is a risk assessment legally required?" → "Ask: what counts as a RIDDOR-reportable injury?" → "Ask: how do I challenge an Improvement Notice?"*. Real questions other users have asked, anonymised.
2. **Activation animation** — click/focus, the bar expands into a full-screen overlay with a backdrop blur (`backdrop-filter: blur(16px)`) over the dimmed page. View Transitions API where supported.
3. **Streaming response with progressive citations** — answer streams token by token (Vercel AI SDK + Anthropic streaming). As facts arrive, citation pills *appear inline at the moment they're cited*, not all at the end. Pills are small, monospaced, numbered. Click a pill → side drawer opens with the source paragraph.
4. **Suggested follow-ups** — after the answer settles, three follow-up questions appear (generated in the same call, not a second round-trip). One-tap to ask.
5. **Q&A → article** — every Q&A is logged. When a question hits 5+ asks, NOVA-PRIME promotes it to a generated FAQ page (with proper Schema.org `FAQPage` structured data). This is huge for AEO/GEO — your site starts ranking for the long-tail H&S questions nobody else has answers for.

**HOW IT'S BUILT.**
- Sticky bar: shadcn `<Command>` styled, `position: sticky; top: 0; z-index: 50`
- Placeholder rotation: `useEffect` rotating from a top-questions array refreshed nightly (read from `qa_sessions WHERE helpful_rating > 0 GROUP BY question ORDER BY count DESC`)
- Overlay activation: View Transitions API + Framer Motion for browsers without support
- Backdrop blur: `backdrop-filter: blur(16px)` on the overlay container; fallback to dark scrim
- Streaming: Vercel AI SDK `useChat()` hook → API route `/api/ask` → Anthropic streaming with system prompt that *requires* citation tokens (`<cite id="...">...</cite>`)
- Citation render: custom markdown processor parses `<cite>` tags and replaces with chip components
- RAG: pgvector cosine similarity on the `articles.embedding`, `regulations.embedding`, `sources.embedding` tables, top-k=12, reranked with Cohere Rerank or a Sonnet pass
- Side drawer: shadcn `<Sheet>` from the right
- Suggested follow-ups: appended to the same Anthropic call as `## Follow-ups` section, parsed out client-side
- Q&A → FAQ promotion: Audience Swarm Q&A Responder logs every session; nightly job in NOVA-PRIME's cycle aggregates top unanswered questions; if same question (semantic match >0.85) hits 5+, generates an FAQ article via Editorial Swarm

**AGENT OWNERSHIP.** Q&A Responder (Audience Swarm) handles each request. NOVA-PRIME promotes Q&As to FAQ articles. Source Verifier validates citations. Hallucination Detector spot-checks 5% of responses async.

---

### 4.9 Sector pages

**WHAT.** Dedicated landing page per sector (e.g., `/sectors/construction`).

**WHY IT'S NOT GENERIC.** Sector pages on most H&S sites are just a tag archive. This is a **sector-specific newsroom**:
- Hero: sector-specific KPI (*"127 prosecutions in UK construction in 2026 YTD · £4.2m total fines"*)
- Top regulations cited in this sector (chip cloud, sized by frequency)
- Most-prosecuted defendants in this sector (top 10 list with counts)
- "What's new this week" — ticker-style
- Long-running investigations
- Sector-specific newsletter signup
- Sector-specific Q&A history (top 10 most-asked in this sector)

**HOW IT'S BUILT.**
- Server Components with parallel data fetches
- Materialised views for sector aggregates (refreshed hourly)
- Sector colour accent applied via root data attribute
- Hero KPI with the same Newsreader tabular numerals

**AGENT OWNERSHIP.** Sector Scout feeds the articles. NOVA-PRIME chooses the highlighted long-running investigation per sector.

---

### 4.10 Defendant pages

**WHAT.** Every named company or individual gets a profile page (`/defendants/[slug]`).

**WHY IT'S NOT GENERIC.** Almost no UK H&S site does this. It's *Companies House meets the Sentencing Council, with editorial overlay*:
- Header: name, sector, headquarters, Companies House link, employee size band
- Compliance timeline: visual horizontal timeline (D3) of every prosecution, sized by fine, colour-coded by sentence type. Hover → article preview.
- Comparison: their fines vs. sector median (D3 violin plot)
- All articles mentioning them
- All regulations they've been cited under
- Total fines to date (large Newsreader numerals)
- Their public statements on H&S (scraped from their site, where applicable, with attribution and date)

Tasteful tone. Not vindictive. Not editorialising. Just facts and links. Every claim sourced. The Defamation Guard reviews every defendant page on first publish AND on every update.

**HOW IT'S BUILT.**
- Slug from normalised name (e.g., "Acme Construction Ltd" → `acme-construction-ltd`)
- D3 timeline: horizontal scrub timeline, x-axis = date, marker size = fine amount
- D3 violin plot: their distribution overlaid on sector distribution
- Public statements: optional, scraped by a one-shot Hunter sub-task per defendant (cached for 30 days)
- Generated lazily: defendant page is only built/cached when first requested; subsequent prosecution rows trigger ISR revalidation

**AGENT OWNERSHIP.** Generated by Editorial Swarm on demand. Defamation Guard signs off. Right-of-Reply Coordinator handles disputes. Visible "Suggest a correction" link runs through Correction Manager.

---

### 4.11 Regulation pages

**WHAT.** Every regulation cited gets a page (e.g., `/regulations/hswa-1974-section-2`).

**WHY IT'S NOT GENERIC.** legislation.gov.uk has the canonical text. Boring. Inaccessible. This page is **the plain-English explainer the internet doesn't have**:
- Hero: full citation (Act, Section, Year)
- Plain-English summary (≤3 sentences, written by Editorial Swarm)
- "What this looks like in practice" — three real prosecution examples auto-pulled
- "Who this affects" — the duty-holders in plain language
- "Common breaches" — generated from prosecution data
- "What an inspector looks for" — operational checklist drawn from your enforcement experience as the editorial source
- Full canonical text, collapsible
- All articles citing this regulation

This is **massive SEO/GEO play**. Search "what is HSWA Section 2" — you don't currently get a great result. You will.

**HOW IT'S BUILT.**
- Slug derived from canonical citation
- Plain-English summary: written by Editorial Swarm Drafter against canonical text + ACOP, Stylist enforces "Royal voice", reviewed by Legal Citation Validator
- "What an inspector looks for" — sourced from your own knowledge base; you write a 100-word draft per priority regulation, agents extend
- "Common breaches": SQL aggregate over `prosecutions.regulations_breached`
- Schema.org `Article` + `Legislation` structured data

**AGENT OWNERSHIP.** Editorial Swarm generates. Legal Citation Validator signs off. NOVA-PRIME prioritises which regulations to publish first based on prosecution frequency.

---

### 4.12 Investigations longform

**WHAT.** Monthly deep-dive feature, KAI Investigates DNA. ~3,000–5,000 words.

**WHY IT'S NOT GENERIC.** Magazine-style layout, not blog-style:
- Full-bleed sections (image breaks, no max-width on selected blocks)
- Drop caps on each major section
- Pull quotes set as inserts that breach the text column
- Embedded Remotion video at narrative beats (KAI desk explainers)
- Audio narration toggle (full ElevenLabs voiceover, not just article TTS — actor-driven, characterful)
- "Case timeline" — interactive horizontal D3 timeline with filterable layers (events / charges / hearings / verdict)
- "People involved" — cast list with thumbnails, click → their defendant page
- Reading progress bar (top of page, hairline amber)
- Time-to-read estimate at top, updates as you scroll

Presented like a Netflix doc chapter. Not a blog post.

**HOW IT'S BUILT.**
- MDX route `/investigations/[slug]` with custom components: `<FullBleed>`, `<PullQuote>`, `<RemotionEmbed>`, `<CaseTimeline>`, `<CastList>`
- Reading progress: `useScroll` from Framer Motion, single fixed bar `position: fixed; top: 0; height: 2px`
- Audio narration: ElevenLabs Voice ID dedicated to investigations (custom-trained on Royal-approved sample; pick the voice carefully — Adam, Daniel, or a custom clone)
- Case timeline: D3 with custom theme; mobile = vertical timeline
- Cast list: avatars are agent-generated headshots OR placeholder geometric blocks (don't fake real photos of real people — Defamation Guard will block this)

**AGENT OWNERSHIP.** Investigator (Editorial Swarm, Opus) writes. Production Swarm generates Remotion videos + audio narration. Governance Swarm reviews exhaustively. NOVA-PRIME schedules.

---

### 4.13 Statistics dashboard

**WHAT.** `/statistics` — interactive UK H&S data dashboard.

**WHY IT'S NOT GENERIC.** Most stats pages are PDFs from HSE rebranded. This is **interactive, comparative, Bloomberg-grade**:
- Fatalities by sector (treemap with year selector slider)
- Fines by sector (stacked bar with median line)
- Prosecutions by region (UK choropleth map)
- Time-to-prosecution distribution (violin plot)
- "Most-cited regulations this year" (word cloud, but not the lazy AI-generated ones — sized by frequency, layout-aware)
- Year-on-year comparisons with delta arrows
- Every chart has a "Cite this chart" button that copies a URL with embedded params + auto-generated caption suitable for academic use

**HOW IT'S BUILT.**
- D3 + Observable Plot (Plot is wonderful for fast, beautiful charts)
- Server Components fetch data; charts hydrated client-side for interactivity
- All data sourced from `prosecutions`, `incidents`, `regulations` tables — single source of truth
- "Cite this chart" generates a deep link: `/statistics?chart=fatalities-sector&year=2026&sector=construction`
- Mobile: charts simplify to top-N lists with sparklines instead of full visualisations

**AGENT OWNERSHIP.** Statistics Watcher keeps data fresh. Infographic Designer designs new chart types when NOVA-PRIME requests them.

---

### 4.14 Tools

**WHAT.** `/tools` — interactive utilities.

**WHY IT'S NOT GENERIC.** Most "tools" sections are link-out lists. These are real, in-browser, free, ungated:
- **Fine calculator** — based on Sentencing Council guidelines: input culpability, harm, turnover → estimated fine range with the case law that informs it
- **RIDDOR checker** — "Is this incident reportable?" walkthrough; outputs the reporting category and timeline
- **Risk assessment skeleton generator** — input task + sector, outputs a starter RA with hazards, controls, references
- **Improvement Notice deadline calculator** — input issue date + period, outputs deadlines + appeal window
- **Compliance gap scanner** (logged-in users) — paste your H&S policy, get back gaps against current legislation

Each tool is its own React component under `/tools/[slug]`. Server-side state where useful (Compliance gap scanner uses an agent on submit). Each tool has its own dedicated SEO page with a usage explainer.

**HOW IT'S BUILT.**
- Each tool: standalone client component with shadcn form primitives + Zod validation
- Calculations: pure functions, well-tested, sourced from the relevant guideline (Sentencing Council, RIDDOR Reg 2013, etc.) with citations
- Compliance gap scanner: form → submits to `/api/tools/gap-scanner` → routes to Editorial Swarm Drafter with a tool-specific prompt → returns structured gaps array
- Free for the calculators, gated for the scanner (drives subscriptions)

**AGENT OWNERSHIP.** Tools are mostly static logic. Compliance gap scanner uses Editorial Swarm Drafter. Editorial Standards Enforcer signs off the calculator outputs (case law accuracy is critical).

---

### 4.15 Mobile Admin PWA — the control room

**WHAT.** Your mobile editor-in-chief interface. Where you spend ~10 minutes a day after launch.

**WHY IT'S NOT GENERIC.** The original spec was Tinder-style swipe. Wrong. This is a **control room aesthetic**:
- Dark mode (always — this is operations, not consumer)
- Dense info density, terminal-style logs
- Live swarm dashboard: each of the 7 swarms gets a tile showing current activity, queue depth, error count, cost burn last hour
- NOVA-PRIME chat panel: dedicated tab where you can type to the brain directly ("priorise the steel mill story", "kill the conditional discharge piece")
- Approval queue: still swipe-based for triage, but each card shows the *Governance Swarm sign-off card* with green/amber/red flags per check (Defamation, Source, Hallucination, Citation, Standards, Reply, Correction)
- Push notifications for human-escalations only (not every publish)
- Offline-first: queue actions, sync when online (your existing PWA spec extended)

**HOW IT'S BUILT.**
- Next.js PWA shell (your existing repo, salvageable)
- Swarm dashboard: WebSocket via Supabase Realtime subscribing to `agent_runs` inserts
- NOVA-PRIME chat: dedicated WebSocket route to the orchestrator with auth scoped to your user
- Approval cards: shadcn `<Card>` with custom Governance Swarm sign-off component showing 7 traffic lights
- Swipe: `react-use-gesture` (you have this in the original spec)
- Push: FCM via Supabase Edge Functions
- Offline queue: IndexedDB via Dexie

**AGENT OWNERSHIP.** All seven swarms emit telemetry. NOVA-PRIME is the chat counterparty. You are the only human with admin access (RLS-enforced).

---

### 4.16 Search

**WHAT.** Full-text search of all articles, regulations, defendants, sectors.

**WHY IT'S NOT GENERIC.** Most search bars on news sites are token-matched filename queries. This is **multi-index faceted**:
- Typesense indexes: `articles`, `regulations`, `defendants`
- Federated query — one input, results grouped by type
- Facets: sector, year, regulation, sentence type, fine band
- "Did you mean" with semantic suggestions (pgvector fallback)
- Recent searches saved per user
- Empty-state shows trending searches, not generic categories

**HOW IT'S BUILT.**
- Typesense Cloud or self-hosted on Hetzner
- Federated UI: shadcn `<CommandDialog>` with grouped results
- Facets: Typesense facet API
- Semantic fallback: if Typesense returns <3 results, query pgvector, present as "you might also be looking for"
- Trending: top 10 searches in last 24h from `search_log` table

**AGENT OWNERSHIP.** Index updates triggered by Publisher agent on every article publish. No agent at query time.

---

### 4.17 Personalised feed

**WHAT.** `/my-feed` for logged-in users. Articles ranked by their interests.

**WHY IT'S NOT GENERIC.** Most personalisation is a popularity boost. This is **explicit + implicit hybrid**:
- **Explicit signals** at signup: sector(s), role, company size, location, regulations of interest
- **Implicit signals** ongoing: dwell time per article, scroll depth, click-through, search queries, Q&A questions asked
- Ranker: a small ML model (or a Sonnet call with structured output for the first version) takes user vector + article vector + time decay + diversity bonus → ranked list
- Transparent: each item has a "why am I seeing this?" link (good UX, helpful for trust)

**HOW IT'S BUILT.**
- User vector: weighted average of explicit interests (50%) + recent engagement embeddings (50%)
- Article vector: pre-computed embeddings on publish
- Ranker v1: cosine similarity + time decay (`exp(-age_hours / 48)`) + diversity penalty for too many same-sector consecutive
- Ranker v2: lightweight model trained on click-through (after 3 months of data)
- "Why?" overlay: shadcn `<Popover>` showing top 3 contributing factors

**AGENT OWNERSHIP.** Personalisation Engine (Audience Swarm) computes daily user vectors. Trend Analyst feeds back ranking quality metrics weekly.

---

### 4.18 Comments and moderation

**WHAT.** Reader comments under articles.

**WHY IT'S NOT GENERIC.** Most news comments are a hellsite. This is **structured engagement**:
- Comments require auth (no drive-by)
- Three reply types: *Question* (gets routed to Q&A Responder), *Correction* (gets routed to Correction Manager), *Discussion* (visible to others)
- Comment Moderator (Haiku) classifies on submit; spam/abuse rejected automatically
- Verified-defendant flag: if commenter's email domain matches the named defendant, flag in UI as "Verified [defendant name]" — adds editorial weight
- Top-rated comments surface inline in the article body (NYT-style)

**HOW IT'S BUILT.**
- Auth: Supabase Auth
- Comment type radio at submit
- Moderation queue with three states: approved / pending / rejected
- Verified-defendant: domain-match check against `parties.verified_domains` array
- Inline surface: top-3 by upvotes after 24h promoted into a quote-style block in the article body

**AGENT OWNERSHIP.** Comment Moderator. Q&A Responder for question-type. Correction Manager for correction-type.

---

### 4.19 Distribution outputs

**WHAT.** Each article auto-distributes to Newsletter, LinkedIn, X, TikTok, podcast.

**WHY IT'S NOT GENERIC.** Most "auto-share" is just URL + headline. This adapts to the medium:
- **Newsletter:** Newsletter Curator builds daily/weekly digests (your SafetyNews Pro skill — already designed in The Rundown AI style)
- **LinkedIn:** LinkedIn Distributor uses your `linkedin-content-creator` skill — first-person enforcement voice, no hashtag spam, structured for the platform
- **X/Threads:** X Distributor turns it into a 4–6-tweet thread; first tweet hooks, last tweet links
- **TikTok/Shorts/Reels:** Shorts Editor takes the article + the Remotion KAI Investigates template + ElevenLabs voiceover and produces a 60–90s vertical clip auto-uploaded via API
- **Podcast:** Podcast Producer's daily 8-min feed plus weekly 30-min deep-dive for major investigations

**HOW IT'S BUILT.**
- LinkedIn / X: scheduled posts via Buffer API or direct platform APIs
- TikTok: TikTok API (requires Business account approval)
- YouTube Shorts: YouTube Data API v3
- Podcast RSS: auto-generated from `podcast_episodes` table; submitted once each to Spotify/Apple/Google then auto-syndicates
- Each output uses platform-specific prompts in the Distribution Swarm

**AGENT OWNERSHIP.** Distribution Swarm — one agent per platform, each with its own platform-tuned prompt and its own success metrics tracked by Trend Analyst.

---

### 4.20 Print/PDF and export

**WHAT.** Compliance officers and trainers want to circulate this content offline.

**WHY IT'S NOT GENERIC.** A "Save as PDF" button that produces something *worth saving*:
- Per-article: clean PDF (4.7.7 above)
- Per-investigation: full magazine-style PDF, multi-page, designed
- Per-week: weekly digest PDF (Editorial Swarm composes)
- Per-defendant: their full prosecution record as a PDF (incredibly useful for procurement teams)

**HOW IT'S BUILT.**
- Puppeteer + dedicated print routes
- Custom @page CSS rules for print-specific typography, headers, footers
- Defendant export gated behind subscription (drives revenue)

**AGENT OWNERSHIP.** Distribution Swarm Publisher generates on demand. Editorial Standards Enforcer reviews the export designs quarterly.

---

## 5. Data model (full schema)

```sql
-- See IMPLEMENTATION_PLAN v1 §7 for core tables.
-- Additional tables introduced in v2:

-- Editor's pick rotation
editorial_picks (id, article_id, promoted_at, demoted_at, novaprime_note, position)

-- Tools logs (for analytics + Q&A surfacing)
tool_invocations (id, tool_slug, user_id, input jsonb, output jsonb, created_at)

-- Newsletter subscribers (separate from users; allows unauthenticated signup)
newsletter_subscribers (id, email, sectors[], frequency, confirmed, ...)

-- Podcast episodes
podcast_episodes (id, episode_number, type, articles_referenced[], audio_url, peaks_json, transcript_md, chapters jsonb, ...)

-- Search log
search_log (id, user_id, query, results_clicked[], created_at)

-- Verified defendant domains (for verified-commenter feature)
parties.verified_domains text[]

-- Rate limiting
rate_limits (id, identifier, endpoint, window_start, count)
```

---

## 6. Phased roadmap (12 weeks, with build-spec checkpoints)

### Phase 0 — Decisions & Foundation (Week 1)
- Sign off all strategic decisions in §1
- Repo audit: salvage vs fresh
- BLACKSITE_AMBER → SafetyNews Pro design tokens
- Provision: Vercel, Supabase, R2, Resend, Langfuse VPS, Typesense
- `npm info ruflo` — confirm version
- NOVA-PRIME first-run with hello-world cycle
- **Checkpoint:** This document signed off + design tokens locked

### Phase 1 — Core infrastructure (Weeks 2–3)
- Database schema + RLS + seed (regulations, sectors)
- Next.js shell, layout primitives, design system base
- Solari board ticker prototype (Phase 1 includes this — it's the visual signature, prove it early)
- Custom waveform player prototype
- Ruflo runtime + Claude Managed Agents account
- **Checkpoint:** staging.safetynews.pro loads with ticker animating against seed data

### Phase 2 — Research + Editorial swarms (Weeks 4–5)
- Hunter, Sector Scout, Legislation Tracker, Court Watch
- Editorial Swarm: Brief, Drafter, Stylist, Subeditor, Headline Smith, SEO
- Governance Swarm v0.5: Source Verifier, Hallucination Detector
- Mobile Admin PWA review queue with sign-off cards
- First 50 articles autonomously generated, manually reviewed
- **Checkpoint:** swarm producing 5+ articles/day with Governance pass rate >80%

### Phase 3 — Public launch MVP (Week 6)
- Homepage live (hero, ticker, sector cards, fatality clock, trending, audio brief stub)
- Article pages live (drop cap, citations, defendant card, regulation chips)
- Search live (Typesense)
- Editorial standards page
- Soft launch on LinkedIn
- **Checkpoint:** site indexable, first organic traffic

### Phase 4 — Production Swarm (Weeks 7–8)
- Image Director (Higsfield)
- Infographic Designer (D3 generated charts)
- Podcast Producer pipeline (daily 8-min)
- Video Producer (Remotion + KAI templates) for major stories
- Shorts Editor for vertical clips
- **Checkpoint:** every article ships with hero image; daily podcast on Spotify

### Phase 5 — Distribution + Audience (Weeks 9–10)
- Newsletter Curator → daily + weekly
- LinkedIn / X / TikTok distributors
- **Ask AI live** — invest disproportionate time here, this is the killer feature
- Personalisation Engine v1
- Comments + moderation
- **Checkpoint:** Q&A driving session depth >2× baseline

### Phase 6 — Ops + Polish (Weeks 11–12)
- Full Governance Swarm online
- Defendant pages live
- Regulation pages live (top 50 priority regs)
- Tools live (calculators, RIDDOR checker, RA generator)
- Cost Optimiser tuned to <£0.40/article
- Investigations longform pipeline live, first investigation published
- Trend Analyst weekly reports to Royal
- **Checkpoint:** site is what this document describes

---

## 7. Cost projections

Roughly £1,035–£1,535/month at full capacity (50 articles/day, daily podcast, 5 videos/week). Self-hosting Langfuse + Typesense + Ruflo on a £30/mo VPS knocks ~£60 off. See v1 §9 for breakdown.

Break-even: 200 paid subscribers at £8/mo OR 5 sponsor slots at £300/mo OR 1 enterprise reader at £2k/yr.

---

## 8. Risk register (unchanged from v1 — see §10 of v1)

Defamation lawsuit · regulator complaint · hallucinated facts · Google AI penalty · agent off-rails · cost runaway · scraping ban · burnout. Mitigations all in place via Governance Swarm + cost caps + insurance.

---

## 9. Anti-generic checklist

Before any feature ships, the building agent runs this checklist:

- [ ] Does this look like every other AI-built site? If yes, redesign.
- [ ] Is there at least one *bespoke* element on this page (custom motion, custom data viz, custom interaction) that wouldn't be in a stock Tailwind template?
- [ ] Does the typography do work, or is it default Tailwind sans?
- [ ] Does the data tell a story, or is it just stat-with-counter?
- [ ] Is there a button that says "Learn more"? If yes, rewrite the copy.
- [ ] Did I use a stock icon library where a hand-drawn SVG would carry more weight?
- [ ] Is the empty state designed, or is it the React-blank-page void?
- [ ] If a real reporter at the FT or Bloomberg saw this, would they think "amateur"? If yes, redesign.

---

## 10. Open decisions (still need Royal's call)

1. Domain (safetynews.pro / .uk / rebrand to *The Enforcement* / *Hazard* / *The Standard*)
2. Editorial transparency line (full AI disclosure vs softer)
3. Right-of-reply policy (24h pre-publish vs post-publish only)
4. Investigation cadence (monthly premium vs weekly volume)
5. Paywall model (free + paid newsletter / freemium / fully free + sponsorships)
6. Geographical scope (UK-only vs UK-primary + comparative)
7. Existing repo (salvage and extend vs fresh start)

---

*Document maintained by Royal Odonkor with NOVA-PRIME (planning instance, not yet in production). Last updated: 10 May 2026.*
