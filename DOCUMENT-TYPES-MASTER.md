# Document types — master mapping

Where the canonical **apartados (sections)** of each PS deliverable
type live, where the **ready-to-use spec** lives, where the **real
examples** on Drive live, and which types **need more example data**.

> All paths under `ofelia-document-toolkit/...` are inside the
> [`bonitasoft-ps/ofelia-document-toolkit`](https://github.com/bonitasoft-ps/ofelia-document-toolkit)
> repo. All paths under `G:\Mi unidad\...` are the maintainer's Drive
> mount — other consultors substitute their own `${OFELIA_OUTPUT_ROOT}`.

## Quick legend

- 🟢 **Complete** — README + spec + real-example references all in place.
- 🟡 **Functional, needs more examples** — README + spec are good, but
  only 1 real example is referenced. More examples (from different
  customers / projects) would strengthen the template.
- 🔴 **Stub** — README exists but no real example yet; spec is
  scaffolded but not battle-tested.

## Master table

| Type | State | README (apartados) | Spec(s) | Real examples on Drive |
|---|---|---|---|---|
| [`_common-sections`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/_common-sections) | 🟢 | `templates/document-types/_common-sections/README.md` | n/a (reference doc) | n/a — extracted from 5+ deliverables (CTAIMA, BBVA, Banco Hipotecario, Anahuac, Qintess) |
| [`weekly-intervention-report`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/weekly-intervention-report) | 🟢 | `templates/document-types/weekly-intervention-report/README.md` | `example.docx.json` (rich, Altia-style) + `example-lightweight.docx.json` | `G:\Mi unidad\Partners\Altia\Comunicaciones\20260522_altia_es.{md,pdf,html}` ← **canonical reference** |
| [`monthly-consultant-report`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/monthly-consultant-report) | 🟡 | `templates/document-types/monthly-consultant-report/README.md` | `example.docx.json` | *Needs a real example* — currently driven only by `/informe-mes` command in `ps-consultant-plugin`. Add a sample from your `~/Personal/Informes mensuales/` when one is ready. |
| [`estimation-checklist`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/estimation-checklist) | 🟢 | `templates/document-types/estimation-checklist/README.md` | `example.docx.json` | `G:\Mi unidad\Partners\Qintess\Checklist de Información para Estimación de Proyectos Bonita v0.0.1.{docx,pdf}` |
| [`sizing-document`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/sizing-document) | 🟢 | `templates/document-types/sizing-document/README.md` | `example.docx.json` (CTAIMA-style) | • `G:\Mi unidad\Prospects\CTAIMA\CTAIMA - Consultancy Sizing (POC) v1.0.0.docx` ← canonical<br>• `G:\Mi unidad\Prospects\Universidad Politéncica de Madrid\Universidad Politécnica de Madrid - Consultancy Sizing (Evaluación Curricular) v1.0.pdf`<br>• `G:\Mi unidad\Prospects\Basica LA\Basica LA - Consultancy Sizing v1.0.0.pdf`<br>• `G:\Mi unidad\Customers\Anahuac\Estimación 20230522\RSE Proceso de Constancias de Estudio - Estimacion_20230522.docx`<br>• `G:\Mi unidad\Customers\Perez Llorca\Alta Empleado\Pérez Llorca - Consultancy Sizing (Alta Empleado).docx` |
| [`proposal`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/proposal) | 🟢 | `templates/document-types/proposal/README.md` | `example-b2b.docx.json` (Trycore-style, English) + `example-direct.docx.json` (Spanish full) | • `G:\Mi unidad\Partners\Trycore\2025-12-16 - Trycore_Risk - Commercial Proposal - PS 3d v1.0.pdf` ← B2B canonical<br>• `G:\Mi unidad\Customers\BBVA Colombia\Propuesta Auditoría General\Propuesta Auditoría General v1.0.pdf`<br>• `G:\Mi unidad\Customers\BBVA Colombia\Propuesta Purga\Propuesta Purga v1.0.docx` (variant for data-cleanup proposals) |
| [`audit-plan`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/audit-plan) | 🟢 | `templates/document-types/audit-plan/README.md` | `example.docx.json` | • `G:\Mi unidad\Customers\BBVA Colombia\Propuesta Auditoría General\Audit_Plan v.2.0 - ES.docx`<br>• `G:\Mi unidad\Customers\BBVA Colombia\Bonitasoft - Audit Plan v.2.0.pdf` |
| [`audit-report`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/audit-report) | 🟢 | `templates/document-types/audit-report/README.md` | `example.docx.json` (Anahuac-style) | • `G:\Mi unidad\Customers\Anahuac\20231127-20231219 Auditoría de Código\2023_12_Audit_Anahuac_v.1.0.pdf` ← canonical<br>• `G:\Mi unidad\Customers\BBVA Colombia\Auditoría Código\20230425\2023_04_Audit_BBVA_Colombia_v2.0.docx` |
| [`upgrade-plan`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/upgrade-plan) | 🟢 | `templates/document-types/upgrade-plan/README.md` | `example.docx.json` (Banco Hipotecario-style) | • `G:\Mi unidad\Customers\Banco Hipotecario\Actualización 2024.3\Plan_Actualización_2024.3 v1.0.pdf` ← canonical<br>• `G:\Mi unidad\Customers\Banco Hipotecario\Actualización 2024.3\Comparativa_Matriz_2024.3 v1.0.pdf` (companion: version compatibility matrix)<br>• `G:\Mi unidad\Partners\Altia\Consultoría Upgrade 7.2.4 to 2025.2\` |
| [`migration-playbook`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/migration-playbook) | 🟢 | `templates/document-types/migration-playbook/README.md` | `example.md` (Markdown source for `generate_pdf_from_markdown`) | `G:\Mi unidad\Partners\Altia\Consultoría Upgrade 7.2.4 to 2025.2\Consultoría\Documentación\PRO\PRO-01-Preparacion-Bundle-Tomcat-7.10.6.{md,html,pdf}` + `PRO-02-Ejecucion-Migracion-y-Arranque-7.10.6.{md,html,pdf}` |
| [`expertise-corner`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/expertise-corner) | 🔴 | `templates/document-types/expertise-corner/README.md` | `example.md` | *Needs real examples* — no canonical PDF found on Drive yet. When you publish a Markdown deep-dive (e.g. XA SQL Server, BAR reverse engineering), add it under `G:\Mi unidad\Personal\Expertise\` and link it here. |
| [`sizing-document` audit-sizing variant](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/sizing-document) | 🟡 | (sub-shape inside `sizing-document` README) | *Same spec, different body* | *Needs a real example for the audit-sizing sub-shape* — closest reference is `Audit_Plan v.2.0 - ES.docx` but that's the audit-plan not the audit-sizing. |
| [`kickoff-deck`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/kickoff-deck) | 🔴 | `templates/document-types/kickoff-deck/README.md` | `example.pptx.json` | *Needs real examples* — no canonical kickoff deck found on Drive. When you produce one, add it under `G:\Mi unidad\Partners\<client>\Kickoff\` and link here. |
| [`certificate`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types/certificate) | 🔴 | `templates/document-types/certificate/README.md` | `example.html` | *Needs real examples* — training certificates not yet generated through this template. Will be canonical once we run the first training with auto-cert generation. |

## Gaps summary

If you have time to add canonical examples for the team, the most
valuable ones (in order):

1. **kickoff-deck** — 🔴 no real PPTX on Drive. Adding one would
   solidify the slide structure beyond my hypotheses.
2. **certificate** — 🔴 no real PDF either. Same.
3. **expertise-corner** — 🔴 no real Markdown deep-dives yet. The
   pattern works on paper; needs validation.
4. **monthly-consultant-report** — 🟡 one example is enough but
   currently we only have the prompt-driven generation.
5. **sizing-document audit-sizing variant** — 🟡 the prose hint
   inside the README is clear but a real audit-sizing PDF would
   anchor it.

The 9 🟢 types are *complete enough to use today*. Reviewers should
flag drift if real deliverables start to diverge from the template.

## How to contribute a missing example

1. Author your deliverable on Drive at the canonical
   `${OFELIA_OUTPUT_ROOT}/<typed-path>/` (see the catalog table in
   `templates/document-types/README.md`).
2. Open a PR on `bonitasoft-ps/ofelia-document-toolkit` updating the
   type's README to add the new path under "Real-world examples".
3. If the real document used a section the template doesn't have, add
   it to the template's README too — note it as "added per <client>
   delivery YYYY-MM-DD".
4. If the document is sensitive, link the path on Drive only (do not
   commit it into the repo).

## Skills + commands that consume these templates

For traceability, here's where the templates get **used** (which
skills or slash commands invoke which `generate_*` MCP tool with
which spec):

| Skill / Command | Lives in | Uses which template |
|---|---|---|
| `/informe-ofelia` | `ps-consultant-plugin/commands/informe-ofelia.md` | `weekly-intervention-report` |
| `/informe-mes` | `ps-consultant-plugin/commands/informe-mes.md` | `monthly-consultant-report` |
| `/ofelia-doc` | `ofelia-document-toolkit/commands/ofelia-doc.md` | any (interactive — user picks) |
| `bonita-audit-lifecycle` (skill) | `claude-code-toolkit/skills/bonita-audit-lifecycle/` | `audit-plan` → `audit-report` |
| `bonita-upgrade-lifecycle` (skill) | `claude-code-toolkit/skills/bonita-upgrade-lifecycle/` | `audit-report` → `upgrade-plan` → `migration-playbook` |
| `bonita-requirements-elicitor` (skill) | `claude-code-toolkit/skills/bonita-requirements-elicitor/` | `estimation-checklist` → `sizing-document` → `proposal` |
| `bonita-estimation-expert` (skill) | `claude-code-toolkit/skills/bonita-estimation-expert/` | `sizing-document` (effort tables source-of-truth) |

If a type is missing a consumer (skill / command), add one — the
spec on its own is useful but the orchestration is what makes it
fast in practice.

---

*Last update: 2026-06-01. Maintained by Bonitasoft Professional Services.*
