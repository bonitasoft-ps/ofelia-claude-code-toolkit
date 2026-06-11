# Spec — Bonita UI Builder (Appsmith): <APP_NAME>

> Specification for a UI Builder application (Appsmith-based, Bonita 2024.3+).
> Filled by `/spec`, refined before any code. Inherits all rules from
> `sdd-core-bonita.md` (§5 frontend, §6 testing, §7 quality gates). For deep
> guidance use the `bonita-uib-expert` skill and the
> `bonita-uibuilder-generator-toolkit`.

## 1. Purpose & context

- What does this app do, and for which users/roles?
- Why UI Builder instead of a coded SPA (speed, citizen-dev maintenance,
  built-in datasources)? Document the trade-off.
- Pages and navigation map (one row per page):

| Page | Purpose | Role(s) |
|------|---------|---------|
| | | |

## 2. Datasources & queries

- Bonita REST API is the primary datasource; external systems each get a named
  datasource (no inline URLs in widgets).

| Query | Datasource | Method/endpoint | Used by |
|-------|-----------|-----------------|---------|
| | | | |

Rules:
- **CSRF**: mutations through the Bonita datasource must carry
  `X-Bonita-API-Token`; verify the datasource/connector configuration injects it.
- Server-side pagination on every table (`p`/`c` params); never load full lists.
- No secrets in queries or JS Objects; credentials live in the datasource config.

## 3. JS Objects (shared logic)

- Business logic lives in **JS Objects**, reused across widgets — never
  duplicated per-widget bindings.

| JS Object | Responsibility |
|-----------|----------------|
| | |

- Keep bindings (`{{ }}`) one-line; anything longer goes into a JS Object function.

## 4. Widgets & layout

- Widget tree per page; dynamic bindings reference queries/JS Objects only.
- Loading, empty and error states for every data-bound widget.
- Responsive check at the three breakpoints; no fixed pixel layouts.

## 5. Custom widgets (only if needed)

- Custom (Angular/TS) widgets only when stock widgets cannot do the job —
  justify each one here. Scaffold them with the
  `bonita-uibuilder-generator-toolkit`; each custom widget gets its own tests.

| Custom widget | Why stock is not enough |
|---------------|-------------------------|
| | |

## 6. Error handling

- Query failure → user-visible state per widget (no silent empty tables).
- 401 → session-expired flow; 403 → "not allowed" page state.
- JS Object functions never swallow errors; surface via `showAlert`/status widgets.

## 7. Security

- Every page mapped to the Bonita profiles/roles that may see it.
- No client-side-only authorization: the REST layer (permissions) is the boundary.
- No secrets in exported app JSON; datasource credentials configured per environment.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names where applicable):
- **E2E (Playwright)** is the primary layer for UIB apps: login → navigate →
  act → verify, per role. Include the CSRF assertion on one mutation flow.
- Custom widgets: unit tests (Vitest/Jest) on their TS logic, no mocks of our own code.
- Export/import round-trip verified on a clean environment before delivery.
- Gates: Playwright green on every page/role; custom-widget unit tests green.

## 9. Acceptance criteria

- [ ] Every table paginated server-side; no full-list loads.
- [ ] All mutations carry the CSRF token.
- [ ] Logic centralized in JS Objects (no duplicated widget bindings).
- [ ] Every data-bound widget has loading/empty/error states.
- [ ] Page-role mapping enforced and tested per role.
- [ ] App export (JSON) versioned in git; import verified on clean env.
