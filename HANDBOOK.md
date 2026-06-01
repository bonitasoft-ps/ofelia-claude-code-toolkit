# Ofelia / Bonitasoft PS — Handbook

The map of the **Ofelia / Bonitasoft Professional Services consulting
ecosystem**: what each repo does, how they call each other, what a
new consultor needs to install and configure, where credentials live,
and where the canonical deliverable templates are.

This repo has **no code**. It points at the other repos and explains
how they fit together. If you're new to the team, start here.

---

## TL;DR for a new consultor

1. Read [Ecosystem overview](#ecosystem-overview) (5 min).
2. Follow [Onboarding checklist](#onboarding-checklist) (30-60 min).
3. Trigger `/daily-imputar` to validate the imputation flow.
4. Trigger `/informe-ofelia` on a test client to validate the document
   pipeline end to end.
5. Bookmark [Document types catalog](#document-types-catalog) and
   [Brand guidelines](#brand-guidelines) for daily reference.

---

## Ecosystem overview

Four pieces work together. **Three are Claude Code plugins** (you
install them in Claude Code), **one is an MCP server** (you install it
in Claude Desktop or wire it to any HTTP-capable client).

```
   ┌────────────────────────────────────────────────────────────────────┐
   │  Ofelia AI Agent MCP                                               │
   │  https://github.com/bonitasoft-ps/ofelia-ai-agent-mcp              │
   │  - 145 tools (audit, BDM, BPMN, UI, runtime, docs RAG, …)          │
   │  - Hub: auto-clones 14 toolkits sibling under toolkits/             │
   │  - Install: .mcpb double-click or Render-hosted HTTP                │
   └─────────────────────┬──────────────────────────────────────────────┘
                         │ skills + lifecycle knowledge come from here
                         ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  Ofelia Claude Code Toolkit (plugin)                                │
   │  https://github.com/bonitasoft-ps/claude-code-toolkit               │
   │  - 55 skills, 5 agents, 18 commands, 17 hooks                       │
   │  - Methodology for Bonita PS engagements                            │
   │  - Install: /plugin install ofelia-claude-code-toolkit@...          │
   └────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────────┐
   │  PS Consultant (plugin)                                             │
   │  https://github.com/bonitasoft-ps/ps-consultant-plugin              │
   │  - 13 MCP tools: PS-Hub (Firestore) bridge                          │
   │  - Daily imputation review, weekly/monthly reports DATA             │
   │  - Delegates document RENDERING to ofelia-document-toolkit          │
   └─────────────────────┬──────────────────────────────────────────────┘
                         │ data → spec → render
                         ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  Ofelia Document Toolkit (plugin)                                   │
   │  https://github.com/bonitasoft-ps/ofelia-document-toolkit           │
   │  - 10 MCP tools (generate_docx, generate_pdf, generate_pptx, …)     │
   │  - Canonical Ofelia branding: 3 brand variants, logos, fonts, palette│
   │  - Document-types catalog (audit, upgrade, expertise, sizing, etc.) │
   └────────────────────────────────────────────────────────────────────┘
```

### What each one does (one paragraph)

- **Ofelia AI Agent MCP** (`ofelia-ai-agent-mcp`) — the brain. A
  standalone MCP server with 145 tools that gives Claude (Desktop,
  Code, claude.ai, Cursor, Copilot) read/write access to the PS
  ecosystem: 14 toolkits under `toolkits/` covering upgrades, audits,
  connectors, tests, docs RAG, BPMN/BDM/UI generation. The MCP **does
  not** carry branding or document generation — that's deliberate.

- **Ofelia Claude Code Toolkit** (`ofelia-claude-code-toolkit`,
  repo: `claude-code-toolkit`) — the methodology. Plugin that bundles
  55 skills, 5 agents, 18 commands and 17 hooks: the team's expert
  knowledge for Bonita PS engagements (audits, upgrades, connectors,
  testing, debugging). Consumes tools from the MCP via
  `mcp__Ofelia-AI-Agent__*` calls.

- **PS Consultant** (`ps-consultant-plugin`) — the consultor's
  workflow. Plugin that bridges Claude with **PS-Hub** (Firestore at
  `ps-hub-portal`): list clients, list pending imputations, approve /
  reject them, list allocations, sync Claude sessions, generate
  weekly / monthly report **data** (it produces the structured spec,
  not the file). Renders by delegating to the document-toolkit plugin.

- **Ofelia Document Toolkit** (`ofelia-document-toolkit`) — the
  branding. Plugin with its own MCP server (10 tools) that's the
  single source of truth for Ofelia's visual identity: logos (PNG +
  SVG, 3 variants × 3 shapes × black/white/gradient), fonts (PP Neue
  Montreal in OTF/TTF/WOFF/WOFF2), the palette (in `mcp/lib/brands.js`
  and `references/accessibility-ratios.md`), and a **document-types
  catalog** in `templates/document-types/` with ready-to-use specs
  for the team's recurring deliverables.

### How they call each other

The most common flow — generating a weekly client report:

```
You: "/informe-ofelia altia es"
   │
   ▼
ps-consultant
   ├─ list_clients (Firestore) → projectId
   ├─ list_allocations (Firestore) → approved entries
   └─ prepare_weekly_report_spec → JSON spec (brand, title, sections, …)
   │
   ▼ Claude orchestrates: passes the spec to the next plugin
   │
ofelia-document-toolkit
   ├─ get_brand_palette + get_logo (internal lookup)
   └─ generate_docx → branded .docx file
   │
   ▼
File lands at ${OFELIA_OUTPUT_ROOT}/Partners/<customer>/Comunicaciones/…
```

Meanwhile, the **ofelia-ai-agent-mcp** is available throughout the
session if the conversation needs to look up an upgrade rule or run
an audit check.

---

## Onboarding checklist

For a new PS consultor on Windows + Google Drive Desktop. Adapt paths
for macOS / Linux as noted.

### 1. Tools

- [ ] **Git** + **GitHub CLI** (`gh`). Run `gh auth login`.
- [ ] **Node.js 20+**.
- [ ] **Claude Code** (CLI + Desktop). [Install guide](https://claude.com/claude-code).
- [ ] **Google Drive Desktop** (or rclone) — mount the Bonitasoft
      shared drive as `G:` on Windows or `~/Google Drive` on macOS.

### 2. GitHub access

Ask the PS Manager (Guillaume) to add you to the
[`bonitasoft-ps`](https://github.com/bonitasoft-ps) organization. The
4 repos plus the 14 toolkit repos are all private.

### 3. Install the three plugins

In a Claude Code session (CLI or Desktop), add the three marketplaces
to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "ofelia-claude-code-toolkit": {
      "source": { "source": "git", "url": "https://github.com/bonitasoft-ps/claude-code-toolkit.git" },
      "autoUpdate": true
    },
    "ofelia-document-toolkit": {
      "source": { "source": "git", "url": "https://github.com/bonitasoft-ps/ofelia-document-toolkit.git" },
      "autoUpdate": true
    },
    "ps-consultant": {
      "source": { "source": "git", "url": "https://github.com/bonitasoft-ps/ps-consultant-plugin.git" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": {
    "ofelia-claude-code-toolkit@ofelia-claude-code-toolkit": true,
    "ofelia-document-toolkit@ofelia-document-toolkit": true,
    "ps-consultant@ps-consultant": true
  }
}
```

Restart Claude Code. Accept the trust prompts. Verify with `/plugin`
→ Installed tab.

### 4. Install the MCP server

Two options:

- **Easiest** — download `ofelia-ai-agent-mcp.mcpb` from the
  [latest release](https://github.com/bonitasoft-ps/ofelia-ai-agent-mcp/releases),
  double-click, fill in the toolkit paths.
- **One-command** — clone the repo and run `scripts/setup-ps-tools.sh`
  (Linux/macOS) or `.bat` (Windows). It clones the 14 toolkits and
  writes `claude_desktop_config.json` for you.

### 5. Configure credentials (`ps-consultant` plugin)

1. Locate the installed plugin directory (run `/plugin` → select
   `ps-consultant` → see `installPath`).
2. Copy `.env.example` to `.env` in that directory.
3. Fill in:
   - `FIREBASE_SERVICE_ACCOUNT_PATH` — ask Guillaume for the
     `ps-hub-portal` service-account JSON.
   - `CONSULTANT_NAME` and `CONSULTANT_EMAIL` — your canonical
     identity.
   - `OFELIA_OUTPUT_ROOT` — your Drive root: `G:/Mi unidad` on
     Windows, `/Users/<you>/Google Drive/Mi unidad` on macOS, etc.

### 6. Smoke test

In Claude Code:

```
/daily-imputar
```

Should list pending imputations (likely empty for a new consultor).

```
/informe-ofelia altia es
```

Should produce a branded `.docx` under `${OFELIA_OUTPUT_ROOT}/Partners/Altia/Comunicaciones/…`.

If both work, you're set.

---

## Document types catalog

The team's standard deliverables live in
[`ofelia-document-toolkit/templates/document-types/`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/tree/main/templates/document-types).
Each has a README with canonical sections and a ready-to-use spec.

| Type | What it is | Drive subpath (under `OFELIA_OUTPUT_ROOT`) |
| --- | --- | --- |
| Weekly intervention report | Customer-facing weekly hours + deliverables | `Partners/<client>/Comunicaciones/` |
| Monthly consultant report | Internal monthly consolidated | `Personal/Informes mensuales/` |
| Audit report | Closing-deliverable for a Bonita audit | `Partners/<client>/Auditorias/` |
| Upgrade plan | Version-to-version migration plan | `Partners/<client>/Plan Actualizacion/` |
| Expertise corner | Short technical deep-dive | `Personal/Expertise/` or `Partners/<client>/Expertise/` |
| Sizing document | Pre-sales effort estimation | `Partners/<client>/Sizing/` |
| Kickoff deck | Project kickoff slides | `Partners/<client>/Kickoff/` |
| Certificate | Training completion PDF | `Partners/<client>/Formacion/` or `Personal/Certificates/` |
| Proposal | Full commercial proposal | `Partners/<client>/Propuestas/` |

To add a new type or modify an existing one, follow the contribution
flow in the [catalog README](https://github.com/bonitasoft-ps/ofelia-document-toolkit/blob/main/templates/document-types/README.md).

> **For the master mapping** — where the apartados of each type live,
> where each spec lives, where the real reference examples on Drive
> live, and which types still need more real examples — see
> [`DOCUMENT-TYPES-MASTER.md`](./DOCUMENT-TYPES-MASTER.md) in this repo.

---

## Brand guidelines

The Ofelia visual identity has **three variants**:

| Variant | Use for | Signature colors |
| --- | --- | --- |
| `ofelia` | Company-wide, generic, external comms | Orange `#FF5D2B` + Burgundy `#5C1932` |
| `ofelia-agentic` | Ofelia Agentic product (AI + Workflow Builder) | Plum `#723253` + Lila `#A98BE1` |
| `bonita-bpm` | Bonita BPM product (BPM engine) | Brown `#7E5136` + Yellow `#FCBE58` |

Naming convention, communication guardrails (say / don't say), and
the per-variant accessibility ratios live in:

- [`ofelia-document-toolkit/references/brand-guidelines.md`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/blob/main/references/brand-guidelines.md)
- [`ofelia-document-toolkit/references/accessibility-ratios.md`](https://github.com/bonitasoft-ps/ofelia-document-toolkit/blob/main/references/accessibility-ratios.md)

Canonical assets (logos, fonts, palette source-of-truth) live in
Marketing's Drive folder at `G:/Mi unidad/Marketing/Ofelia Brand Kit — Internal/`
and are mirrored into the `ofelia-document-toolkit` repo. To refresh
the mirror from Drive: `/ofelia-refresh-brand-kit`.

---

## Repos at a glance

| Repo | What | Install ID |
| --- | --- | --- |
| [`ofelia-ai-agent-mcp`](https://github.com/bonitasoft-ps/ofelia-ai-agent-mcp) | MCP server, 145 tools, hub | `.mcpb` install or HTTP via `https://ofelia-ai-agent-mcp.onrender.com/mcp` |
| [`claude-code-toolkit`](https://github.com/bonitasoft-ps/claude-code-toolkit) | Plugin, methodology | `ofelia-claude-code-toolkit@ofelia-claude-code-toolkit` |
| [`ofelia-document-toolkit`](https://github.com/bonitasoft-ps/ofelia-document-toolkit) | Plugin, branding + docs | `ofelia-document-toolkit@ofelia-document-toolkit` |
| [`ps-consultant-plugin`](https://github.com/bonitasoft-ps/ps-consultant-plugin) | Plugin, PS-Hub bridge | `ps-consultant@ps-consultant` |

The MCP also has 14 toolkit repos under its `toolkits/` directory:
`bonita-upgrade-toolkit`, `bonita-audit-toolkit`,
`bonita-connectors-generator-toolkit`, `bonita-docs-toolkit`,
`bonita-bpmn-generator-toolkit`, `bonita-bdm-generator-toolkit`,
`bonita-ui-generator-toolkit`, `bonita-uibuilder-generator-toolkit`,
`bonita-runtime-toolkit`, `bonita-agent-docs`, `template-test-toolkit`,
`claude-code-toolkit`, `bonita-connector-template`,
`connector-generator-skills`. These are independent git clones (not
submodules); each has its own GitHub repo and lifecycle.

---

## Troubleshooting

| Symptom | First check |
| --- | --- |
| Plugin not appearing in `/plugin` Installed | Restart Claude Code; check `~/.claude/settings.json` `enabledPlugins` keys match the latest slugs (see [Repos at a glance](#repos-at-a-glance)). |
| `mcp__Ofelia-AI-Agent__*` tools not found | Check the MCP server is running: `claude mcp list` (CLI) or hammer icon in Claude Desktop. |
| `/informe-ofelia` fails on path | `OFELIA_OUTPUT_ROOT` not set in `.env`. Fix and restart Claude Code. |
| Branded DOCX comes out plain Calibri | The spec was passed as HTML. Use the semantic spec format (sections array with `type: heading|paragraph|table|…`). |
| Plugin installed but skills not auto-invoking | `/reload-plugins`; or `rm -rf ~/.claude/plugins/cache/<old-marketplace>` if stale. |

---

## Who owns what

- **Ecosystem architecture**: PS Manager + senior consultors. Changes
  discussed before PR.
- **`ofelia-ai-agent-mcp`** + the 14 toolkits: maintained collectively.
  Production deploy in Render.
- **`ofelia-document-toolkit`**: branding is owned by Marketing; the
  plugin is the team's mirror. Refresh via `/ofelia-refresh-brand-kit`.
- **`ps-consultant-plugin`**: maintained by Endika (initial author).
  PS-Hub Firestore project owned by Guillaume.
- **This handbook**: any PS consultor can PR improvements.

---

## Cross-references in the four repos

Each of the four repos has a one-line pointer at the top of its README
back here, so any consultor landing on a single repo can find the
ecosystem map in one click.

---

*Maintained by Bonitasoft Professional Services — last update: 2026-05-29.*
