# SafetyNews Pro Build State

**Last updated:** 2026-05-10T00:00:00Z
**Last session ended:** bootstrap (first run)

## Current phase
Phase 0 — Decisions & Foundation
Phase status: in_progress

## Current task
- Task ID: P0-T01
- Description: Repo audit — produce docs/audit.md listing what's salvageable from the existing HSE_News_Reporter repo
- Started: 2026-05-10T00:00:00Z
- Status: awaiting_royal_signoff (7 Open Decisions block Phase 0 advancement)
- Blockers: All 7 Open Decisions in IMPLEMENTATION_PLAN_v2 §10 unresolved — Royal decision required before Phase 1

## Phase checkpoints completed
- [ ] Phase 0 — Decisions & foundation
- [ ] Phase 1 — Core infrastructure
- [ ] Phase 2 — Research + Editorial swarms
- [ ] Phase 3 — Public launch MVP
- [ ] Phase 4 — Production swarm
- [ ] Phase 5 — Distribution + Audience
- [ ] Phase 6 — Ops + polish + investigations

## Open decisions awaiting Royal
1. **Domain** — safetynews.pro / .uk / rebrand (The Enforcement / Hazard / The Standard / other)
2. **Editorial transparency** — full AI disclosure ("By NOVA-PRIME desk · Reviewed by Governance Swarm") vs softer framing
3. **Right-of-reply policy** — 24h pre-publish contact attempt vs post-publish portal only
4. **Investigation cadence** — monthly Opus-grade premium longform vs weekly lighter-weight volume
5. **Paywall model** — free + paid newsletter / freemium (tools gated) / fully free + sponsorships
6. **Geographical scope** — UK-only vs UK-primary + comparative international coverage
7. **Existing repo** — RESOLVED: SALVAGE (mission prompt says "integrating the current repo") — worktree branch extends the existing HSE_News_Reporter codebase

## Recent commits
- 5e099bc docs: Add comprehensive PRD for system completion
- 9aca556 feat(automation): Complete n8n workflow automation system v2.0.0
- 199406f feat(admin-pwa): scaffold auth, layout, and review stack
- aca36dd Initial commit: Complete HSE News platform with Admin PWA foundation

## Cost tracker (running totals)
- Anthropic API: £0.00 this month
- Claude Managed Agents: £0.00 this month
- Higsfield: £0.00 this month
- Other: £0.00 this month

## Active agents (production)
- None yet (Phase 0)

## Infrastructure checks (Phase 0)
- Ruflo: ✅ ruflo@3.7.0-alpha.20 confirmed on npm — lock this version in Phase 1

## Known issues / tech debt
- Next.js 14 in repo; spec requires Next.js 15 + React 19 — upgrade needed in Phase 1
- Design system: current blue/purple gradient must be replaced with BLACKSITE_AMBER tokens
- Typography: Inter only; must add Newsreader (editorial) + IBM Plex Mono (data)
- Database: existing schema (articles, categories, newsletter_subscribers, articles_queue) is partial; full SafetyNews Pro schema (prosecutions, parties, regulations, sources, editorial_decisions, agent_runs, etc.) needed in Phase 1
- Agent runtime: n8n currently used; must migrate to Ruflo + Claude Managed Agents
- Search: no Typesense integration yet
- Admin PWA: 85% complete per PRD — salvageable but needs redesign to control-room aesthetic (BLACKSITE_AMBER, dense terminal-style, Governance Swarm sign-off cards)
- AGENT_BRIEF.md and IMPLEMENTATION_PLAN_v2.md exist in main repo at `C:\Users\ADMIN\Desktop\HSE_News_Reporter\` but are named `SafetyNewsPro_AgentBrief.md` and `SafetyNewsPro_ImplementationPlan_v2.md` — copied to worktree root as canonical names

## Handoff note
N/A — first session.
