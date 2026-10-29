# Writing the intent of a spec (ICE: Intent, Context, Expectations)

Shared reference for `project-spec-generator`, `bonita-requirements-elicitor` and the
`bonita-*-lifecycle` skills. Adapted from the ICE/IDSD approach (Kapil Viren Ahuja, 2026): a spec
should state the outcome and its bounds, and leave the *how* to the builder and to the context.
Treat it as a writing guide, not a proven method.

## The three artifacts

| Artifact | What it holds | Who writes it |
|---|---|---|
| **Intent** | Goal, constraints, failure conditions | The human, always |
| **Context** | Org standards, stack, neighbouring services, past decisions | Assembled from the repo, CLAUDE.md, skills |
| **Expectations** | Success scenarios and acceptance tests, derived from intent + context | Generated, then reviewed at a checkpoint |

## Goal

One outcome, one sentence, no "and".

Test: *can two completely different implementations both satisfy it?* If only one can, it is a spec
wearing a goal's clothes. If you need a conjunction, you have two goals: split them, do not add
detail.

- Good: "Build a service that exposes the product catalog to the storefront."
- Bad: "Build a Go service with gRPC, PostgreSQL and Redis behind Envoy." (stack belongs in Context)

## Constraints

Qualities the outcome must carry. Directional, unconditional, in business language. 5 to 7 lines.
They point where the outcome must land without picking the tool.

- Good: "p99 under 200 ms on read endpoints", "WCAG 2.1 AA", "no new runtime dependency".
- Bad: "use three replicas with pod disruption budgets" (that is Context).
- If the list passes about seven lines, something belongs in Context or Expectations.

## Failure conditions

Binary, observable, checked **after** the work by a script or an eval, with no human opinion.

- Examples: build fails, coverage below the agreed floor, lint errors, a secret in the source,
  API contract changed without a version bump.

## Constraint or failure condition?

Ask: **would knowing this change how the builder writes code?**

- Yes: constraint (the builder needs it to make a design call).
- No: failure condition (the validator catches it afterwards).

"Must not add a runtime dependency" is a constraint. "Coverage stays above 90 %" is a failure
condition: it only exists once the code does, and handing it to the builder as a goal invites
coverage gaming.

## Keep the builder and the validator apart

The builder gets goal + constraints + context. The validation phase owns the failure conditions
and runs them as checks. Do not paste the validator's checks into the implementation prompt as
targets: models optimise for what they can see.

## Common slips (check before saving)

1. The method leaks into the goal ("a Go microservice with...").
2. The constraint list grows into a disguised spec.
3. Constraints and failure conditions get mixed.

## Template

```markdown
## Intent: <outcome name>

**Goal:** <one sentence, no "and">

**Constraints** (shape the design):
- <quality, business language>

**Failure conditions** (binary, checked after):
- <observable check>

**Out of scope:** <what is deliberately excluded and what a reader might assume is included>
```
