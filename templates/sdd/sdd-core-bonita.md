# SDD Core — Bonita project

> Architectural contract for any Bonita artifact in this repository.
> The SDD rail (`/spec`, `/plan`, `/tasks`) and the lifecycle skills read this
> as the source of truth. Keep it short, factual and enforced by quality gates.

## 1. Platform & toolchain

| Item | Value (fill in) |
|------|-----------------|
| Bonita version | e.g. `2024.2` / `7.15.x` |
| Java | 17 (Studio 2023+) / 11 (legacy 2021) |
| Build | Maven, official Bonita archetypes only |
| Namespace | `jakarta.*` (2023+) / `javax.*` (legacy) |
| Test Toolkit | 3.1.x |

Dependencies: use the **official Maven archetypes** for every extension point.
No hand-rolled poms. Pin versions; no `LATEST`/`RELEASE`.

## 2. Scripts: Groovy vs Java

- **Groovy** only for short, side-effect-free expressions (mapping, defaults,
  conditions). No I/O, no network, no shared state.
- **Java** mandatory for: connectors, REST API extensions, actor filters, event
  handlers, and any logic with side effects, branching, or that needs tests.

## 3. BDM standard

Every business object carries audit fields (non-negotiable):

| Field | Type | Notes |
|-------|------|-------|
| `persistenceId` | Long | native, do not redefine |
| `createdBy` | String | user id |
| `creationDate` | OffsetDateTime | |
| `updatedBy` | String | |
| `lastUpdateDate` | OffsetDateTime | |
| `recordStatus` | String/enum | ACTIVE / ARCHIVED / DELETED |

Rules: index fields used in queries; collection queries (`java.util.List`) MUST
have a `countFor` counterpart; never `findAll` large objects into memory; page
all list queries.

## 4. Java extension points

| Point | Pattern |
|-------|---------|
| Connector | lifecycle VALIDATE → CONNECT → EXECUTE → DISCONNECT; explicit timeouts; pooled/closeable resources in DISCONNECT; typed inputs/outputs |
| REST API Extension | thin `RestApiController` → service → DTO; explicit HTTP status; permissions in `page.properties`; OpenAPI documented; never leak stack traces |
| Actor Filter | deterministic, no heavy queries; cache org lookups |
| Event Handler | idempotent; never block the engine thread; offload heavy work |

Cross-cutting: explicit exception handling (no empty catch), structured logging
(no `printStackTrace`), no secrets in code, input validation at boundaries.

## 5. Frontend (consumes Bonita REST API)

Base: session/cookie handling, CSRF token on mutations, task/process context
handling, typed API client. One of: React (Vite) · Vue 3 (Pinia) ·
Angular (Signals) · Svelte/SvelteKit · Qwik. See `spec-front-*` templates.

## 6. Testing strategy

| Layer | Tools |
|-------|-------|
| Unit (Java) | JUnit 5 + AssertJ, `should_X_when_Y()` |
| Property | jqwik (Java) / fast-check (JS) |
| Integration / process | Bonita Test Toolkit 3.1.x (`*IT.java`, Failsafe) |
| Frontend unit | Vitest / Jest |
| E2E | Playwright against running Bonita |

### 6.1 Test naming — the business rule, not the implementation

The test name must be **more abstract than its body**. Describe the business
rule the test protects, never the code it calls. The reader should understand
the rule without reading the body.

- Bad: `should_return_false_when_validate_called`, `test_executeMethod`
- Good: `should_reject_invoice_when_total_exceeds_credit_limit`,
  `archived_records_are_never_returned_by_active_query`

### 6.2 No mocks by default

Do **not** mock. Mocks couple the test to the implementation and pass even when
the real collaboration is broken. Prefer, in this order:

1. **Real objects** — call the real class with real inputs.
2. **In-memory fakes** — a real working implementation (in-memory repo, fake clock).
3. **Bonita Test Toolkit** — exercise the real engine for process/API/BDM tests.
4. **Testcontainers** — real database for BDM/persistence.
5. **Stub server** (e.g. WireMock) only for a third-party HTTP system you don't own.

Mockito is allowed **only** as a last resort, at a true external boundary that
none of the above can cover, and the spec/plan must justify it explicitly. A PR
that adds mocks for code we own is rejected in review.

## 7. Quality gates (10/10 — enforced in CI)

- Coverage (JaCoCo) ≥ 80%
- Mutation (PIT / Stryker) ≥ 80%
- Static analysis: Checkstyle + PMD + SpotBugs (Java), ESLint + Prettier (front)
- OWASP dependency-check, no critical CVEs
- JavaDoc on public methods; README per module; OpenAPI for REST
- Conventional commits; branch `claude/<type>/<desc>`; PR via `gh`, never push to main

## 8. Definition of Done

spec approved → plan + ADRs → tasks → implemented to standards above → all test
layers green → quality gates pass → multi-agent review clean → docs updated →
packaged (`.bar`/jar) → delivered.
