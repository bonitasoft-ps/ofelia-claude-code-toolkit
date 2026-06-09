# Spec — Bonita Connector: <CONNECTOR_NAME>

> Specification for a Bonita custom connector. Filled by `/spec`, refined before
> any code. Inherits all rules from `sdd-core-bonita.md`. Reference patterns from
> the official `bonitasoft/bonita-connector-*` repos (read-only, do not modify).

## 1. Purpose & context

- What external system / capability does this connector expose?
- Which processes/tasks will use it?
- In/out of scope.

## 2. Definition (descriptor)

| Item | Value |
|------|-------|
| Connector id | `<id>` |
| Version | `1.0.0` |
| Category | |
| Maven archetype | official Bonita connector archetype |

## 3. Inputs

| Name | Type | Required | Default | Validation |
|------|------|----------|---------|------------|
| | | | | |

## 4. Outputs

| Name | Type | Description |
|------|------|-------------|
| | | |

## 5. Lifecycle behaviour (VALIDATE → CONNECT → EXECUTE → DISCONNECT)

- **VALIDATE**: required inputs, ranges, formats. Fail fast with clear messages.
- **CONNECT**: open client/session; set connect + read timeouts; auth strategy.
- **EXECUTE**: the actual call; map errors to typed outputs; retry policy (if any).
- **DISCONNECT**: always close/release in `finally`; never leak resources.

## 6. Error handling

- Expected failures → connector output (status + message), do not throw.
- Unexpected → `ConnectorException` with cause; no secrets in messages/logs.
- Timeouts explicit; no infinite waits.

## 7. Security

- Credentials via process parameters / vault, never hardcoded.
- TLS verification on; no disabling cert checks.
- Log inputs/outputs at DEBUG only, with secrets redacted.

## 8. Testing plan

Follow `sdd-core-bonita.md` §6 (business-rule names, no mocks by default):
- Unit: VALIDATE rules and EXECUTE branches against the real connector with real
  inputs / in-memory fakes. Test names express the rule, e.g.
  `should_release_connection_when_remote_call_times_out`.
- Property: fuzz inputs (jqwik) for validation invariants.
- Integration: against a WireMock **stub** of the external system (it is not ours),
  asserting real lifecycle resource release.
- No Mockito unless justified at a true external boundary nothing else can cover.
- Gates: JaCoCo ≥80%, PIT ≥80%.

## 9. Acceptance criteria

- [ ] All inputs validated; invalid input never reaches the external call.
- [ ] Resources released on every path (success/failure/timeout).
- [ ] Errors surfaced as outputs, not unhandled exceptions.
- [ ] Tests + quality gates green.
- [ ] README + usage example in process documented.
