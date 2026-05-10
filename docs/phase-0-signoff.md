# Phase 0 Sign-off — SafetyNews Pro

**Signed off:** 2026-05-10
**Signed by:** Royal Odonkor

## Decisions resolved

| # | Decision | Resolution |
|---|---|---|
| 1 | Domain | `safetynews.pro` |
| 2 | Editorial transparency | Full disclosure: "By NOVA-PRIME desk · Reviewed by Governance Swarm" on every article |
| 3 | Right-of-reply policy | Post-publish portal only at launch; migrate to hybrid (pre-publish for investigations) in Phase 6 |
| 4 | Investigation cadence | Weekly volume (~4–6/mo); quarterly KAI-grade tent-poles |
| 5 | Paywall model | Freemium — articles free, tools gated (compliance gap scanner, defendant export) |
| 6 | Geographical scope | UK-primary with comparative international in investigations; International Monitor agent scoped to context, not primary coverage |
| 7 | Existing repo | SALVAGE — extend HSE_News_Reporter codebase |

## Infrastructure status
- Vercel: project setup pending (Phase 1)
- Supabase: `hsownlzxiqhnstvaftqm` — extending with SafetyNews Pro schema
- Cloudflare R2: pending (Phase 1)
- Resend: pending (Phase 1)
- Langfuse VPS (Hetzner): pending (Phase 1)
- Typesense: pending (Phase 1)
- Ruflo: ✅ `ruflo@3.7.0-alpha.20` confirmed

## Design tokens
- Base: `#0A0A0B` charcoal
- Primary: `#FFA51F` BLACKSITE_AMBER
- Editorial paper: `#F2EFEA` off-white
- Typography: Newsreader (editorial body), Inter (UI), IBM Plex Mono (data)

## First NOVA-PRIME cycle
Pending Phase 1 implementation.

## Phase 1 entry condition: SATISFIED
