# Phase 1 — Core Infrastructure Signoff

**Date:** 2026-05-10  
**Branch:** claude/gracious-noether-6c0db9  
**Status:** PARTIAL — one blocker (ANTHROPIC_API_KEY)

---

## Checkpoint gates

| Gate | Requirement | Status |
|------|-------------|--------|
| Migrations | 002_safetynewspro.sql applied | ✅ PASS |
| Tables | 12 new tables created with RLS | ✅ PASS |
| Seed data | 10 regulations, 8 sector categories | ✅ PASS |
| Design system | BLACKSITE_AMBER tokens, no blue gradients | ✅ PASS |
| Header | SafetyNews Pro wordmark, flat sector nav | ✅ PASS |
| Footer | Editorial provenance, right-of-reply link | ✅ PASS |
| Hero | Anti-generic editorial lede layout | ✅ PASS |
| SolariTicker | On homepage with 5 seed prosecutions | ✅ PASS |
| WaveformPlayer | Component built, ready to render | ✅ PASS |
| NOVA-PRIME cron | Route exists, Supabase writes verified | ✅ PASS |
| NOVA-PRIME live | 15-min Anthropic cycle | ⏳ BLOCKED |
| Deployment | staging.safetynews.pro | ⏳ NOT STARTED |

---

## Blocker: ANTHROPIC_API_KEY

NOVA-PRIME's live editorial cycle calls `claude-opus-4-7` via the Anthropic SDK.  
The `.env.local` in the worktree has a blank `ANTHROPIC_API_KEY=`.

**Action:** Add the Anthropic API key to `.env.local` (worktree):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Once added, test the cron endpoint locally:

```bash
curl -H "Authorization: Bearer snp-cron-a7f2e9d4b1c3e8f0a2b5d7e9c1f3a5b7" \
  http://localhost:3000/api/cron/nova-prime
```

Then verify a row appears in `editorial_decisions` in Supabase.

---

## What was built in Phase 1

### Design system
- `tailwind.config.ts` — BLACKSITE_AMBER tokens (charcoal, amber, paper, severity, sector)
- `globals.css` — `.dark` as primary, drop-cap, Solari flip CSS, waveform bars
- `layout.tsx` — Newsreader + IBM Plex Mono loaded, dark-only ThemeProvider, NewsMediaOrganization JSON-LD

### Layout components
- `header.tsx` — wordmark (serif Safety + News + mono Pro), flat sector lens bar, inline search, Ask AI stub (Phase 5)
- `footer.tsx` — editorial provenance line, right-of-reply amber highlight, NOVA-PRIME active pulsing dot

### Homepage
- `hero-section.tsx` — editorial lede (left-aligned serif, amber accent), live enforcement stats block (right col)
- `page.tsx` — SolariTicker integrated, editorial section headings, NOVA-PRIME empty-state copy

### Core components
- `SolariTicker.tsx` — CSS 3D split-flap, Supabase Realtime INSERT subscription, 5 seed prosecutions
- `WaveformPlayer.tsx` — native HTML5 audio, pre-rendered peaks, chapter markers, speed cycling, mini mode

### Agent infrastructure
- `src/lib/agents/nova-prime.ts` — 8-step cycle, claude-opus-4-7, pence cost tracking
- `src/app/api/cron/nova-prime/route.ts` — GET handler, Bearer auth, 60s maxDuration
- `vercel.json` — `*/15 * * * *` cron schedule

### Database (Supabase project: hsownlzxiqhnstvaftqm)
- Migration: `safetynewspro_schema` applied 2026-05-10
- New tables: parties, regulations, prosecutions, incidents, sources, editorial_decisions, agent_runs, qa_sessions, right_of_reply_requests, podcast_episodes, search_log, editorial_picks, rate_limits
- articles extensions: 22 new columns (embedding vector(1536), byline, governance_signoff, audio_*, etc.)
- sector_stats materialised view
- Supabase write verified: agent_run ID `cd3f3285-2eb3-4f05-b724-6d2503aa707e`, editorial_decision ID `77a05358-4d6a-460a-992d-61fdd31ed068`

---

## Security advisory (pre-existing)

Supabase flagged 20 tables with RLS disabled — these are from other Royal projects (Pamela, Apex trading, Polymarket) and pre-date SafetyNews Pro. Not auto-remediated per advisory instructions. Review separately.

---

## Next: Phase 2 — Research + Editorial Swarms

Once ANTHROPIC_API_KEY is added and the live cron cycle confirmed:
- P2-T01: Court Watch agent — HSE press release scraper
- P2-T02: Legislation Tracker — legislation.gov.uk monitor
- P2-T03: Brief Writer + Drafter swarm  
- P2-T04: Governance Swarm + Defamation Guard
- P2-T05: First autonomous article published end-to-end
