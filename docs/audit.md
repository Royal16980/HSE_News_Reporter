# SafetyNews Pro — Repo Audit

**Phase 0 Task 1**
**Audited:** 2026-05-10
**Verdict:** SALVAGE and extend (Decision 7 resolved)

---

## Summary

The existing HSE_News_Reporter codebase is 40–50% reusable as a technical foundation. It has solid architectural patterns (Next.js App Router, Supabase, shadcn/ui, ISR, Edge Runtime), a functional admin PWA skeleton, and a working article data model. What it lacks entirely is the SafetyNews Pro design language, the Ruflo/NOVA-PRIME agent layer, the full database schema (prosecutions, parties, regulations, editorial_decisions, agent_runs), and the bespoke UI components (Solari ticker, waveform player, D3 visualisations).

---

## Keep as-is

| File / module | Reason |
|---|---|
| `src/app/(api routes structure)` | Edge Runtime, ISR patterns are correct; routes need renaming/extension not replacement |
| `src/lib/supabase.ts` | Client instantiation pattern is correct |
| `src/lib/utils.ts` | Generic utilities (cn, formatDate, etc.) |
| `src/app/sitemap.ts` | Auto-generated sitemap; extend, don't replace |
| `src/app/robots.ts` | Fine as-is |
| `supabase/schema.sql` | Keep as base; add SafetyNews Pro tables on top in Phase 1 migration |
| `admin-pwa/src/lib/gestures/useSwipeGesture.ts` | Gesture hook is solid; reuse for approval queue |
| `admin-pwa/src/lib/gestures/usePullToRefresh.ts` | Good pull-to-refresh implementation |
| `admin-pwa/src/lib/offline-queue.ts` | IndexedDB/Dexie offline queue — keep |
| `admin-pwa/src/lib/haptics.ts` | Haptics wrapper — keep |
| `admin-pwa/src/stores/auth.ts` | Zustand auth store — keep |
| `admin-pwa/src/stores/articles.ts` | Zustand articles store — extend |
| `admin-pwa/src/stores/ui.ts` | Zustand UI store — extend |
| `admin-pwa/src/lib/api/articles.ts` | API layer — extend with SafetyNews Pro fields |
| `admin-pwa/src/lib/api/analytics.ts` | API layer — extend |
| `admin-pwa/src/lib/api/schedule.ts` | API layer — extend |
| `admin-pwa/src/lib/pwa.ts` | PWA init — keep |
| `components.json` | shadcn/ui config — keep |
| `tailwind.config.ts` | Extend with BLACKSITE_AMBER tokens; keep Tailwind base |
| `tsconfig.json` | Keep |
| `next.config.js` | Extend; add Next.js 15 config |

---

## Salvage with significant modification

| File / module | What changes |
|---|---|
| `src/app/layout.tsx` | Replace Inter with Newsreader + IBM Plex Mono; apply BLACKSITE_AMBER CSS vars |
| `src/app/globals.css` | Strip blue/purple gradient tokens; install BLACKSITE_AMBER design tokens |
| `src/app/page.tsx` | Full redesign — hero, Solari ticker, sector lenses, fatality clock, audio brief |
| `src/app/articles/[slug]/page.tsx` | Extend with drop caps, citation drawer, defendant sidebar, regulation chips, waveform |
| `src/components/layout/header.tsx` | Redesign to BLACKSITE_AMBER; add Ask AI sticky bar |
| `src/components/layout/footer.tsx` | Redesign; add right-of-reply portal link |
| `src/components/article/article-card.tsx` | Reskin to editorial aesthetic; add sparkline, governance badge |
| `src/components/article/article-content.tsx` | Extend with MDX, citation superscript chips, citation drawer |
| `src/components/ui/*.tsx` | Extend each shadcn primitive with BLACKSITE_AMBER variants |
| `src/types/database.ts` | Full rewrite to match SafetyNews Pro schema |
| `src/types/index.ts` | Extend |
| `admin-pwa/src/app/(dashboard)/review/page.tsx` | Redesign to control-room aesthetic; add Governance Swarm sign-off cards |
| `admin-pwa/src/app/(dashboard)/analytics/page.tsx` | Integrate page-complete.tsx; reskin to BLACKSITE_AMBER |
| `admin-pwa/src/app/(dashboard)/settings/page.tsx` | Complete implementation + reskin |
| `admin-pwa/src/components/review/ArticleCard.tsx` | Add 7-traffic-light Governance Swarm sign-off component |
| `admin-pwa/src/app/layout.tsx` | Apply BLACKSITE_AMBER dark theme |
| `admin-pwa/src/app/globals.css` | BLACKSITE_AMBER tokens |
| `package.json` | Upgrade Next.js 14 → 15, React 18 → 19; add: wavesurfer.js, d3, ruflo (when published) |
| `admin-pwa/package.json` | Same upgrades |

