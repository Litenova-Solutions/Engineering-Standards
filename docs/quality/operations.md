# Operations

## Intent

A released application is observable, deployable, recoverable, and supportable by one maintainer. Operating behavior is part of the use-case slice when code changes schema, external dependencies, background work, or failure recovery.

## Concepts

Operating truth lives in the records this section names. Each record below states whether a person or the model builder writes it. The operations log alone keeps the past. Each record names its owner from the project's owner list.

**Operations log.** Append-only, one file per month under `docs/operations/log/`, named `YYYY-MM.md`. It records branch-protection bypasses, runbook rehearsals, restores, production deployments, and incidents. Entries are appended and never edited.

**Alert inventory.** Generated from the Limit entries and the runbook each names. The model builder renders it beside the severity routing on the limits page (`docs/operations/limits.md`). Nobody edits it by hand.

**Secret inventory.** Hand-written at `docs/operations/secrets.json`. Each entry names the secret, its owner, where it lives, and its next rotation date, never a value. The owner reviews each date before it passes. An entry has this shape:

```json
{
  "name": "database-password",
  "owner": "operations",
  "location": "production vault",
  "rotationDate": "2027-02-01"
}
```

**Sub-processor list.** Generated from the project's provider Actors. The model builder renders it on `docs/operations/sub-processors.md`. Nobody edits it by hand.

## Standards

### Start the stack with one local command

**Requirement:** A workspace MUST start WebApi, PostgreSQL, configured frontends, and its Worker where one exists, with one local command named in the consumer `AGENTS.md`.

**Rationale:** The baseline command is Aspire's `AppHost`, and `ServiceDefaults` supplies the shared discovery, health, resilience, and telemetry defaults its resources rely on. A workspace that orchestrates the same set another way satisfies this rule with its own command. The obligation is that one command brings the stack up, not that one tool does.

### Emit correlated diagnostics

**Requirement:** A host MUST emit structured logs, traces, and metrics, with correlation identifiers on logs and traces and service labels on metrics.

**Rationale:** Logs and traces carry timestamp, level, service, environment, trace identifier, and span identifier. Metrics carry service and environment labels. Correlated identifiers let one request be followed across hosts. Stable event names keep dashboards working across releases.

### Pass trace context in the W3C format

