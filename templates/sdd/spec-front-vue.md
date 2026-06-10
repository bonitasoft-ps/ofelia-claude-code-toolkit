# Spec — Bonita Frontend (Vue 3): <APP_NAME>

> Specification for a Vue 3 frontend that consumes the Bonita REST API (task
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
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript (strict) |
| Build | Vite |
| State | Pinia (only if state is shared across components) |
| Lint/format | ESLint + Prettier |
| Tests | Vitest (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based (`JSESSIONID`), `credentials: "include"` on every
  request. The app never stores credentials.
- **CSRF**: every mutation (POST/PUT/DELETE) sends the `X-Bonita-API-Token`
  header read from the `X-Bonita-API-Token` cookie. Centralized in one typed
  API client module; widgets/components never call `fetch` directly.
- **Typed client**: one function per endpoint with typed request/response
  interfaces. Endpoints used:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

- Minimize network round-trips: batch context loads, no per-component
  duplicate calls, lazy-load data not needed at first paint.

## 4. Task / process context & contract

- Context inputs read from the URL (`id`, `taskId`, `app` query params injected
  by Bonita) and resolved through the context endpoint.
- Contract submitted on completion (exact shape mirrors the process contract):

| Contract input | Type | Source (form field / computed) | Validation |
|----------------|------|-------------------------------|------------|
| | | | |

- Client-side validation mirrors the contract constraints but is **not** the
  security boundary; the process contract remains authoritative.

## 5. Components & state

- Component tree and responsibilities (presentation separated from business
  logic: API access and rules live in composables/stores, not in templates).
- Responsive layout verified at mobile/tablet/desktop breakpoints.
- Loading, empty and error states defined for every remote data source.

## 6. Error handling

- 401 → session expired: show re-login guidance, never silently retry.
- 403 → clear "not allowed" state, no raw API error shown.
- Contract violation (400 on execution) → map engine messages to field-level
  feedback.
- Network failures: user-visible retry, no unhandled promise rejections.

## 7. Security

- No tokens or credentials in `localStorage`; session cookie only.
- All user-rendered data bound via Vue templating (no `v-html` on API data).
- No secrets in the bundle or env files committed to the repo.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit (Vitest): composables and validation rules with real objects. Test names
  express the business rule, e.g.
  `should_block_submission_when_a_required_contract_input_is_empty`,
  `expired_session_redirects_to_login_instead_of_retrying`.
- Network: the Bonita REST API is an external system, so stub it at the
  network edge only (e.g. msw or Playwright route interception). Never mock
  our own composables, stores or components.
- Property (fast-check): validation invariants on form inputs.
- E2E (Playwright): full flow against a running Bonita (login → open task →
  fill form → submit → verify case state), including the CSRF header on
  mutations.
- Gates: ESLint + Prettier clean, Vitest green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] All mutations carry the `X-Bonita-API-Token` header (asserted in tests).
- [ ] Task context resolved from URL params; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Responsive at the three breakpoints; no business logic in templates.
- [ ] Tests + quality gates green; README with build/deploy instructions.
