# Extensions

## Intent

Extensions add conditional standards to the baseline profile. An extension remains inactive until a current requirement meets its activation criteria. The consumer also lists its ID in `selectedExtensions` within `standards.project.json`.

An extension may add requirements, packages, projects, and verification. It may replace a baseline rule only when its document names that provision ID.

## Selection

| Extension | Activation scope | Local specification kinds | Activate when |
|:---|:---|:---|:---|
| [bdd](bdd.md) | `local` | Use case, End-to-End Flow | Shared critical examples need executable BDD scenarios. |
| [compat](compat.md) | `project` | None | Public or independently deployed consumers need breaking-change detection and versioning. |
| [cache](cache.md) | `local` | Use case | Measurements show repeated expensive reads with bounded staleness. |
| [concurrency](concurrency.md) | `local` | Module, Aggregate, Use case, Workflow | Conflicting writes or repeated delivery can violate behavior. |
| [lifecycle](lifecycle.md) | `local` | Use case, Workflow, Domain Policy | Deletion, retention, archival, restore, or legal hold behavior applies. |
| [containers](containers.md) | `project` | None | A hosted environment deploys container images. |
| [integrations](integrations.md) | `local` | Use case, Workflow, Domain Policy, End-to-End Flow | Behavior calls or receives data from an external system. |
| [audit](audit.md) | `project` | None | A reviewer must establish who acted inside data another party owns. |
| [authjs](authjs.md) | `project` | None | Next.js owns interactive login and session cookies. |
| [locale](locale.md) | `project` | None | The product commits to more than one locale. |
| [tenancy](tenancy.md) | `project` | None | Independent customer organizations share one deployment. |
| [outbox](outbox.md) | `local` | Use case, Workflow, End-to-End Flow | A committed change requires delivery that cannot be lost. |
| [efcore](efcore.md) | `local` | Module, Use case | Selected aggregates require relational persistence instead of Marten. |
| [realtime](realtime.md) | `local` | Use case, End-to-End Flow | Polling cannot meet a measured update-latency requirement. |
| [report](report.md) | `local` | Use case | Complex reports or large exports exceed normal request reads. |
| [jobs](jobs.md) | `local` | Use case, Workflow, End-to-End Flow | Behavior requires recurring, delayed, or calendar-based Worker work. |

The manifest is the machine-readable source for `activationScope` and `applicableKinds`. This table explains the selection decision.

## Applicable kinds

`applicableKinds` names the specification kinds that can carry an extension in `applicableExtensions`. The rule is that a kind qualifies when the extension is specified there, not when it is implemented there.

An aggregate specification owns the state mapping and the transitions, so `concurrency` applies to it. A domain policy about an external system owns what that system decides, so `integrations` applies to it. An end-to-end flow states which of its steps is idempotent, which runs off durable delivery, and which expires on a timer. `concurrency`, `outbox`, and `jobs` therefore apply to it.

A kind is excluded when the extension states nothing a reader of that kind needs. `cache` and `report` stay on the use case because both describe one read.

## Activation

`CORE.SCOPE.EXTENSIONS.001` and `CORE.PRINCIPLES.COMPLEXITY.002` decide when an extension activates. `CORE.SYSTEM.EXTENSIONS.001` and `CORE.SYSTEM.EXTENSIONS.002` decide where it is listed. `CORE.SCOPE.EXTENSIONS.002` requires the project record.

The [agent protocol](../core/agent.md) carries the ordered steps an agent follows.

## Example

The project selects both `locale` and `outbox`:

```json
{
  "selectedExtensions": ["locale", "outbox"]
}
```

`locale` applies across the project. Only the Use cases and Workflows that require durable delivery list `outbox`. For example:

```markdown
---
{
  "kind": "workflow",
  "id": "order-fulfillment",
  "specStatus": "approved",
  "implementationStatus": "planned",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "participatingModules": ["orders", "tickets"],
  "applicableExtensions": ["outbox"]
}
---
```