**Requirement:** A host MUST read and write trace context as the [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent` and `tracestate` headers, using one configured propagator.

**Rationale:** An identifier that each host formats its own way correlates nothing across the boundary between them. `traceparent` is the format OpenTelemetry implements and every managed backend accepts. A trace then crosses a frontend, an API, a background host, and a provider without translation.

One propagator is the part that matters. Two configured propagators produce two identifiers for one request, and the trace splits at whichever hop reads the other one.

**Example:** The trace identifier in a Problem Details response is the trace-id field of the current `traceparent`, which is what `litespec/backend/api#return-stable-problem-details` returns.

### Separate liveness and readiness

**Requirement:** A host MUST expose `/health/live` without dependency checks and `/health/ready` including its critical dependencies.

**Rationale:** Readiness fails when the application cannot safely serve traffic, while liveness stays true so the orchestrator does not restart a healthy process.

### Apply schema changes outside request startup

**Requirement:** A hosted schema change MUST run as a dedicated release step before traffic shifts, reviewed against both application versions.

**Rationale:** A replica that applies schema at startup races its siblings and serves traffic against a half-applied schema.

### Define backup and restore behavior

**Requirement:** A release MUST document backup owner, schedule, retention, encryption, location, restore command, and recovery objectives.

**Rationale:** A backup without a tested restore is not a backup.

### Exercise a restore before the first production data

**Requirement:** A project MUST rehearse a restore on representative data before its first deployment holds production data.

**Rationale:** The first restore attempt is the wrong time to learn the backup cannot restore.

### Use a repeatable deployment

**Requirement:** A deployment MUST use versioned artifacts, declared configuration, a schema step, readiness checks, and a passing release job.

**Rationale:** Deploying from an uncommitted tree or a mutable branch reference makes the deployed content unknowable afterwards.

### Keep rollback executable

**Requirement:** The rollback runbook MUST state the previous artifact reference, command, configuration and schema compatibility, data recovery condition, and the expand-and-contract sequence for destructive schema work.

**Rationale:** Rollback is a required runbook, so `litespec/quality/operations#exercise-every-runbook-before-release` rehearses it.

### Operate background work independently

**Requirement:** A Worker MUST publish its own liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior.

**Rationale:** WebApi readiness otherwise hides a failed durable-delivery Worker while the queue grows unobserved.

### Report liveness from every recurring job

**Requirement:** Every recurring job MUST report liveness that pages a person when the job goes silent.

**Rationale:** A job that stops without a signal looks exactly like a job with nothing to do.

### Bound external calls

**Requirement:** Every network call MUST declare an explicit timeout and cancellation path, with retries only for idempotent operations named by a bounded retry policy.

**Rationale:** An unbounded call holds a request thread until an unrelated system recovers.

### List every sub-processor

**Requirement:** A release MUST call only providers the generated sub-processor list names from the project's provider Actors.

**Rationale:** The model builder renders the list from the provider Actor records. A provider added in code but missing from the list answers a customer question wrong.

### Define actionable baseline alerts

**Requirement:** A baseline alert MUST declare owner, threshold, evaluation window, severity, and runbook before a production release.

**Rationale:** The alert inventory is generated from the Limit entries and the runbook each names.

### Cover the baseline alert set

**Requirement:** Baseline coverage MUST include sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments.

**Rationale:** These failures end a release when nobody observes them.

### Name a runbook on every alert

**Requirement:** Every alert MUST name the runbook that answers it.

**Rationale:** An alert without a runbook asks whoever receives it to invent the response.

### Route each severity to a declared destination

**Requirement:** An alert inventory MUST state, for each severity it uses, the destination that receives the alert and the response time expected of it.

**Rationale:** A declared severity with no destination is a label. Every alert then arrives in the same place, and the page that wakes somebody is read beside the one that does not need to. [Prometheus alerting practice](https://prometheus.io/docs/practices/alerting/) states the same separation between a page and a ticket. The limits page declares the routing beside the generated inventory.

**Example:** A two-severity inventory routes `page` to the on-call destination with a stated response time, and `ticket` to the queue reviewed each working day.

### Exercise every runbook before release

**Requirement:** Each required runbook MUST carry a dated rehearsal in the operations log before a production release, with restore rehearsed on representative data.

**Rationale:** A runbook is a claim until somebody runs it. The restore rehearsal is the one `litespec/quality/operations#exercise-a-restore-before-the-first-production-data` requires.

### Keep production secrets out of the repository

**Requirement:** Production environment values MUST live on the host, never in the repository.

**Rationale:** A secret committed once lives in history after deletion. The repository carries an example file with placeholders, and the host carries the values.

## Conventions

### Use stable service names

**Default:** Keep service, resource, meter, and trace-source names identical across environments.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** A deployment-generated identifier breaks every dashboard and alert that referenced the previous name.

### Keep runbooks near project documentation

**Default:** Place runbooks under `docs/runbooks/` stating trigger, impact, prerequisites, steps, and verification, covering restore, rollback, schema failure, leaked secrets, dependency outages, and extension recovery.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** One folder keeps every procedure where the alert inventory points.

### Keep deployment descriptors together

**Default:** Keep compose files, proxy configuration, the environment example, database setup, observability, DNS records, alert definitions, service definitions, and bootstrap scripts under one `deploy/` tree.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** Every consumer builds this tree, and each one asks which files it holds. One named tree answers before the questions start.

## Reference example

This informative example demonstrates `litespec/quality/operations#use-a-repeatable-deployment` and `litespec/quality/operations#keep-rollback-executable`.

A release applies a reviewed Marten schema plan and deploys the versioned API artifact. It waits for `/health/ready`, then runs the included end-to-end tests. One retained command restores the previous artifact when a test fails.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/quality/operations#start-the-stack-with-one-local-command | guidance | Does one command named in AGENTS.md start every local resource? |
| litespec/quality/operations#emit-correlated-diagnostics | guidance | Do logs and traces carry correlation identifiers, and metrics service labels? |
| litespec/quality/operations#pass-trace-context-in-the-w3c-format | guidance | Does one propagator read and write W3C trace context on every host? |
| litespec/quality/operations#apply-schema-changes-outside-request-startup | guidance | Does the schema step run before traffic shifts, and never at replica startup? |
| litespec/quality/operations#define-backup-and-restore-behavior | guidance | Does the release document owner, schedule, retention, encryption, location, command, and objectives? |
| litespec/quality/operations#exercise-a-restore-before-the-first-production-data | guidance | Did the project rehearse a restore on representative data before production data? |
| litespec/quality/operations#use-a-repeatable-deployment | guidance | Does every deployment use versioned artifacts, declared configuration, and a passing release job? |
| litespec/quality/operations#keep-rollback-executable | guidance | Does the rollback runbook state its reference, command, compatibility, and data condition? |
| litespec/quality/operations#operate-background-work-independently | guidance | Does the Worker publish its own health, rates, counts, age, and shutdown behavior? |
| litespec/quality/operations#report-liveness-from-every-recurring-job | guidance | Does every recurring job report liveness that pages a person on silence? |
| litespec/quality/operations#bound-external-calls | guidance | Does every network call declare a timeout, a cancellation path, and bounded idempotent retries? |
| litespec/quality/operations#list-every-sub-processor | guidance | Does every provider the code calls appear as a provider Actor? |
| litespec/quality/operations#separate-liveness-and-readiness | guidance | Does liveness ignore dependencies while readiness checks the critical ones? |
| litespec/quality/operations#define-actionable-baseline-alerts | guidance | Does every baseline alert declare owner, threshold, window, severity, and runbook? |
| litespec/quality/operations#cover-the-baseline-alert-set | guidance | Does baseline coverage include sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments? |
| litespec/quality/operations#name-a-runbook-on-every-alert | guidance | Does every alert name the runbook that answers it? |
| litespec/quality/operations#route-each-severity-to-a-declared-destination | guidance | Does every severity state its destination and expected response time? |
| litespec/quality/operations#exercise-every-runbook-before-release | guidance | Does every required runbook carry a dated rehearsal in the operations log? |
| litespec/quality/operations#keep-production-secrets-out-of-the-repository | guidance | Are production values on the host, with only placeholders in the repository? |
| litespec/quality/operations#use-stable-service-names | guidance | Are service, resource, meter, and trace names identical across environments, or is an Exception recorded? |
| litespec/quality/operations#keep-runbooks-near-project-documentation | guidance | Is every runbook under docs/runbooks with its sections, or is an Exception recorded? |
| litespec/quality/operations#keep-deployment-descriptors-together | guidance | Are the deployment descriptors under one deploy tree, or is an Exception recorded? |
