# Operations

## Intent

Operating a product means starting it, watching it, deploying it, backing it up, and answering alerts with tested procedures, and this page states how a LiteSpec product does each: local startup, diagnostics, deployment and rollback, backup and restore, and alerts that each name their runbook. It applies to everyone who operates a release and to any behavior change that touches schema, external dependencies, background work, or failure recovery. A product that follows it stays observable, deployable, and recoverable with one maintainer on call.

## Concepts

### Operating Records

Everything this page asks an operator to know lives in one of four records, each with a fixed home and one writer. A person writes the operations log and the secret inventory; the model builder writes the alert inventory and the sub-processor list from the project records. Only the operations log keeps the past: the other three describe the present. Each record names its owner from the project's owner list.

### Operations Log

The operations log is append-only: one file per month under `docs/operations/log/`, named `YYYY-MM.md`, with entries appended and never edited. It records branch-protection bypasses, runbook rehearsals, restores, production deployments, and incidents, so the dated rehearsal each runbook needs has one home.

### Alert Inventory

The alert inventory lists the baseline alerts and the runbook each one names. A runbook is the procedure that answers an alert. The model builder renders the inventory from the limit entries, each naming one bound the product runs within and the runbook that answers it, beside the severity routing on the limits page at `docs/operations/limits.md`. The severity routing states where each severity level goes and how fast it is answered. Nobody edits the inventory by hand.

### Secret Inventory

The secret inventory is hand-written at `docs/operations/secrets.json`. Each entry names the secret, its owner, where it lives, and its next rotation date, and never the value itself. The owner reviews each rotation date before it passes. An entry has this shape:

```json
{
  "name": "database-password",
  "owner": "operations",
  "location": "production vault",
  "rotationDate": "2027-02-01"
}
```

### Sub-Processor List

The sub-processor list names every provider that processes personal data for the product. The model builder renders it from the project's provider actors, the actor records that name its providers, on `docs/operations/sub-processors.md`. Nobody edits it by hand.

## Standards

### Start the Stack with One Local Command

**Statement:** A workspace MUST start WebApi, PostgreSQL, configured frontends, and its Worker where one exists, with one local command named in the consumer `AGENTS.md`.

**Rationale:** A stack that needs several terminals and a wiki page starts differently for every developer, and the differences become bug reports nobody can reproduce. One named command brings WebApi, PostgreSQL, the frontends, and the background Worker up together, so every developer and every agent starts from the same running system. The baseline command is Aspire's `AppHost`, with `ServiceDefaults` supplying the shared discovery, health, resilience, and telemetry defaults its resources rely on. A workspace that orchestrates the same set another way satisfies this rule with its own command: the obligation is that one command brings the stack up, not that one tool does.

### Emit Correlated Diagnostics

**Statement:** A host MUST emit structured logs, traces, and metrics, with correlation identifiers on logs and traces and service labels on metrics.

**Rationale:** Each running service is a host, and one request often crosses several. Logs and traces carry timestamp, level, service, environment, trace identifier, and span identifier, and metrics carry service and environment labels. The correlation identifiers let one request be followed across every host it touched, which is the only trail a cross-host failure leaves. Stable event names keep dashboards working across releases instead of breaking each time a message is reworded.

### Pass Trace Context in the W3C Format

