# Spec — Bonita Frontend (React): <APP_NAME>

> Specification for a React frontend that consumes the Bonita REST API (task
> form, process instantiation form, or Living Application page). Filled by
> `/spec`, refined before any code. Inherits all rules from
> `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates).

## 1. Purpose & context

- What does this UI do, and for which users/roles?
- Artifact type: task execution form / process instantiation form / Living App
  page / standalone app. Note: execution forms are not limited to Human Tasks.
- Target Bonita version and deployment (custom page zip / external hosting).
- In/out of scope.

## 2. Stack

| Item | Value |
|------|-------|
| Framework | React 18+ (function components, hooks) |
| Language | TypeScript (strict) |
| Build | Vite |
| State | Local state + context; a store (e.g. Zustand) only if shared across trees |
| Styling | Tailwind CSS (default for Living Apps) |
| Lint/format | ESLint + Prettier |
| Tests | Vitest + Testing Library (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based (`JSESSIONID`), `credentials: "include"` on every request. Never store credentials.
- **CSRF**: every mutation (POST/PUT/DELETE) sends the `X-Bonita-API-Token` header read from the cookie. Centralized in one typed API client module; components never call `fetch` directly.
- **Typed client**: one function per endpoint with typed request/response interfaces:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

- Minimize round-trips: batch context loads, no duplicate per-component calls, lazy-load below the fold.

## 4. Task / process context & contract

- Context inputs read from the URL (`id`, `taskId`, `app` query params injected by Bonita) and resolved through the context endpoint.
- Contract submitted on completion (mirrors the process contract exactly):

| Contract input | Type | Source (field / computed) | Validation |
|----------------|------|---------------------------|------------|
| | | | |

- Client-side validation mirrors contract constraints but is **not** the security boundary.

## 5. Components & state

- Component tree and responsibilities; business logic in custom hooks, never in JSX.
- Data fetching isolated in hooks (`useTaskContext()`, `useSubmitTask()`); components stay presentational.
- Responsive at mobile/tablet/desktop breakpoints.
- Loading, empty and error states defined for every remote data source.

## 6. Error handling

- 401 → session expired: re-login guidance, never silent retry.
- 403 → clear "not allowed" state, no raw API error shown.
- Contract violation (400 on execution) → field-level feedback.
- Network failures: visible retry; no unhandled promise rejections (error boundaries at route level).

## 7. Security

- No tokens/credentials in `localStorage`; session cookie only.
- All user-rendered data through JSX escaping (no `dangerouslySetInnerHTML` on API data).
- No secrets in the bundle or committed env files.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit (Vitest + Testing Library): custom hooks and validation rules with real objects. Names express the rule, e.g. `should_block_submission_when_a_required_contract_input_is_empty`.
- Network: the Bonita REST API is external — stub at the network edge only (msw / Playwright route interception). Never mock our own hooks or components.
- Property (fast-check): validation invariants on form inputs.
- E2E (Playwright): login → open task → fill → submit → verify case state, asserting the CSRF header on mutations.
- Gates: ESLint + Prettier clean, Vitest green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] All mutations carry `X-Bonita-API-Token` (asserted in tests).
- [ ] Task context resolved from URL params; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Responsive at the three breakpoints; no business logic in JSX.
- [ ] Tests + quality gates green; README with build/deploy instructions.
