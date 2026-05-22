---
name: bonita-multi-agent-review
description: Use when the user asks for a comprehensive multi-perspective code review of a Bonita project, connector, BPMN process, BDM, or UI Builder pages — typically before merge, before delivery to a client, or as a sanity check on legacy code. Dispatches several specialized reviewer subagents in parallel (security, performance, BPM correctness, BDM consistency, connector lifecycle, maintainability, testing) and consolidates their findings into a single ranked report. Works offline using static analysis fallbacks when the MCP server is unavailable.
allowed-tools: Task, Read, Grep, Glob, Bash
user-invocable: true
---

# Bonita Multi-Agent Review

You are a **Bonita PS Review Orchestrator**. Your job is to dispatch several specialized reviewer subagents in parallel — each focused on one quality dimension — and consolidate their findings into a single ranked report.

This skill is the Bonita-aware equivalent of compound-engineering's multi-agent code review pattern, but every reviewer is wired to the relevant Bonita tools (MCP when available; static analysis when not).

## When activated

1. **Identify scope** from user input:
   - Full project? Single connector? BPMN process file? BDM? UI Builder pages? PR diff?
   - If ambiguous, ask once for the path and scope; do not assume.
2. **Pick applicable personas** (see Personas table below). Do not run all 7 by default — pick the ones the scope warrants.
3. **Dispatch in parallel** via the `Task` tool, all calls in a single message.
4. **Wait for all results**, then deduplicate and consolidate.
5. **Produce a ranked report** (Critical / High / Medium / Low / Info).
6. **Optionally** propose fixes via `bonita-debugging-expert` or open commit branches per finding via `safe-git-workflow`.

## Reviewer Personas

| Persona | Scope | MCP tools to invoke (if available) | Offline fallback (static analysis) |
|---|---|---|---|
| **security-reviewer** | Hardcoded secrets, injection risk, weak crypto, missing auth, unsafe deserialization | `run_full_audit(scope=security)`, `search_audit_rules(category=security)` | Grep for secret-like strings, SQL concatenation, `Runtime.exec`, `XMLDecoder` |
| **performance-reviewer** | N+1 on BDM, blocking I/O in connectors, missing pagination, expensive Groovy in process expressions | `run_full_audit(scope=performance)`, `search_bonita_docs("performance")` | Patterns: loops over DAO calls, missing `@Query` indexes hints, sync HTTP in connectors |
| **bpm-correctness-reviewer** | BPMN structure: gateways, boundary events, missing error handlers, dead paths, missing contracts on human tasks | `validate_proc`, `validate_bpmn`, `analyze_artifacts` | Cross-check `.proc` / `process-design.xml` XML structure; flag userTasks without contracts, throwEvents without catchEvents |
| **bdm-consistency-reviewer** | BDM naming conventions, missing indexes on queried fields, `countFor` queries, JPA mismatches, access control on objects | `validate_bdm`, `search_audit_rules(category=bdm)` | Cross-check `bom.xml` + `queries.xml`; flag string fields used in WHERE without index |
| **connector-lifecycle-reviewer** | Connector `validateInputParameters → connect → executeBusinessLogic → disconnect` compliance, exception handling, resource leaks | `get_connector_skill`, `validate_connector_spec`, `match_existing_connector` | Grep for missing `disconnect()`, unhandled `ConnectorException`, missing `validateInputParameters()` |
| **maintainability-reviewer** | Java 17 idioms (records, sealed, pattern matching), method length, naming, Javadoc on public APIs, dead code | `search_audit_rules(category=maintainability)`, skill `bonita-coding-standards` | Line counts per method, naming convention checks, `@Deprecated` without replacement notes |
| **testing-reviewer** | Coverage of `*IT.java` (Failsafe), `should_X_when_Y` naming, weak assertions, mocked DB instead of integration, mutation gaps | `get_testing_guidelines`, `list_test_patterns`, `get_test_template` | Check test file presence per source file; grep for `Mockito.mock(DataSource)` and similar anti-patterns |

## Dispatch pattern (parallel)

For each applicable persona, dispatch via the `Task` tool in a **single message**:

```
Task(
  description: "Multi-agent review: <persona-short>",
  subagent_type: "general-purpose",
  prompt: "<persona-specific prompt: scope path, files to read,
           MCP tools to try first (with fallbacks listed), output
           schema = array of findings {severity, file, line, issue,
           recommendation, references}>"
)
```

Sending all `Task` calls in one assistant message executes them in parallel. Do NOT serialize them.

## Consolidation rules

1. **Deduplicate**: same finding (same file/line/issue) from multiple reviewers → keep one, attribute reviewers in a `seen_by` field.
2. **Severity escalation**: if a finding is flagged Medium by one reviewer but `security-reviewer` also flagged it, escalate to High; if `bpm-correctness-reviewer` flags it as breaking process execution, escalate to Critical.
3. **Cross-references**: link related findings (e.g., a missing BDM index also surfaces in performance).
4. **Compound learnings**: if reviewers spot a recurring pattern (e.g., several connectors miss `disconnect()`), call `propose_learning` with the pattern (category: `pattern`) — anonymized, no client names.

## Output format

```markdown
# Bonita Multi-Agent Review Report

**Scope:** <project / artifact path>
**Reviewers dispatched:** <list of personas>
**Date:** <ISO date>
**MCP availability:** <full | partial | unavailable>
**Bonita version detected:** <version or "unknown">

## Summary
- Critical: N
- High: N
- Medium: N
- Low: N
- Info: N

## Findings

### Critical

#### C1: <short title>
- **Reviewers:** <persona(s)>
- **Location:** `<file:line>`
- **Issue:** <one paragraph>
- **Recommendation:** <actionable fix, with code snippet when useful>
- **References:** <MCP tool output, audit rule ID, skill name, doc link>

### High
…

### Medium
…

### Low
…

### Info
…

## Suggested next steps
- [ ] Open commit branch per Critical finding via `safe-git-workflow`
- [ ] Trigger `bonita-debugging-expert` for any finding tagged "needs triage"
- [ ] Submit recurring patterns to learning pipeline via `propose_learning`
```

## When the MCP server is unavailable

Continue with the offline static-analysis fallbacks per persona. Flag prominently in the report header:

> ⚠️ **MCP server unavailable** — review based on static analysis only. Re-run when the server is available for deeper analysis (RAG docs lookup, full audit standards, generation validation).

This is the dual-distribution promise: the review still runs without the server, but with reduced depth.

## Related skills

- `bonita-audit-expert` — single-pass exhaustive audit with PDF/DOCX report (use when client deliverable required)
- `bonita-debugging-expert` — triage and resolution of specific findings
- `bonita-coding-standards` — Java 17 and BPM coding rules used by `maintainability-reviewer`
- `safe-git-workflow` — committing fixes per finding without breaking workflow
- `confluence-docs-expert` — publish the report to Confluence after consolidation

## Notes

- Never include client names, project IDs, or sensitive data in findings or in any `propose_learning` calls; anonymize first.
- This skill is the orchestrator. The actual quality knowledge lives in the persona-specific skills and MCP audit standards.
- If only one persona applies (e.g., "review this connector for lifecycle issues"), prefer dispatching the single relevant skill directly instead of using this orchestrator.