**Statement:** A host MUST read and write trace context as the [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent` and `tracestate` headers, using one configured propagator.

**Rationale:** An identifier that each host formats its own way correlates nothing across the boundary between them. `traceparent` is the format OpenTelemetry implements and every managed backend accepts, so a trace crosses a frontend, an API, a background host, and a provider without translation.

One propagator, the component that reads and writes the headers, is the part that matters: two configured propagators produce two identifiers for one request, and the trace splits at whichever hop reads the other one.

**Example:** The trace identifier in a Problem Details response is the `trace-id` field of the current `traceparent`, which is what `litespec/backend/api#return-stable-problem-details` returns.

### Separate Liveness and Readiness

**Statement:** A host MUST expose `/health/live` without dependency checks and `/health/ready` including its critical dependencies.

**Rationale:** Liveness answers whether the process is alive; readiness answers whether it can safely serve traffic. When a dependency fails, readiness fails so the orchestrator stops sending traffic, while liveness stays true so the orchestrator does not restart a healthy process. One endpoint for both forces a choice between serving traffic the application cannot handle and restarting a process that only needs its dependency back.

### Apply Schema Changes Outside Request Startup

**Statement:** A hosted schema change MUST run as a dedicated release step before traffic shifts, reviewed against both application versions.

**Rationale:** Schema work is a release step, not a startup step. A replica that applies schema at startup races its siblings, and each one serves traffic against a half-applied schema until the race settles. Running the change as one dedicated step before traffic shifts, reviewed against both the old and the new application version, keeps every replica on the same schema from its first request.

### Define Backup and Restore Behavior

**Statement:** A release MUST document backup owner, schedule, retention, encryption, location, restore command, and recovery objectives.

**Rationale:** A backup is only as good as its restore: without a named owner, a schedule, a retention bound, encryption, a location, a restore command, and recovery objectives, nobody knows what is kept, who restores it, or how much loss is accepted. Writing all seven down before production data arrives leaves nothing to decide during the incident.

### Exercise a Restore Before the First Production Data

**Statement:** A project MUST rehearse a restore on representative data before its first deployment holds production data.

**Rationale:** Backups fail in ways only a restore reveals: a missing key, a wrong permission, a dump the new version cannot read. Rehearsing on representative data before production data arrives finds those failures while they cost nothing. The first restore attempt is the wrong time to learn the backup cannot restore.

### Use a Repeatable Deployment

**Statement:** A deployment MUST use versioned artifacts, declared configuration, a schema step, readiness checks, and a passing release job.

**Rationale:** A repeatable deployment names everything it ships: a versioned artifact, declared configuration, a schema step, readiness checks, and a passing release job. Deploying from an uncommitted tree or a mutable branch reference makes the deployed content unknowable afterwards, because the same reference points at different code a week later. Named inputs let any deployment be repeated and any incident be traced to its exact content.

### Keep Rollback Executable

**Statement:** The rollback runbook MUST state the previous artifact reference, command, configuration and schema compatibility, data recovery condition, and the expand-and-contract sequence for destructive schema work.

**Rationale:** Rollback is written during the incident if it is not written before it, and an incident is the worst time to work out which artifact was live, which command restores it, and whether the schema still fits. Stating the previous artifact reference, the command, the configuration and schema compatibility, the data recovery condition, and the expand-and-contract sequence keeps each answer ready. Rollback is a required runbook, so `litespec/quality/operations#exercise-every-runbook-before-release` rehearses it.

### Operate Background Work Independently

**Statement:** A Worker MUST publish its own liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior.

**Rationale:** A Worker fails on its own schedule: its queue grows, its retries climb, its oldest item ages, while WebApi keeps answering health checks. Without its own liveness, readiness, processing rate, failure count, retry count, oldest pending age, and shutdown behavior, the failure stays invisible until the backlog is the incident. WebApi readiness otherwise hides a failed Worker while the queue grows unobserved.

### Report Liveness from Every Recurring Job

**Statement:** Every recurring job MUST report liveness that pages a person when the job goes silent.

**Rationale:** A recurring job with nothing to do is quiet, and a recurring job that stopped is quiet too. Without a liveness signal that pages a person on silence, the two stay indistinguishable until somebody notices the missing output. Liveness turns a quiet job from an observation into an alarm.

### Bound External Calls

**Statement:** Every network call MUST declare an explicit timeout and cancellation path, with retries only for idempotent operations named by a bounded retry policy.

**Rationale:** Every network call waits on a system the product does not control. Without an explicit timeout and cancellation path, one slow provider holds a request thread until that unrelated system recovers, and each held thread is one less thread for healthy requests. Retries stay bounded and idempotent-only, because retrying a call that already acted repeats the act.

### List Every Sub-Processor

**Statement:** A release MUST call only providers the generated sub-processor list names from the project's provider actors.

**Rationale:** Customers ask which providers touch their data, and the sub-processor list is the answer. The model builder renders it from the provider actor records, so a provider added in code but missing from the list answers that question wrong. Generating the list from records keeps the answer and the code in step.

### Define Actionable Baseline Alerts

**Statement:** A baseline alert MUST declare owner, threshold, evaluation window, severity, and runbook before a production release.

**Rationale:** Each declared field answers one failure mode:

- An alert with no owner waits for somebody to adopt it.
- An alert with no threshold or evaluation window fires on noise.
- An alert with no severity waits in the wrong queue.
- An alert with no runbook asks its receiver to invent the response.

Declaring all five before production makes each alert answerable the first time it fires.

### Cover the Baseline Alert Set

**Statement:** Baseline coverage MUST include sustained readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments.

**Rationale:** Five failures end a release when nobody observes them: readiness that never recovers, HTTP errors the code did not expect, a slowing release flow, a lost database, and a deployment that failed partway. Naming them as the minimum coverage keeps a team from declaring alerts only for the failure it just survived.

### Name a Runbook on Every Alert

**Statement:** Every alert MUST name the runbook that answers it.

**Rationale:** An alert fires at the worst time to design a procedure. Without a named runbook, whoever receives it invents the response under pressure, and two receivers invent two different ones. The named runbook gives the first response a tested starting point.

### Route Each Severity to a Declared Destination

**Statement:** An alert inventory MUST state, for each severity it uses, the destination that receives the alert and the response time expected of it.

**Rationale:** A declared severity with no destination is a label: every alert arrives in the same place, and the page that wakes somebody is read beside the one that can wait. Routing each severity to its destination with an expected response time separates the page from the ticket, which is the separation [Prometheus alerting practice](https://prometheus.io/docs/practices/alerting/) states. The limits page declares the routing beside the generated inventory.

**Example:** A two-severity inventory routes `page` to the on-call destination with a stated response time, and `ticket` to the queue reviewed each working day.

### Exercise Every Runbook Before Release

**Statement:** Each required runbook MUST carry a dated rehearsal in the operations log before a production release, with restore rehearsed on representative data.

**Rationale:** A runbook is a claim until somebody runs it: steps go stale, commands change, permissions lapse. A dated rehearsal in the operations log proves each required runbook still works against the current system. The restore rehearsal is the one `litespec/quality/operations#exercise-a-restore-before-the-first-production-data` requires.

### State Availability Objectives as OpenSLO Files

**Statement:** A production release MUST state its availability and latency objectives as OpenSLO files compiled by Sloth.

**Rationale:** OpenSLO files state objectives as code, and Sloth validates them in CI and compiles them into Prometheus recording rules and burn-rate alerts. OpenTelemetry supplies the signals the objectives read, as `litespec/quality/operations#emit-correlated-diagnostics` states. Sloth and OpenTelemetry are free and maintained under Apache-2.0, and availability stays evidenced in production only.

### Attach Dashboard Links to Production Objectives

**Statement:** Each production objective MUST link to its dashboard in the book.

**Rationale:** The book states intent while dashboards show production truth, and the link joins them: a reviewer clicks from the objective to the numbers behind it. Copying numbers into the page instead would freeze production truth at commit time.

### Keep Production Secrets Out of the Repository

**Statement:** Production environment values MUST live on the host, never in the repository.

**Rationale:** A secret committed once lives in history after deletion, readable to everyone the repository ever reaches. Keeping production values on the host and only placeholders in a repository example file keeps the values with the deployment that needs them and out of every clone.

## Conventions

### Use Stable Service Names

**Default:** Keep service, resource, meter, and trace-source names identical across environments.

**Replacement:** A consumer records a service-naming convention naming how its services, resources, meters, and trace sources are named.

**Rationale:** Dashboards and alerts reference services by name. When a name changes with each deployment, every reference breaks and must be rebuilt before the new deployment can be watched. Identical names across environments keep one dashboard and one alert set working everywhere.

### Keep Runbooks Near Project Documentation

**Default:** Place runbooks under `docs/runbooks/` stating trigger, impact, prerequisites, steps, and verification, covering restore, rollback, schema failure, leaked secrets, dependency outages, and extension recovery.

**Replacement:** A consumer records a runbook-layout convention naming where its runbooks live and what each holds.

**Rationale:** An alert names its runbook, and the reader follows the pointer under pressure. One folder for every runbook keeps each pointer resolving to a procedure with the same sections: trigger, impact, prerequisites, steps, and verification. A runbook kept anywhere else breaks the pointer the alert gave.

### Keep Deployment Descriptors Together

**Default:** Keep compose files, proxy configuration, the environment example, database setup, observability, DNS records, alert definitions, service definitions, and bootstrap scripts under one `deploy/` tree.

**Replacement:** A consumer records a deployment-layout convention naming where its deployment descriptors live.

**Rationale:** Deployment spreads across compose files, proxy configuration, environment examples, database setup, observability, DNS records, alert definitions, service definitions, and bootstrap scripts. Scattered across the workspace, one of them is always the file nobody finds during an incident. One `deploy/` tree keeps every descriptor where the operator looks first.

## Reference Example

This informative example demonstrates `litespec/quality/operations#use-a-repeatable-deployment` and `litespec/quality/operations#keep-rollback-executable`.

A release applies a reviewed Marten schema plan as its schema step, then deploys the versioned API artifact. It waits for `/health/ready` before shifting traffic, then runs the included end-to-end tests. When a test fails, one retained rollback command restores the previous artifact.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/quality/operations#start-the-stack-with-one-local-command | guidance | One command named in the consumer `AGENTS.md` starts WebApi, PostgreSQL, the frontends, and the Worker. |
| litespec/quality/operations#emit-correlated-diagnostics | guidance | Logs and traces carry correlation identifiers, and metrics carry service labels. |
| litespec/quality/operations#pass-trace-context-in-the-w3c-format | guidance | One propagator reads and writes W3C trace context on every host. |
| litespec/quality/operations#separate-liveness-and-readiness | guidance | Liveness answers without dependency checks while readiness includes the critical ones. |
| litespec/quality/operations#apply-schema-changes-outside-request-startup | guidance | The schema step runs before traffic shifts, with no schema work at replica startup. |
| litespec/quality/operations#define-backup-and-restore-behavior | guidance | The release documentation states backup owner, schedule, retention, encryption, location, restore command, and recovery objectives. |
| litespec/quality/operations#exercise-a-restore-before-the-first-production-data | guidance | The operations log holds a restore rehearsal on representative data before the first production data. |
| litespec/quality/operations#use-a-repeatable-deployment | guidance | Each deployment names versioned artifacts, declared configuration, a schema step, readiness checks, and a passing release job. |
| litespec/quality/operations#keep-rollback-executable | guidance | The rollback runbook states its artifact reference, command, compatibility, data condition, and expand-and-contract sequence. |
| litespec/quality/operations#operate-background-work-independently | guidance | The Worker publishes its own health, rates, counts, oldest pending age, and shutdown behavior. |
| litespec/quality/operations#report-liveness-from-every-recurring-job | guidance | Each recurring job reports liveness that pages a person on silence. |
| litespec/quality/operations#bound-external-calls | guidance | Each network call declares a timeout, a cancellation path, and bounded retries for idempotent operations only. |
| litespec/quality/operations#list-every-sub-processor | guidance | Each provider the release calls appears on the generated sub-processor list. |
| litespec/quality/operations#define-actionable-baseline-alerts | guidance | Each baseline alert declares owner, threshold, window, severity, and runbook. |
| litespec/quality/operations#cover-the-baseline-alert-set | guidance | The baseline alerts cover readiness failures, unexpected HTTP errors, release-flow latency, PostgreSQL outages, and failed deployments. |
| litespec/quality/operations#name-a-runbook-on-every-alert | guidance | Each alert names the runbook that answers it. |
| litespec/quality/operations#route-each-severity-to-a-declared-destination | guidance | Each severity states its destination and expected response time on the limits page. |
| litespec/quality/operations#exercise-every-runbook-before-release | guidance | Each required runbook carries a dated rehearsal in the operations log. |
| litespec/quality/operations#state-availability-objectives-as-openslo-files | guidance | The OpenSLO files pass Sloth validation with their generated alerts loaded. |
| litespec/quality/operations#attach-dashboard-links-to-production-objectives | guidance | Each production objective in the book links its dashboard. |
| litespec/quality/operations#keep-production-secrets-out-of-the-repository | guidance | Production values live on the host, with only placeholders in the repository example file. |
| litespec/quality/operations#use-stable-service-names | guidance | Service, resource, meter, and trace-source names match across environments, or the service-naming convention names another arrangement. |
| litespec/quality/operations#keep-runbooks-near-project-documentation | guidance | Each runbook sits under `docs/runbooks/` with its sections, or the runbook-layout convention names another arrangement. |
| litespec/quality/operations#keep-deployment-descriptors-together | guidance | The deployment descriptors sit under one `deploy/` tree, or the deployment-layout convention names another arrangement. |
