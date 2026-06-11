# Spec — Bonita Frontend (Solid): <APP_NAME>

> Specification for a SolidJS frontend that consumes the Bonita REST API.
> Filled by `/spec`, refined before any code. Inherits all rules from
> `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates).

## 1. Purpose & context

- What does this UI do, and for which users/roles? Why Solid here (fine-grained
  reactivity / payload constraints) instead of the team default (Vue/React)?
- Artifact type: task execution form / process instantiation form / Living App
  page / standalone app.
- In/out of scope.

## 2. Stack

| Item | Value |
|------|-------|
| Framework | SolidJS 1.8+ (Solid Start only if SSR is justified) |
| Language | TypeScript (strict) |
| Build | Vite (static build for Bonita custom pages) |
| State | Signals / stores (`createSignal`, `createStore`); context for cross-tree |
| Lint/format | ESLint + Prettier |
| Tests | Vitest + @solidjs/testing-library (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based, `credentials: "include"` on every request.
- **CSRF**: every mutation sends `X-Bonita-API-Token` from the cookie. One typed API client module; components never call `fetch` directly.
- Data fetching with `createResource` wrapping the typed client (never raw fetch in components).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

## 4. Task / process context & contract

- Context from URL params (`id`, `taskId`, `app`); resolved through the context endpoint into a resource.
- Contract submitted on completion (mirrors the process contract):

| Contract input | Type | Source | Validation |
|----------------|------|--------|------------|
| | | | |

## 5. Components & state

- Business logic in plain TS modules and primitives (`createX` composables); JSX stays presentational.
- Mind Solid's no-re-render model: derive with memos (`createMemo`), don't copy signal values into locals.
- Responsive at mobile/tablet/desktop; loading/empty/error states (`Suspense` + `ErrorBoundary`) for every resource.

## 6. Error handling

- 401 → session-expired flow; 403 → "not allowed" state; 400 on execution → field-level feedback.
- `ErrorBoundary` per route; no raw API errors in the UI; no unhandled rejections.

## 7. Security

- No tokens in `localStorage`; session cookie only.
- Default JSX escaping (no `innerHTML` on API data).
- No secrets in the bundle or committed env files.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit (Vitest + testing-library): primitives and validation with real objects; names express the rule.
- Network: Bonita REST API is external — stub at the network edge only (msw / Playwright route interception). Never mock our own primitives or components.
- E2E (Playwright): full task flow asserting the CSRF header on mutations.
- Gates: ESLint + Prettier clean, Vitest green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] All mutations carry `X-Bonita-API-Token` (asserted in tests).
- [ ] Task context resolved from URL params; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Static build deployable as a Bonita custom page zip.
- [ ] Tests + quality gates green; README with build/deploy instructions.
