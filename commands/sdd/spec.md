# /spec — Write or refine the specification

Produce/refine `.sdd/spec.md` for the current Bonita artifact.

## Arguments
- `$ARGUMENTS`: free-text requirements or clarifications.

## Instructions
1. Read `.sdd/spec.md` and `.sdd/SDD.md` (run `/sdd-init` first if missing).
2. If requirements are ambiguous or partial, invoke the **bonita-requirements-elicitor** skill to run a focused Q&A before writing.
3. Fill every section: purpose, inputs/outputs or BDM/contracts, behaviour, error handling, security, testing plan, acceptance criteria.
4. Make acceptance criteria testable (each maps to a future test).
5. Enforce `sdd-core-bonita.md` rules (audit fields, Groovy-vs-Java, lifecycle).
6. Stop at the spec. Do not plan or implement here.
7. **Learning loop.** If writing the spec exposes a gap in the template you used (a missing section, a rule the project needed that the template lacks), and the `propose_learning` MCP tool is available, propose it (category: `pattern`, anonymized) so `templates/sdd/*` improves for the next project.
