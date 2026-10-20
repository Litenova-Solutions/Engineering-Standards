# Extensions

## Intent

Extensions add conditional standards to the baseline stacks. An extension stays inactive until a current requirement meets its activation criteria. The consumer lists its ID in `selectedExtensions` within `litespec.project.json`, with the criterion it met and a review date.

An extension may add requirements, packages, projects, and verification. It replaces a baseline rule only when its document names that provision ID, and the manifest repeats that list where checks read it.

## Selection

| Extension | Activation scope | Replaces | Switches on | Activate when |
|:---|:---|:---|:---|:---|
| [bdd](bdd.md) | `local` | None | `case` | Shared critical examples need executable BDD scenarios. |
| [compat](compat.md) | `project` | None | None | Public or independently deployed consumers need breaking-change detection and versioning. |
| [cache](cache.md) | `local` | None | None | Measurements show repeated expensive reads with bounded staleness. |
| [concurrency](concurrency.md) | `local` | None | None | Conflicting writes or repeated delivery can violate behavior. |
| [lifecycle](lifecycle.md) | `local` | None | `limit` | Deletion, retention, archival, restore, or legal hold behavior applies. |
| [containers](containers.md) | `project` | None | None | A hosted environment deploys container images. |
| [integrations](integrations.md) | `local` | None | None | Behavior calls or receives data from an external system. |
| [audit](audit.md) | `project` | `litespec/rule/quality-security.record-security-audit-events` | None | A reviewer must establish who acted inside data another party owns. |
| [locale](locale.md) | `project` | None | None | The product commits to more than one locale. |
| [mcp](mcp.md) | `project` | None | None | The product ships a Model Context Protocol server an LLM client starts on a user's own machine. |
| [tenancy](tenancy.md) | `project` | None | None | Independent customer organizations share one deployment. |
| [outbox](outbox.md) | `local` | `litespec/rule/backend-persistence.collect-events-without-a-public-unit-of-work` | `event`, `limit` | A committed change requires delivery that cannot be lost. |
| [efcore](efcore.md) | `local` | The persistence and dependency provisions its Baseline relationship section names | None | Selected aggregates require relational persistence instead of Marten. |
| [realtime](realtime.md) | `local` | None | `event` | Polling cannot meet a measured update-latency requirement. |
| [report](report.md) | `local` | None | None | Complex reports or large exports exceed normal request reads. |
| [jobs](jobs.md) | `local` | None | `limit` | Behavior requires recurring, delayed, or calendar-based Worker work. |
| [site](site.md) | `project` | None | None | The product ships a public static website beside its application. |
| [stage](stage.md) | `project` | None | None | The first deployment holds no customer data yet, or a past promotion goes on record. |
| [delegation](delegation.md) | `project` | None | None | One agent starts another agent on the same tree. |

The manifest is the machine-readable source for `activationScope`, `replaces`, and `switchesOn`. This table explains the selection decision.

## Switched-on types

`switchesOn` names the record types a selection requires. Selecting the outbox requires Event and Limit records, so a project that selects it writes both. A type the project already requires stays required.

## Activation

`litespec/rule/core-scope.select-conditional-extensions-explicitly` states when an extension activates. `litespec/rule/core-scope.record-selected-extensions` states where it is listed. `litespec/rule/core-scope.record-selected-extensions` requires the project record.

The [agent protocol](../core/agent.md) carries the ordered steps an agent follows.

## Example

The project selects both `locale` and `outbox`, each with the criterion it met and a review date:

```json
{
  "selectedExtensions": [
    { "id": "locale", "criterion": "The product ships in English and Dutch.", "reviewBy": "2027-03-01" },
    { "id": "outbox", "criterion": "Shipment dispatch cannot lose a delivery.", "reviewBy": "2027-03-01" }
  ]
}
```

`litespec/rule/core-scope.select-conditional-extensions-explicitly` requires that an extension is selected only when its criteria apply, and the object form records which criterion that was. The consumer validator reports a selection whose `reviewBy` has passed. A selection that costs nothing to keep is a selection nobody removes.
