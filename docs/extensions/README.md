# Extensions

## Intent

Extensions add conditional standards to the baseline profile. They remain inactive until a current product, risk, integration, or operating requirement meets their activation criteria and the consumer lists the extension ID in `selectedExtensions` in `standards.project.json`.

An extension may add requirements, packages, projects, and verification. It may replace a baseline rule only when its document names that rule ID.

## Selection

| Extension | Activation scope | Local specification kinds | Activate when |
|:---|:---|:---|:---|
| [acceptance-bdd](acceptance-bdd.md) | `local` | Use case, Business Flow | Shared critical examples need executable BDD scenarios. |
| [api-compatibility](api-compatibility.md) | `project` | None | Public or independently deployed consumers need breaking-change detection and versioning. |
| [caching](caching.md) | `local` | Use case | Measurements show repeated expensive reads with bounded staleness. |
| [concurrency-idempotency](concurrency-idempotency.md) | `local` | Use case, Workflow | Conflicting writes or repeated delivery can violate behavior. |
| [data-lifecycle](data-lifecycle.md) | `local` | Use case, Workflow, Shared Rule | Deletion, retention, archival, restore, or legal hold behavior applies. |
| [deployment-containers](deployment-containers.md) | `project` | None | A hosted environment deploys container images. |
| [external-integrations](external-integrations.md) | `local` | Use case, Workflow | Behavior calls or receives data from an external system. |
| [frontend-authjs](frontend-authjs.md) | `project` | None | Next.js owns interactive login and session cookies. |
| [localization](localization.md) | `project` | None | The product commits to more than one locale. |
| [multitenancy](multitenancy.md) | `project` | None | Independent customer organizations share one deployment. |
| [outbox-worker](outbox-worker.md) | `local` | Use case, Workflow | A committed change requires delivery that cannot be lost. |
| [persistence-ef-core](persistence-ef-core.md) | `local` | Subject, Use case | Selected Aggregates require relational persistence instead of Marten. |
| [realtime](realtime.md) | `local` | Use case, Business Flow | Polling cannot meet a measured update-latency requirement. |
| [reporting](reporting.md) | `local` | Use case | Complex reports or large exports exceed normal request reads. |
| [scheduled-jobs](scheduled-jobs.md) | `local` | Use case, Workflow | Behavior requires recurring, delayed, or calendar-based Worker work. |

The manifest is the machine-readable source for `activationScope` and `applicableKinds`. This table explains the selection decision.

## Activation process

1. Name the current requirement and the criterion that activates the extension.
2. Add the extension ID to `selectedExtensions` in consumer `standards.project.json`.
3. For a project-scoped extension, apply it to all affected project work.
4. For a local extension, list it in `applicableExtensions` on each allowed specification where it applies.
5. Add any required Risk to the Use-case specification.
6. Read the extension before implementation.
7. Apply named baseline replacements and retain unrelated baseline rules.
8. Add manifest-pinned dependencies and conditional projects when named.
9. Run baseline and extension verification.

Do not select an extension as a preference or for possible future work. Do not list a project-scoped extension in local Specification Metadata.

## Example

The project selects both `localization` and `outbox-worker`:

```json
{
  "selectedExtensions": ["localization", "outbox-worker"]
}
```

`localization` applies across the project. Only the Use cases and Workflows that require durable delivery list `outbox-worker`. For example:

```json
{
  "kind": "workflow",
  "id": "order-fulfillment",
  "recordStatus": "current",
  "deliveryStatus": "planned",
  "owner": "Product and engineering",
  "lastReviewed": "2026-07-21",
  "participatingSubjects": ["orders", "tickets"],
  "applicableExtensions": ["outbox-worker"]
}
```
