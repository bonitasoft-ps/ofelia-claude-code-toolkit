# Spec — Bonita Frontend (Angular): <APP_NAME>

> Specification for an Angular frontend that consumes the Bonita REST API.
> Filled by `/spec`, refined before any code. Inherits all rules from
> `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates).

## 1. Purpose & context

- What does this UI do, and for which users/roles?
- Artifact type: task execution form / process instantiation form / Living App
  page / standalone app / UI Builder custom widget host.
- Target Bonita version and deployment.
- In/out of scope.

## 2. Stack

| Item | Value |
|------|-------|
| Framework | Angular 17+ (standalone components, **Signals** for state) |
| Language | TypeScript (strict) |
| Build | Angular CLI / esbuild |
| State | Signals + services; no NgRx unless complexity demands it (justify here) |
| Lint/format | ESLint + Prettier |
| Tests | Vitest or Karma→Jest migration noted here (unit) + Playwright (E2E) |

## 3. Bonita REST API integration

- **Session**: cookie-based, `withCredentials: true` on every `HttpClient` call.
- **CSRF**: an `HttpInterceptor` adds `X-Bonita-API-Token` (from cookie) to every mutation. Components never build headers by hand.
- **Typed client**: one injectable `BonitaApiService` per domain, typed request/response models:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/API/system/session/unusedid` | session check |
| GET | `/API/bpm/userTask/{taskId}/context` | task context |
| POST | `/API/bpm/userTask/{taskId}/execution` | submit task contract |
| | | |

## 4. Task / process context & contract

- Context from URL params (`id`, `taskId`, `app`) via the Router; resolved through the context endpoint (route resolver preferred).
- Contract submitted on completion (mirrors the process contract):

| Contract input | Type | Source | Validation |
|----------------|------|--------|------------|
| | | | |

- Reactive Forms with validators mirroring the contract; the process contract remains the security boundary.

## 5. Components & state

- Standalone components; presentation separated from business logic (services own API access and rules; templates stay declarative).
- Signals for local/derived state; `computed()` over manual subscriptions; `toSignal()` at the HttpClient boundary.
- Responsive at mobile/tablet/desktop; loading/empty/error states for every remote source.

## 6. Error handling

- Central error interceptor: 401 → session-expired flow; 403 → "not allowed" state; 400 on execution → field-level mapping to form controls.
- No raw API errors in the UI; no unhandled rejections (global `ErrorHandler`).

## 7. Security

- No tokens in `localStorage`; session cookie only.
- Template binding only (no `innerHTML` on API data; rely on Angular sanitization).
- No secrets in the bundle or committed env files.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Unit: services and validators with real instances (`TestBed` with real providers; in-memory fakes for our own collaborators only when unavoidable and justified).
- Network: Bonita REST API is external — stub with `HttpTestingController` or msw at the network edge. Never mock our own services/components.
- E2E (Playwright): full task flow asserting the CSRF header on mutations.
- Gates: ESLint + Prettier clean, unit green, Stryker ≥80%, Playwright green.

## 9. Acceptance criteria

- [ ] Interceptor adds `X-Bonita-API-Token` to every mutation (asserted in tests).
- [ ] Task context resolved via resolver; submission fulfills the contract.
- [ ] Invalid form state can never trigger a submission call.
- [ ] 401/403/400 each produce their defined user-visible state.
- [ ] Responsive; no business logic in templates.
- [ ] Tests + quality gates green; README with build/deploy instructions.