---

## Build from scratch (new)

| Module | Phase | Reason |
|---|---|---|
| `src/app/design-system/tokens.css` | P0 | BLACKSITE_AMBER colour + type tokens |
| `src/components/home/SolariTicker.tsx` | P1 | Split-flap prosecution board — no existing code |
| `src/components/audio/WaveformPlayer.tsx` | P1 | Custom waveform player — no existing code |
| `src/components/ask/AskAIOverlay.tsx` | P5 | Full-screen Q&A streaming overlay |
| `src/components/defendants/DefendantCard.tsx` | P2 | Sticky sidebar for named defendants |
| `src/components/regulations/RegChip.tsx` | P2 | Regulation citation chips |
| `src/components/home/SectorLenses.tsx` | P3 | Sector card reskins with bespoke SVG motifs |
| `src/components/home/FatalityClock.tsx` | P3 | Memorial fatality counter |
| `src/components/home/TrendingNow.tsx` | P3 | Velocity-scored sparkline cards |
| `src/components/charts/D3Timeline.tsx` | P4 | Defendant prosecution timeline |
| `src/components/charts/D3ViolinPlot.tsx` | P4 | Sector comparison violin plot |
| `src/app/defendants/[slug]/page.tsx` | P6 | Defendant profile pages |
| `src/app/regulations/[slug]/page.tsx` | P6 | Regulation plain-English pages |
| `src/app/sectors/[slug]/page.tsx` | P3 | Sector newsroom pages |
| `src/app/investigations/[slug]/page.tsx` | P6 | Magazine-style longform layout |
| `src/app/statistics/page.tsx` | P6 | Bloomberg-grade data dashboard |
| `src/app/tools/page.tsx` | P6 | Interactive H&S tools |
| `src/app/api/ask/route.ts` | P5 | Streaming RAG Q&A endpoint |
| `supabase/migrations/002_safetynewspro.sql` | P1 | Full SafetyNews Pro schema |
| `lib/agents/nova-prime.ts` | P0 | NOVA-PRIME hello-world cycle |
| `lib/agents/swarms/research/` | P2 | Hunter, Court Watch, Sector Scout, etc. |
| `lib/agents/swarms/editorial/` | P2 | Brief Writer, Drafter, Stylist, etc. |
| `lib/agents/swarms/governance/` | P2 | Source Verifier, Hallucination Detector |
| `lib/agents/swarms/production/` | P4 | Image Director, Podcast Producer, etc. |
| `lib/agents/swarms/distribution/` | P5 | Publisher, Newsletter Curator, etc. |
| `lib/agents/swarms/audience/` | P5 | Q&A Responder, Comment Moderator, etc. |
| `lib/agents/swarms/ops/` | P6 | SRE/Monitor, Cost Optimiser, etc. |
| `admin-pwa/src/components/swarm/SwarmDashboard.tsx` | P4 | Live swarm telemetry tiles |
| `admin-pwa/src/components/review/GovernanceCard.tsx` | P2 | 7-traffic-light sign-off card |
| `admin-pwa/src/app/(dashboard)/nova/page.tsx` | P4 | NOVA-PRIME chat panel |

---

## Discard

| File | Reason |
|---|---|
| `n8n-workflows/*.json` (all 7) | Being replaced by Ruflo + Claude Managed Agents. Keep as reference docs only. |
| `src/components/home/hero-section.tsx` | Full hero redesign; nothing reusable from generic blue gradient layout |
| `src/components/home/trending-topics.tsx` | Tag cloud; replacing with velocity-score sparkline cards |
| `src/components/home/newsletter-section.tsx` | Generic layout; new newsletter section will be sector-aware |
| `src/types/database.ts` | Current schema won't match SafetyNews Pro tables; full rewrite |

---

## Infrastructure status

| Resource | Status | Action |
|---|---|---|
| Vercel | Needs setup for SafetyNews Pro project | Phase 0 |
| Supabase | Project `hsownlzxiqhnstvaftqm` exists (per PRD env vars) | Extend schema in Phase 1 |
| Cloudflare R2 | Not yet provisioned | Phase 0 |
| Resend | Listed in stack; not yet configured | Phase 0 |
| Langfuse VPS (Hetzner £30/mo) | Not yet provisioned | Phase 0 |
| Typesense | Not yet provisioned | Phase 0 |
| Ruflo | Confirm `npm info ruflo` in Phase 0 |  |
| n8n | Running (n8n.srv1246730.hstgr.cloud per PRD) | Keep for RSS/email glue; agent work moves to Ruflo |

---

*Audit complete. Phase 0 Task 1 done. Blocked on 6 Open Decisions pending Royal sign-off.*
