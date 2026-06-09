# /plan — Architecture, ADRs and risks

Turn the approved spec into `.sdd/plan.md`.

## Arguments
- `$ARGUMENTS`: optional focus or constraints.

## Instructions
1. Read `.sdd/spec.md` and `.sdd/SDD.md`. Refuse to plan if the spec is incomplete.
2. Delegate to the matching lifecycle skill for domain rules:
   - connector / actor filter / event handler → **bonita-connector-lifecycle**
   - REST API → **bonita-rest-api-lifecycle**
   - process → **bonita-process-lifecycle**
   - BDM → **bonita-bdm** rules in `sdd-core-bonita.md`
   - upgrade → **bonita-upgrade-lifecycle**; audit → **bonita-audit-lifecycle**
3. Produce: component design, key decisions as short ADRs (context → decision → consequence), data/flow, risks + mitigations, and the test plan mapped to acceptance criteria.
4. List the quality gates that will apply (from `sdd-core-bonita.md` §7).
5. No code. Output is the plan only.
