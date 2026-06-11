# Spec — Bonita BDM: <MODEL_NAME>

> Specification for the Business Data Model (`bom.xml`). Filled by `/spec`,
> refined before any modelling. Inherits all rules from `sdd-core-bonita.md`
> (§3 BDM standard, §6 testing, §7 quality gates). Model in Bonita Studio
> (Manage BDM) or via the project's validated model-edit protocol.

## 1. Purpose & context

- Business domain covered; which processes/APIs consume it.
- In/out of scope; relation to external systems of record (the BDM is not a
  replica of an external database — document what is mastered where).

## 2. Entities

One block per business object:

| Entity | Purpose | Mastered by |
|--------|---------|-------------|
| | | |

Per entity, the field table:

| Field | Type | Mandatory | Length | Notes |
|-------|------|-----------|--------|-------|
| | | | | |

**Audit fields are mandatory on every entity** (per §3): creation/update
user + timestamp and the logical-delete flag (e.g. `auActivo` /
`recordStatus`). Hard deletes are forbidden.

## 3. Relationships

| From | To | Type (composition/aggregation) | Cardinality | Loading (lazy/eager) |
|------|----|-------------------------------|-------------|----------------------|
| | | | | |

Rules:
- Composition only when the child's lifecycle is fully owned by the parent.
- Default lazy; justify any eager load here.
- Model "versioned history" with linking fields (e.g. `previousX`) instead of
  overwriting or deleting records.

## 4. Queries

| Entity | Query | Params | Returns | countFor present? |
|--------|-------|--------|---------|-------------------|
| | | | | |

Rules (enforced by the commit quality gate):
- **Every `java.util.List` query has its `countFor` twin** (server-side pagination).
- Single-object / aggregate queries do not need one.
- Filter on indexed fields; add the index when introducing the query.
- No `findAll`-style unbounded queries into memory.
- Always filter logical-deleted records (`auActivo = true`) in business queries.

## 5. Indexes

| Entity | Index | Fields | Justified by query |
|--------|-------|--------|--------------------|
| | | | |

## 6. Access control

- BDM access control profile per entity/attribute where data is sensitive.
- The BDM REST API is consumed through pages/forms with proper permissions;
  document which attributes must never reach a browser.

## 7. Migration & versioning

- Schema changes are additive when possible; renames/drops require a
  data-migration note (target environments, downtime, rollback).
- Document the deployment order (BDM before processes that depend on it).

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks of our own code):
- Query tests against a **real database** (Bonita Test Toolkit runtime or
  Testcontainers): each custom query + its `countFor` agree on totals.
- Property tests (jqwik) on validation invariants (lengths, mandatory fields).
- Logical-delete behaviour tested, e.g.
  `archived_records_are_never_returned_by_active_queries`.
- Gates: all queries exercised by at least one test; coverage targets per §7.

## 9. Acceptance criteria

- [ ] Audit fields + logical delete on every entity.
- [ ] Every List query has its `countFor`; both tested for agreement.
- [ ] Indexes exist for every queried field; no unbounded queries.
- [ ] Sensitive attributes covered by access control and never exposed raw.
- [ ] Migration note written for any non-additive change.
