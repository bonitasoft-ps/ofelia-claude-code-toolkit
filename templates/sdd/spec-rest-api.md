# Spec — Bonita REST API Extension: <API_NAME>

> Specification for a Bonita REST API extension. Filled by `/spec`, refined before
> any code. Inherits all rules from `sdd-core-bonita.md` (§4 REST API Extension,
> §6 testing, §7 quality gates). Built from the official REST API extension
> Maven archetype, never a hand-rolled pom.

## 1. Purpose & context

- What capability does this API expose, and to which consumers (UI Designer
  pages, UI Builder, external clients)?
- Why a REST extension and not BDM REST or an out-of-the-box API?
- In/out of scope.

## 2. Definition (`page.properties`)

| Item | Value |
|------|-------|
| Page name | `custompage_<name>` |
| Content type | `apiExtension` |
| API extension name | `<name>` |
| Path templates | `<resource>`, `<resource>/{id}` |
| Permissions | `<custom_permission>` declared per resource (see §7) |

## 3. API contract

One row per endpoint. Every endpoint documented in OpenAPI (`openapi.yaml`
shipped with the page); the contract below is the source of truth.

| Method | Path | Query / path params | Request DTO | Response DTO | Success | Errors |
|--------|------|---------------------|-------------|--------------|---------|--------|
| GET | `/API/extension/<name>/<resource>` | `p`, `c`, filters | n/a | `List<XDto>` + `Content-Range` | 200 | 400, 403, 500 |
| GET | `/API/extension/<name>/<resource>/{id}` | `id` (long > 0) | n/a | `XDto` | 200 | 400, 403, 404, 500 |
| POST | `/API/extension/<name>/<resource>` | n/a | `CreateXRequest` | `XDto` | 201 | 400, 403, 409, 500 |

Rules:
- List endpoints are **always paged** (`p`/`c` params, `Content-Range` header).
- HTTP status codes are **explicit** in the controller response, never implicit.
- Breaking contract changes require a new version, not a silent change.

## 4. DTOs

| DTO | Direction | Fields | Validation |
|-----|-----------|--------|------------|
| `CreateXRequest` | in | | not-null, ranges, formats at the boundary |
| `XDto` | out | | never expose BDM entities or engine objects directly |

DTOs are immutable (Java 17 records). Serialization via the archetype's JSON
mapper. Input DTOs validate themselves on construction or in a dedicated
validator; invalid input never reaches the service layer.

## 5. Behaviour

- **Thin controller**: `RestApiController` only parses/validates the request,
  delegates to a service, and maps the result to a response with an explicit
  status. No business logic, no engine calls in the controller.
- **Service layer**: owns business logic and engine/BDM access (`APIClient`,
  DAO lookups). Pure Java, fully testable without HTTP.
- IDs are `long`/`Long`: validate not-null **and** `> 0` before any lookup.
- No state held between requests; the controller is stateless and thread-safe.

## 6. Error handling

- Expected failures map to explicit statuses: validation → 400, missing
  resource → 404, permission → 403, conflict → 409.
- Error responses use a stable JSON body: `{ "error": <code>, "message": <safe text> }`.
- **Never leak stack traces or internal details** to the client. Log the full
  cause server-side (SLF4J), return a safe message.
- No empty catch blocks; unexpected errors → 500 with cause logged.

## 7. Security

- Every resource mapped to a permission in `page.properties`; verify the
  mapping is also declared in `custom-permissions-mapping.properties` on the
  target environment.
- Authorization is enforced server-side per request, never assumed from the UI.
- Validate and bound all inputs (OWASP: injection, mass assignment via DTOs,
  no dynamic queries from raw input).
- No secrets in code or logs; request/response bodies logged at DEBUG only,
  with sensitive fields redacted.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks by default):
- Unit: service rules with real objects / in-memory fakes (fake DAO, fake
  clock). Test names express the rule, e.g.
  `should_return_404_when_requested_record_does_not_exist`,
  `archived_records_are_excluded_from_the_listing`.
- Controller: full request-to-response flow asserting explicit status codes,
  headers (`Content-Range`) and error bodies.
- Property: jqwik on input validation invariants (ids, pagination bounds).
- Integration: `*IT.java` (Failsafe) against a real Bonita runtime with the
  extension deployed; permissions verified with an unauthorized user.
- Mockito only at a true external boundary, justified in this spec.
- Gates: JaCoCo ≥80%, PIT ≥80%, OpenAPI in sync with the contract table.

## 9. Acceptance criteria

- [ ] Every endpoint returns the explicit statuses of §3, verified by tests.
- [ ] Invalid input (including ids ≤ 0) never reaches the service/engine.
- [ ] Unauthorized calls rejected with 403; permissions declared in `page.properties`.
- [ ] No stack trace or internal detail ever reaches a client response.
- [ ] List endpoints paged with `Content-Range`.
- [ ] OpenAPI document matches the implemented contract.
- [ ] Tests + quality gates green; README + deployment notes updated.
