# Spec — Bonita Frontend (Qwik): <APP_NAME>

> Specification for a Qwik frontend that consumes the Bonita REST API. Qwik's
> resumability suits high-concurrency BPM portals (many tasks, little JS per
> interaction). Filled by `/spec`, refined before any code. Inherits all rules
> from `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates).

## 1. Purpose & context

- What does this UI do, and for which users/roles? Why Qwik here (expected
  concurrency / payload constraints) instead of the team default (Vue/React)?
- Artifact type: task portal / task form / Living App page / standalone app.
- Rendering: static build for Bonita custom pages; SSR only if hosted outside
  Bonita (justify here).
- In/out of scope.

## 2. Stack

| Item | Value |
|------|-------|
| Framework | Qwik / Qwik City |
| Language | TypeScript (strict) |
| Build | Vite (static adapter for custom pages) |
| State | Signals (`useSignal`, `useStore`); serializable state only |
| Lint/format | ESLint + Prettier |
| Tests | Vitest (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based, `credentials: "include"` on every request.
- **CSRF**: every mutation sends `X-Bonita-API-Token` from the cookie. One typed API client module; components never call `fetch` directly.
- Qwik caveat: API calls run in the browser against the Bonita session — do
  **not** move session-bound calls into `server$`/SSR (the server has no user
  session). Document any exception here.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

## 4. Task / process context & contract

- Context from URL params (`id`, `taskId`, `app`); resolved through the context endpoint in a `routeLoader$`-equivalent client load.
- Contract submitted on completion (mirrors the process contract):

| Contract input | Type | Source | Validation |
|----------------|------|--------|------------|
| | | | |

## 5. Components & state

- Business logic in plain TS modules; components presentational. All stored state must be serializable (resumability constraint) — no class instances or functions in stores.
- Lazy boundaries (`component$`) aligned with interaction islands; avoid eager wakeups on first paint.
- Responsive at mobile/tablet/desktop; loading/empty/error states for every remote source.

## 6. Error handling

- 401 → session-expired flow; 403 → "not allowed" state; 400 on execution → field-level feedback.
- No raw API errors in the UI; no unhandled rejections.

## 7. Security

- No tokens in `localStorage`; session cookie only.
- Default JSX escaping (no `dangerouslySetInnerHTML` on API data).
- No secrets in the bundle or committed env files.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit (Vitest): TS modules and validation with real objects; names express the rule.
- Network: Bonita REST API is external — stub at the network edge only (msw / Playwright route interception). Never mock our own modules or components.
- E2E (Playwright): full task flow asserting the CSRF header on mutations, plus a resumability smoke check (interaction works without full-bundle load).
- Gates: ESLint + Prettier clean, Vitest green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] All mutations carry `X-Bonita-API-Token` (asserted in tests).
- [ ] No session-bound API call executed in SSR/server context.
- [ ] Task context resolved from URL params; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Tests + quality gates green; README with build/deploy instructions.
