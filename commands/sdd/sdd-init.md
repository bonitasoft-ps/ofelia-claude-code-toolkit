# /sdd-init — Start a Spec-Driven Bonita artifact

Bootstrap the SDD rail for a new (or adopted) Bonita artifact in this repo.

## Arguments
- `$ARGUMENTS`: optional artifact type + name (e.g. `connector salesforce`, `rest-api invoices`, `process onboarding`, `front react portal`). If omitted, infer from the SessionStart detection.

## Instructions
1. Determine the subtype from `$ARGUMENTS` or the detected markers (connector, rest-api-extension, actor-filter, event-handler, bdm, process, front-{react,vue,angular,svelte,qwik}).
2. Create a `.sdd/` folder in the project root with:
   - `SDD.md` — copy of `${CLAUDE_PLUGIN_ROOT}/templates/sdd/sdd-core-bonita.md`, with the platform/toolchain table filled from `pom.xml` / `bonita-project.yml` / `package.json`.
   - `spec.md` — copy of the matching `spec-*` template (e.g. `spec-connector.md`). If no specific template exists, derive one from `sdd-core-bonita.md` section relevant to the subtype.
   - `plan.md` and `tasks.md` — empty stubs with headers.
3. Tell the user the rail: `/spec` → `/plan` → `/tasks` → implement.
4. Do NOT generate code yet. This command only sets up artifacts.
5. Respect `safe-git-workflow`: no commits unless asked.
