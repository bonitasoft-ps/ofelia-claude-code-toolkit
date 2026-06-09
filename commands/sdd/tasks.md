# /tasks — Break the plan into actionable tasks

Generate `.sdd/tasks.md` from the approved plan.

## Arguments
- `$ARGUMENTS`: optional granularity hint.

## Instructions
1. Read `.sdd/plan.md` and `.sdd/spec.md`.
2. Produce an ordered, checkable task list. Each task: small, independently verifiable, with the acceptance criterion it satisfies.
3. Every implementation task is paired with its test task. Tests follow the testing rules in `sdd-core-bonita.md` §6:
   - Test names express the **business rule**, not the implementation.
   - **No mocks** by default: prefer real objects, in-memory fakes, Bonita Test Toolkit (real engine), testcontainers, or a stub HTTP server for external systems.
4. Add explicit quality-gate tasks: coverage ≥80%, mutation ≥80%, static analysis, OWASP, docs.
5. End with the Definition of Done checklist (§8).
6. Do not start implementing unless the user approves the task list.
