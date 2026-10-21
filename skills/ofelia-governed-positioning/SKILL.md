---
name: ofelia-governed-positioning
description: Use when preparing pre-sales, demos, battlecards, client emails, proposals or objection handling where Ofelia (Ofelia Agentic + Bonita BPM) must be differentiated from "AI agents that orchestrate work" vendors (Asana, monday, Notion AI, ClickUp, Salesforce, HubSpot, Weflow, Microsoft Copilot, Google Gemini) or from knowledge-agent platforms (kapa.ai and similar). Also use when the user asks how to prove "governed", "execution" or "embedded" with the product or with the Ofelia / Bonita AI Agent MCP.
allowed-tools: Read, Grep, Glob
user-invocable: true
---

# Ofelia Governed Positioning

"Orchestration" is now a category word: every work-management, CRM and suite vendor claims "agents that orchestrate your teams". It no longer differentiates. Ofelia owns three words, **Governed, Execution, Embedded**, and only if each claim is backed by something the product actually does.

Rule: never use a pillar without its proof. Say "governed AI orchestration", never "intelligent automation". Close with: *"Operations move at AI speed. Governance moves with it."*

## Market pattern (what competitors share)

| Mechanic | What they do | Ofelia counter |
|---|---|---|
| Consumption pricing | Pay per AI action / credit | Predictable subscription on a process engine; cost tied to governed processes, not tokens |
| Bottom-up adoption | Individual users adopt, IT discovers later | Top-down governed rollout: IT/ops own processes, roles, audit |
| MCP as "and outside our tool?" | MCP server bolted onto a task/CRM data model | MCP on top of a BPM engine: agents act through processes, contracts and actors, not raw records |

## The three pillars and their proof

### Governed
Claim: every agent action runs inside a model the organisation controls (who, what, when, under which rule) and leaves an audit trail.
Proof in product:
- Bonita BPM actors, profiles and organisation mapping decide who (human or agent) may execute each task.
- Contracts validate every input before the engine accepts it; agents cannot bypass them.
- Full case/task history in the engine (archived instances) = native audit log.
- Versioned process definitions (processDefinitionId immutable): you know exactly which rules applied to a case.
Proof via MCP: `audit_bonita_project`, `run_full_audit`, `get_audit_standards`, `bonita_standards_coverage`, `validate_project_consistency`.

### Execution
Claim: agents do not just suggest or summarise; they execute real, long-running, transactional work with retries and human escalation.
Proof in product: process engine with timers, events, connectors, subprocesses, human tasks and SLA tracking.
Proof via MCP: `bonita_list_processes`, `bonita_start_case`, `bonita_list_open_tasks`, `bonita_execute_task`, `bonita_get_case_status`, `bonita_get_kpis`, `bonita_deploy_process`.

### Embedded
Claim: AI lives inside the operational systems (ERP, core banking, document management, legacy) through the process, not in a side chat.
Proof in product: connectors, REST API extensions, Living Apps / UI Builder pages, event handlers.
Proof via MCP: `get_connector_knowledge`, `match_existing_connector`, `generate_living_app`, `generate_uibuilder_page`, `generate_event_handler`.

## Objection handling (short)

- **"Asana / monday / Notion AI already orchestrate our teams with agents."** They orchestrate tasks in their own data model. Ofelia orchestrates the process that the regulator, the auditor and the ERP depend on, with actors, contracts and history. Ask: "Who approved what the agent did, and can you show it in 6 months?"
- **"Salesforce / HubSpot / Weflow have revenue agents."** Good for the CRM slice. Cross-system processes (order-to-cash, onboarding, claims) span 5+ systems; Ofelia is the governed layer that executes across them.
- **"Copilot / Gemini is already in our suite."** Copilots assist individuals. Ofelia executes organisational processes. Complementary: Copilot can call Ofelia via MCP; Ofelia keeps the governance.
- **"They also have MCP."** MCP is a plug, not a guarantee. What matters is what sits behind it: a governed engine (Ofelia) or a task list.
- **"Consumption pricing is cheaper to start."** Cheaper to start, unpredictable at scale, and bottom-up sprawl creates shadow agents nobody governs.

## Knowledge agents (kapa.ai and similar) are complementary, not competitors

kapa.ai ingests 20+ source types (docs, tickets, wikis, Confluence, Discord, Discourse, custom Q&A), syncs changes in minutes and answers with source links (website widget, Slack, Zendesk, hosted MCP usable from Claude, Cursor, Codex; ChatGPT app with 22 skills such as `kapa-check`, `kapa-gaps`, `kapa-setup-*`). It **answers**; it does not execute or govern processes.
- Use pattern: knowledge agent answers "how", Ofelia executes "do it, under these rules".
- Internal fit: the Ofelia MCP `search_bonita_docs` accepts `backend: "kapa" | "auto"` (env `KAPA_API_KEY`, `KAPA_PROJECT_ID`). `auto` uses the local index and completes weak results with Kapa. Execution, audit and generation stay in the Ofelia MCP.
- `kapa-gaps` (questions the docs cannot answer) is a good input for PS knowledge and for `propose_learning`.
- Never present Ofelia as a docs chatbot; that is the commodity layer.

## Token-efficient docs lookups (Ofelia MCP)

1. `search_bonita_docs` with `version` (and `source`) set; default compact output is enough in most cases.
2. Need more? `get_bonita_doc_page` with `section` = the section title from the result, not the whole page.
3. Use `format: "full"` or larger `limit` only when comparing many chunks.

## Make "governed" true in our own MCP (checklist before demos)

Already in the MCP (ofelia-ai-agent-mcp PR #935 and later):
- `bonita_deploy_process` and `bonita_execute_task` are `destructiveHint: true`; `bonita_start_case` is a non-read-only write. Clients ask for human confirmation.
- Every side-effecting or denied tool call is written to `data/audit.log` (`event: tool_call`, role, identity, outcome, duration, args hash, never raw args).
- Role-based tool access (`client` / `employee` / `admin`).

Verify before each demo:
1. The MCP authenticates to Bonita as a user with a dedicated profile (agent identity), never as `install` or a shared admin.
2. The case history in Bonita shows the agent user on the executed tasks.
3. Demo the refusal path: an agent blocked by a contract, by missing actor rights, or a `client` token denied a write tool (visible as `outcome: denied` in the audit log). Refusals prove governance better than successes.

## Output formats

- **Battlecard**: competitor, their claim, where they stop, Ofelia pillar + proof, trap question, one-liner.
- **Demo script**: 3 beats (Execution: start case and execute task from Claude; Governed: show refused action + case history; Embedded: connector call to client system).
- For branded deliverables delegate rendering to the `ofelia-document-toolkit` plugin (variant Ofelia corporate, or Ofelia Agentic / Bonita BPM if product-specific).

## Guardrails

- Suite = Ofelia, products = Ofelia Agentic and Bonita BPM; never "the product" in singular.
- No unverifiable claims about competitors; cite their public positioning only.
- No em dash in client-facing text.
- No client names in examples.
