# Extensions

## Intent

Extensions add conditional standards to the baseline profile. They remain inactive until a current product, risk, integration, or operating requirement meets the extension's activation criteria and the consumer lists its ID in `standards.project.json`.

An extension may add requirements, packages, projects, and verification. It may replace a baseline rule only when its document names that rule ID.

## Selection

| Extension | Activate when |
|:---|:---|
| [acceptance-bdd](acceptance-bdd.md) | Shared cross-layer examples need executable BDD scenarios. |
| [api-compatibility](api-compatibility.md) | Public or independently deployed consumers need breaking-change detection and versioning. |
| [caching](caching.md) | Measurements show repeated expensive reads with bounded staleness. |
| [concurrency-idempotency](concurrency-idempotency.md) | Conflicting writes or repeated requests can violate behavior. |
| [data-lifecycle](data-lifecycle.md) | A use case requires deletion, retention, archival, restore, or legal hold behavior. |
| [deployment-containers](deployment-containers.md) | The hosted release uses container images. |
| [external-integrations](external-integrations.md) | A use case calls or receives data from an external system. |
| [frontend-authjs](frontend-authjs.md) | Next.js owns interactive login and session cookies. |
| [localization](localization.md) | The product commits to more than one locale. |
| [multitenancy](multitenancy.md) | Independent customer organizations share one deployment. |
| [outbox-worker](outbox-worker.md) | A committed change requires delivery that cannot be lost. |
| [persistence-ef-core](persistence-ef-core.md) | Relational persistence requirements replace Marten for selected aggregates. |
| [realtime](realtime.md) | Polling cannot meet a measured update-latency requirement. |
| [reporting](reporting.md) | Complex reports or large exports exceed normal request reads. |
| [scheduled-jobs](scheduled-jobs.md) | A use case requires recurring, delayed, or calendar-based Worker work. |

## Activation process

1. Name the current use case and the criterion that activates the extension.
2. Add the extension ID to consumer `standards.project.json`.
3. Add any required risk flag to the use-case specification.
4. Read the extension before implementation.
5. Apply named baseline replacements and retain unrelated baseline rules.
6. Add required packages from the manifest and conditional projects when named.
7. Run baseline and extension verification.

Do not enable an extension as a general preference or for possible future work.
