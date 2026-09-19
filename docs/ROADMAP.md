# API roadmap (`bet-api-node`)

One **Active** item at a time. Ship API without Flutter when you don’t need new app fields.

**Updated:** 2026-09-18

---

## Depends on

| API depends on | How | Currently |
|----------------|-----|-----------|
| Core | npm package `bet-core-node` | `^1.6.13` |
| MongoDB | shared match / sync data | — |
| Hosting (Render) | deploy + cron sync | — |

**Who waits on the API:** Flutter (calls `/matches`, `/match`, `/settings` over HTTPS).

**Not always a chain:** platform work here (deploy config, job messages, caching) needs **no** Core change, and Flutter UI-only work needs **no** API change.

---

## Active

_None_

---

## Next

| ID | Item | Depends on |
|----|------|------------|
| A1 | Bump to Core **1.6.13** + redeploy (DC draw = win + `predictions.outcome` on list/detail) | Core 1.6.13 on npm |
| A2 | **Weekly KPIs report** endpoint — easy weekly read | Core C5 |
| A3 | Smoke-test `/match` returns `predictions.why` | Core C3 |

---

## Later — when Core adds API-Football extras

| ID | Item | Depends on |
|----|------|------------|
| A10 | Ensure `/match` exposes H2H / injuries / odds / second-opinion fields | Core AF2–AF5 |
| A11 | Avoid new heavy sync routes — prefer data on the match document | — |

---

## Nice to have

| ID | Item | Depends on |
|----|------|------------|
| N1 | Cache weekly KPIs if something polls often | A2 |
| N2 | Clearer manual-sync / job status messages | — |

---

## Done

| ID | Note |
|----|------|
| — | Serves sync + accuracy; `/match` full doc for detail (2026-09-15) |
