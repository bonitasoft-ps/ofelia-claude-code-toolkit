# Spec — Bonita Process (BPMN): <PROCESS_NAME>

> Specification for a BPMN process (`.proc`). Filled by `/spec`, refined before
> any modelling. Inherits all rules from `sdd-core-bonita.md` (§2 process,
> §3 scripts, §6 testing, §7 quality gates). Model in Bonita Studio (or via the
> validated model-edit protocol if the project defines one).

## 1. Purpose & context

- Business goal of the process; trigger (who/what starts it).
- Actors and lanes:

| Lane | Actor / role | Responsibility |
|------|--------------|----------------|
| | | |

- In/out of scope; related processes (call activities, signals).

## 2. Flow

- Happy path narrative (start → end) in 5-10 lines.
- Gateways — every branch documented:

| Gateway | Type | Condition (business rule) | Branches |
|---------|------|---------------------------|----------|
| | XOR/AND/OR | | |

- Events: timers, messages, signals, error events; what fires them and what
  happens on the deadline path.

## 3. Data

- **Business variables** (BDM-backed) vs **process variables** (transient):

| Variable | Kind | Type | Written by | Read by |
|----------|------|------|-----------|---------|
| | | | | |

- Per-task data mutations (C/R/U/D — logical delete only) for every task that
  touches the BDM. Keep this table in sync with the BDM spec.
- Clean up transient variables; do not accumulate state in process variables
  that belongs in the BDM.

## 4. Contracts

- Instantiation contract + each task contract (the security boundary):

| Contract (task) | Input | Type | Constraint |
|-----------------|-------|------|------------|
| | | | |

- Complex types defined as contract structures; constraints expressed in the
  contract, not only in forms.

## 5. Connectors & integrations

- One row per connector (standard REST connectors against middleware preferred;
  custom Java connectors get their own `spec-connector.md`):

| Task | Connector | Target | Failure policy |
|------|-----------|--------|----------------|
| | | | retries / FAILED + audit event |

- Connector failures must leave a trace (e.g. audit/event record) and never
  lose the case silently.

## 6. Scripts (Groovy)

- Groovy only for short, side-effect-free expressions (per §3). List every
  script with its purpose; anything beyond a mapping/condition becomes Java or
  a connector:

| Location | Purpose | Why Groovy is acceptable here |
|----------|---------|-------------------------------|
| | | |

## 7. Actors & assignment

- Actor mapping per lane (org group/role); actor filters (if any) get their own
  spec. No hardcoded user names.

## 8. Testing plan (Bonita Test Toolkit 3.1.x)

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks — real engine):
- `*IT.java` (Failsafe) covering: happy path end-to-end, **every gateway
  branch**, timer/deadline paths, connector failure path (against a network
  stub of the external system).
- Assert business outcomes (case state, BDM records, audit fields), not
  implementation details.
- Names express the rule, e.g.
  `rejected_request_notifies_requester_and_archives_the_case`.
- Gates: suite green on a clean runtime; no flaky waits (use Toolkit awaits).

## 9. Acceptance criteria

- [ ] Every gateway branch has a test; happy path green end-to-end.
- [ ] Contracts validate at the boundary (invalid input never starts/advances a case).
- [ ] Connector failures leave an auditable trace and a recoverable case state.
- [ ] No business logic hidden in Groovy beyond §6's table.
- [ ] Actor mapping by org structure; deployable `.bar` builds from CI.
