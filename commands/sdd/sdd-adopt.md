# /sdd-adopt — Reverse-engineer an SDD for an existing project

Generate the SDD artifacts for a project that already exists, without changing
any source code.

## Arguments
- `$ARGUMENTS`: optional area to focus on.

## Instructions
1. **Read-only scan first.** Inspect: `pom.xml` / `bonita-project.yml` / `package.json`, `bdm/bom.xml`, `.proc` files, REST extensions, connectors, tests. Do not edit source.
2. Create `.sdd/SDD.md` reflecting the project's ACTUAL state (versions, subtype, structure) on top of the `sdd-core-bonita.md` template.
3. Create `.sdd/spec.md` reconstructed from the code's observable behaviour.
4. Produce a **gap report** `.sdd/gaps.md`: where the project diverges from the standard (missing audit fields, mocks in tests, low coverage, Groovy doing Java's job, missing timeouts, no OpenAPI, etc.), ranked by severity. Reuse **bonita-audit-lifecycle** rules where available.
5. Propose a `.sdd/plan.md` to close the gaps. The user decides what to apply; nothing is modified automatically.
6. **Learning loop.** If the scan reveals a reusable insight not yet in the SDD templates (a rule this project needed that `sdd-core-bonita.md` lacks, a recurring gap pattern, a project-local `.sdd` improvement worth standardizing), and the `propose_learning` MCP tool is available, call it (category: `pattern` or `norm`, anonymized — never client names). Target: improve `templates/sdd/*` for the next project.
