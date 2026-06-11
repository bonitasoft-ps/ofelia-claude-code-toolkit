# Spec — Bonita Frontend (Svelte): <APP_NAME>

> Specification for a Svelte/SvelteKit frontend that consumes the Bonita REST
> API. Filled by `/spec`, refined before any code. Inherits all rules from
> `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates).

## 1. Purpose & context

- What does this UI do, and for which users/roles?
- Artifact type: task execution form / process instantiation form / Living App
  page / standalone app.
- Rendering mode: SPA (static adapter) for custom pages; SSR only for
  standalone hosting (justify here — Bonita custom pages are served statically).
- In/out of scope.

## 2. Stack

| Item | Value |
|------|-------|
| Framework | Svelte 5 (runes) / SvelteKit |
| Language | TypeScript (strict) |
| Build | Vite (adapter-static for custom pages) |
| State | Runes (`$state`, `$derived`); stores only for cross-route state |
| Lint/format | ESLint + Prettier |
| Tests | Vitest (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based, `credentials: "include"` on every request.
- **CSRF**: every mutation sends `X-Bonita-API-Token` from the cookie. One typed API client module (`src/lib/api/`); components never call `fetch` directly.
- **Typed client** endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

## 4. Task / process context & contract

- Context from URL params (`id`, `taskId`, `app`) in `load`/page params; resolved through the context endpoint.
- Contract submitted on completion (mirrors the process contract):

| Contract input | Type | Source | Validation |
|----------------|------|--------|------------|
| | | | |

## 5. Components & state

- Business logic in plain TS modules under `src/lib/` (testable without the DOM); `.svelte` files stay presentational.
- `$derived` over manual recomputation; no API calls inside components.
- Responsive at mobile/tablet/desktop; loading/empty/error states for every remote source.

## 6. Error handling

- 401 → session-expired flow; 403 → "not allowed" state; 400 on execution → field-level feedback.
- No raw API errors in the UI; `handleError` hook for unexpected failures.

## 7. Security

- No tokens in `localStorage`; session cookie only.
- Default Svelte escaping (no `{@html}` on API data).
- No secrets in the bundle or committed env files.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit (Vitest): `src/lib/` logic and validation with real objects. Names express the rule.
- Network: Bonita REST API is external — stub at the network edge only (msw / Playwright route interception). Never mock our own modules or components.
- Property (fast-check): validation invariants.
- E2E (Playwright): full task flow asserting the CSRF header on mutations.
- Gates: ESLint + Prettier clean, Vitest green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] All mutations carry `X-Bonita-API-Token` (asserted in tests).
- [ ] Task context resolved from URL params; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Static build deployable as a Bonita custom page zip.
- [ ] Tests + quality gates green; README with build/deploy instructions.
