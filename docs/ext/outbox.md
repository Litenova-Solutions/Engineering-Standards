# Outbox Worker

## Intent

The outbox pattern makes a business change and the message it owes the outside world durable together, so no crash between the two loses the message. This page states how the product stages that message in the same database transaction as the business commit and how a background Worker delivers it later with retry, idempotency, visibility, and safe replay. A team selects it for each use case whose committed change needs delivery that survives process failure, so no accepted change silently drops its consequence.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

A use case selects this extension when a committed change needs delivery that survives a process failure. That delivery can carry an integration event to another system, a command that advances a journey step, or a side effect on an outside provider. Selecting it also activates `litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request`: the project declares the execution host that runs the dispatcher.

## Baseline Relationship

This extension replaces `litespec/backend/persistence#collect-events-without-a-public-unit-of-work`.

This extension switches on no optional record type: integration events, settings, and runbooks belong to the core. The project writes an integration-event record for each integration event it delivers, setting records for the delivery bounds, and runbook records for recovery and rollback.

## Standards

### Stage After-Commit Effects in the Outbox

**Statement:** A use case declaring `after-commit` `publishes` or `issues` effects MUST stage each effect in the outbox in the same transaction as its changes.

**Rationale:** After-commit timing promises the message follows the commit: staged in the same transaction, the change and its message share one fate. An effect sent from memory instead would vanish on a crash between the commit and the send. `litespec/core/behavior#declare-every-effect-with-one-verb-and-its-timing` states the effect verbs and their timing, and `async` effects dispatch without the transaction.

### Declare Published Facts as Integration Events

**Statement:** Each `publishes` effect MUST name an integration-event record carrying direction, payload, and trust.

**Rationale:** A published fact without a record is a promise nobody versioned: readers depend on fields no page states, and a field change breaks them without a diff. The integration-event record states the direction, the payload with its classifications, and the trust readers place in it. `litespec/core/behavior#publish-every-outbound-integration-event-from-effects` states the declaration, and `litespec/core/behavior#describe-every-integration-event-for-its-direction` states the record.

### Record Durable Delivery Behavior

**Statement:** A durable-delivery specification MUST document delivery guarantee, downstream boundary, duplicate behavior, retry horizon, recovery owner, record owner, and status.

**Rationale:** Delivery crosses a system boundary, so the team agrees up front on the guarantee, the boundary, the duplicate behavior, the retry horizon, and who recovers when delivery fails. Without that agreement, the writer assumes once-only delivery while the target assumes retries, and both discover the mismatch in production. A draft names its decider and decide-by date so the agreement lands before the first message does.

### Exclude Manually Repeatable Reactions

**Statement:** A project MUST NOT activate outbox for a reaction whose delivery guarantee is best-effort and which operators can repeat manually.

**Rationale:** Outbox storage, dispatch, retries, and replay exist to prevent loss; a reaction whose loss the operators accept and can repeat by hand needs none of that machinery. The reaction's `onFailure` states its best-effort handling, and the use case page records the accepted gap.

### Publish Best-Effort Reactions After Commit

**Statement:** A reaction the outbox excludes MUST publish after its commit succeeds without staging an outbox record.

**Rationale:** Without an outbox record, nothing survives a crash between the commit and the publish, so the reaction publishes immediately after its commit succeeds and accepts the gap. Publishing before the commit risks worse: the reaction fires for a change the database then rolls back.

### Stage Messages with Business Work

**Statement:** A command post-handler MUST stage pending durable messages in the same scoped business session as its aggregate changes.

**Rationale:** The business change and its message share one fate: both persist or neither does. Staging the message in the same scoped business session as the aggregate changes puts both under one commit, so a crash can never leave an accepted change without its message or a message without its change.

### Serialize Durable Messages

**Statement:** An outbox writer MUST serialize each pending durable message into an outbox record.

**Rationale:** The command scope ends when the request ends, while dispatch happens later in a Worker that never saw the request. Serializing the message into an outbox record gives that Worker everything it needs after the scope is gone.

### Store Required Message Fields

**Statement:** An outbox record MUST contain message identity, kind, stable type, schema version, time, payload, tenant, state, attempt, and next-attempt data.

**Rationale:** The dispatcher, the retry logic, and the operator each read the record: identity and type route it, the schema version selects its reader, time and tenant scope it, and state, attempt, and next-attempt data drive the retry. A field stored nowhere forces one of those readers to guess.

### Store Failure and Completion Evidence

**Statement:** An outbox record MUST retain its last error summary and completion time.

**Rationale:** When delivery stalls, the operator opens the record first: the last error summary says why the previous attempt failed, and the completion time says which records finished. Without that evidence on the record, each investigation starts from scattered logs instead.

### Classify Message Kinds

**Statement:** An outbox record MUST name its message kind as integration event, journey-step command, or provider side effect, with an integration event citing its integration-event record.

**Rationale:** An integration event, a journey-step command, and a provider side effect dispatch through different owners and transports, so the record names which one it holds. The integration event cites its integration-event record, so the staged message traces to the published fact it carries.

### Reject Independent Outbox Commits

**Statement:** An outbox writer MUST NOT use another connection or independent commit for required durable delivery.

**Rationale:** Two commits on two connections can split around a crash: the business change persists while the message rolls back, or the message persists for a change that never happened. Sharing one PostgreSQL database does not make separate transactions atomic, so the message joins the business transaction instead.

### Dispatch Claimed Records in Worker

**Statement:** A Worker MUST claim pending outbox records, dispatch a bounded batch, and record success or retry information.

**Rationale:** Dispatch needs time, retries, and network calls that no request transaction can hold. The Worker claims pending records, dispatches a bounded batch, and records each outcome, so the request commits fast while delivery proceeds on its own schedule.

### Exclude Request-Transaction Dispatch

**Statement:** WebApi MUST NOT dispatch a durable message inside the request transaction.

**Rationale:** A network call inside the request transaction holds database locks while the outside world answers, and a slow target slows every request behind it. The request commits only to make the message eligible; the Worker performs the delivery later.

### Define Claim Ownership

**Statement:** An outbox claim MUST use a short transaction with the lease owner, lease expiry, and fencing value that `litespec/ext/jobs#store-execution-leases` defines.

**Rationale:** Several Workers poll the same store, so each dispatch attempt needs one owner: the lease owner, the lease expiry, and the fencing value name it. The short transaction takes the claim without holding locks into the delivery itself.

### Release Claim Transactions Before Calls

**Statement:** A Worker MUST NOT hold an outbox claim transaction open during a network call.

**Rationale:** A network call to a slow target can last seconds or minutes. Holding the claim transaction open across that call pins database locks and connection slots, starving the Workers behind it; releasing the claim first lets the database serve other work while the call runs.

### Restrict Completion to Current Lease Owners

**Statement:** A Worker MUST update an outbox record only while it owns the matching lease and fencing value.

**Rationale:** A Worker that lost its lease, through a crash, a pause, or an expiry, can wake up after another Worker claimed the same record. Checking the lease and fencing value before each update stops the stale Worker from overwriting the current owner's result.

### Requeue Expired Claims

**Statement:** An outbox store MUST return expired claims to eligible work.

**Rationale:** A Worker can die between claiming a record and dispatching it. Returning expired claims to eligible work lets a live Worker pick them up, so one crash delays a message instead of losing it.

### Accept Repeated Delivery

**Statement:** An outbox consumer MUST handle the same message more than once.

**Rationale:** The target can accept a message while the Worker crashes before recording completion, and the requeued claim then dispatches it again. Delivery promises at-least-once, so every consumer handles the same message more than once without corrupting its state.

### Identify Repeated Delivery

**Statement:** An outbox consumer MUST use message ID or a business idempotency key at its Command or side-effect boundary.

**Rationale:** Handling a repeat means recognizing it: the message ID or a business idempotency key gives the target a stable identity to check at its command or side-effect boundary. Without that key, the target processes the repeat as new work and charges, notifies, or ships twice.

### Await Target Acceptance

**Statement:** A Worker MUST NOT mark an outbox record complete before the target boundary accepts it.

**Rationale:** Marking a record complete before the target accepts it declares a delivery that never happened, and no retry follows because the record looks done. The Worker waits for the target boundary's acceptance before recording completion.

### Bound Delivery Retries

**Statement:** An outbox dispatcher MUST use bounded exponential backoff with jitter.

**Rationale:** A failing target with ten thousand pending messages meets a retry storm when every message retries at once on a fixed interval. Bounded exponential backoff with jitter spreads the retries over time and caps the total, so the target recovers instead of drowning.

### Classify Permanent Delivery Failure

**Statement:** An outbox dispatcher MUST classify permanent failures, stop automatic retry at its retry bound, and retain safe investigation and replay data.

**Rationale:** Some failures never clear on retry: a deleted destination, a rejected payload, a revoked credential. Retrying those forever burns resources and buries the real backlog, so the dispatcher classifies them, stops at its retry bound, and keeps the evidence an operator needs to investigate and replay safely.

### Distinguish Dependency Outage

**Statement:** A dispatcher MUST distinguish an unavailable outbox store from a failed claimed message.

**Rationale:** A dead outbox store and a failed delivery ask for different recoveries: the first needs a database restored, the second needs one destination investigated. Each carries its own signal. The store's availability is a gauge the readiness endpoint reads, while a claimed message's outcome is a counter carrying the result, following [the OpenTelemetry metrics specification](https://opentelemetry.io/docs/specs/otel/metrics/). A single error counter cannot tell an operator whether to restore a database or investigate one destination.

### Back off Unavailable-Store Polling

**Statement:** A Worker MUST apply bounded backoff and rate-limited logging when its outbox store is unavailable.

**Rationale:** A Worker that polls a dead store on a tight loop writes an exception per iteration and fills disks and log quotas before anyone reads the first one. Bounded backoff with rate-limited logging keeps the Worker alive and quiet until the store returns.

### Restrict Message Retry to Claimed Records

**Statement:** A Worker MUST apply message retry and poison handling only to claimed outbox records.

**Rationale:** Retry and poison handling act on a claimed message; when the store itself is down, no claim exists and no message waits for delivery. Running retry logic against the outage double-counts attempts and can dead-letter messages whose only fault was an unreachable store.

### Gate Dispatch on Readiness

**Statement:** A Worker host exposing readiness MUST gate dispatch and stop polling stores that cannot serve requests.

**Rationale:** A host that reports unready still serves traffic it cannot finish when its Workers keep polling dead stores. Gating dispatch on readiness stops the polling, so the host fails fast and recovers instead of churning against storage that cannot answer.

### Version Message Types

**Statement:** An outbox message MUST use a stable type name and explicit schema version.

**Rationale:** An outbox record outlives the deployment that wrote it, so the dispatcher meets records written by several versions at once. A stable type name with an explicit schema version tells the dispatcher which reader parses each record; without the pair, one shape change breaks every record written before it.

### Support Coexisting Message Producers

**Statement:** A deployed dispatcher MUST process records from every application version that can coexist during rollout or rollback.

**Rationale:** During rollout and rollback, several application versions share one store and write different valid shapes into it. The dispatcher reads from every version that can coexist, or the deployment itself causes delivery failures.

Each message record therefore carries its own shape version, and the dispatcher selects a reader from that value. Adding an optional member with a defined absent-value behavior needs no new version. Removing a member, renaming one, narrowing a type, or changing a discriminator needs a new version, and the reader for each version stays until no record carries that version.

### Publish Backlog Indicators

**Statement:** An outbox deployment MUST publish pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate.

**Rationale:** Pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate together show whether delivery keeps up: growth in the backlog or age reveals a stall, while duration and success rate reveal a struggling target. Without these indicators, the first sign of failure is a customer asking where their message went.

### Set Delivery Alerts

**Statement:** An outbox deployment MUST set alert thresholds as setting records from its use-case delivery target.

**Rationale:** A shipment notice delayed an hour and a receipt delayed a week carry different business consequences, so each use case sets alert thresholds from its own delivery target. Setting records hold those thresholds, so the alert fires when delay passes what the business accepted.

### Model Outbox Lifecycle States

**Statement:** An outbox record MUST model its lifecycle as an abstract state base with one sealed record for each of pending, processing, dispatched, and dead-letter.

**Rationale:** `pending` becomes `processing`, and `processing` becomes `dispatched`, `pending`, or `dead-letter`, while audited replay moves `dead-letter` back to `pending`. Three of the four states carry data the others do not: `processing` holds a lease expiry, `dispatched` holds a dispatch time, and `dead-letter` holds a failure reason and an attempt count. A four-value label forces those onto nullable columns that mean something in one state each, which is the shape `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` removes everywhere else.

**Example:** `OutboxState.Processing` carries one unexpired lease before a dispatcher records `OutboxState.Dispatched` or a retry state.

### Preserve Message Identity During Retry

**Statement:** An outbox dispatcher MUST preserve message ID across retry and replay.

**Rationale:** The target suppresses a repeat by recognizing its identity, which works only when every retry and replay carries the same message ID. A dispatcher that mints a new ID per attempt turns each retry into a new message the target processes again.

### Audit Outbox Replay

**Statement:** An outbox replay MUST record actor, reason, time, and failure without editing the payload: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** A replay dispatches a message the system already handled or dead-lettered, so the team records who replayed it, why, when, and which failure it answers. Without that record, a duplicate delivery looks like a dispatcher bug instead of an operator's decision, and nobody can reconstruct the choice.

### Protect Active Worker Compatibility

**Statement:** New WebApi code MUST emit a message only after every active Worker can read its type and schema version.

**Rationale:** WebApi writers and Worker dispatchers deploy independently, so a writer can run ahead of the oldest active Worker. When the writer emits a shape that Worker cannot read, those messages dead-letter on arrival through no fault of their own.

### Deploy Readers Before Writers

**Statement:** A release MUST deploy compatible readers before writers for additive event versions.

**Rationale:** In a mixed-version rollout, old and new records sit in one store. Deploying compatible readers before the writers that emit new shapes keeps every record dispatchable at every step; the reverse order strands new records until the readers catch up.

### Plan Undispatched Rollback Records

**Statement:** A rollback Runbook MUST include records created by the new writer but not yet dispatched.

**Rationale:** Rolling back the deployment does not roll back the store: records the new writer staged but nobody dispatched stay behind. The rollback Runbook names how the previous version handles them, or they sit undispatched with no owner and no reader.

## Conventions

### Group Outbox Infrastructure

**Default:** Keep outbox record, storage, claim, and dispatch infrastructure under `Infrastructure/Messaging/Outbox/`.

**Replacement:** A project names another home for outbox infrastructure in its documentation.

**Rationale:** The outbox record, storage, claim, and dispatch code form one mechanism with one owner. Keeping it under `Infrastructure/Messaging/Outbox/` puts every persistent dispatch question in one folder instead of scattered across the project.

### Isolate the Worker Host

**Default:** Keep the outbox Worker host in its own project.

**Replacement:** A project hosts outbox dispatch inside its request host.

**Rationale:** The Worker runs as its own process with its own lifetime, scaling, and configuration, apart from the request host. Its own project keeps that independence visible and stops request concerns leaking into dispatch configuration.

### Keep Provider Mapping with Integration

**Default:** Keep Integration Event-to-provider mapping in the integration that owns the side effect.

**Replacement:** A project keeps provider mapping in the shared dispatch path.

**Rationale:** Each provider speaks its own transport with its own mapping, retries, and quirks. The integration that owns the side effect owns that mapping, so a provider change touches one integration instead of the shared dispatch path.

### Dispatch Journey-Step Commands in a New Scope

**Default:** Dispatch a journey-step command through `ICommandMediator` in a fresh Worker scope.

**Replacement:** A project runs journey-step commands inline in the dispatcher scope.

**Rationale:** A journey-step command is a full command with validation, authorization, and its own transaction, not a subroutine of the dispatcher. Sending it through `ICommandMediator` in a fresh Worker scope runs the whole application pipeline for it.

### Avoid Automatic Durable-Bus Adoption

**Default:** Use project-owned Marten records and Worker dispatch unless a manifest-pinned durable package passes a shared-transaction integration test.

**Replacement:** A project names a durable bus package as its dispatch transport in its documentation.

**Rationale:** A durable bus package earns its place only when an integration test proves it commits the message in the same transaction as the business work. Until that evidence exists, project-owned Marten records with Worker dispatch carry delivery without depending on behavior nobody verified.

## Dependencies

Packages: `None.`

Related extensions: `integrations`, `jobs`.

Guides: `None.`

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/outbox#stage-after-commit-effects-in-the-outbox | guidance | Each after-commit publishes and issues effect stages in the outbox in the same transaction as its changes. |
| litespec/ext/outbox#declare-published-facts-as-integration-events | guidance | Each publishes effect names an integration-event record carrying direction, payload, and trust. |
| litespec/ext/outbox#record-durable-delivery-behavior | guidance | Each delivery specification documents guarantee, downstream boundary, duplicate behavior, retry horizon, recovery owner, record owner, and status. |
| litespec/ext/outbox#exclude-manually-repeatable-reactions | guidance | Best-effort reactions that operators can repeat manually carry no outbox records. |
| litespec/ext/outbox#publish-best-effort-reactions-after-commit | guidance | Excluded reactions publish after commit success with no staged outbox record. |
| litespec/ext/outbox#stage-messages-with-business-work | guidance | Pending durable messages stage in the same scoped session as their aggregate changes. |
| litespec/ext/outbox#serialize-durable-messages | guidance | Each pending durable message lands serialized in an outbox record. |
| litespec/ext/outbox#store-required-message-fields | guidance | Each outbox record carries identity, kind, type, schema version, time, payload, tenant, state, attempt, and next-attempt data. |
| litespec/ext/outbox#store-failure-and-completion-evidence | guidance | Each outbox record retains its last error summary and completion time. |
| litespec/ext/outbox#classify-message-kinds | guidance | Each outbox record names integration event, journey-step command, or provider side effect, with integration events citing their integration-event record. |
| litespec/ext/outbox#reject-independent-outbox-commits | guidance | Writer sources stage through the business session with no separate connection or commit. |
| litespec/ext/outbox#dispatch-claimed-records-in-worker | guidance | The Worker claims pending records, dispatches bounded batches, and records each outcome. |
| litespec/ext/outbox#exclude-request-transaction-dispatch | guidance | Request paths commit eligibility only, with dispatch living in the Worker. |
| litespec/ext/outbox#define-claim-ownership | guidance | Each claim takes owner, expiry, and fencing value in a short transaction. |
| litespec/ext/outbox#release-claim-transactions-before-calls | guidance | Claim transactions close before the Worker makes network calls. |
| litespec/ext/outbox#restrict-completion-to-current-lease-owners | guidance | Record updates succeed only under the current lease and fencing value. |
| litespec/ext/outbox#requeue-expired-claims | guidance | Expired claims return to eligible work for a live Worker. |
| litespec/ext/outbox#accept-repeated-delivery | guidance | Each consumer keeps correct state when the same message arrives twice. |
| litespec/ext/outbox#identify-repeated-delivery | guidance | Each consumer checks message ID or business key at its Command or side-effect boundary. |
| litespec/ext/outbox#await-target-acceptance | guidance | Completion records follow target acceptance, with no early completion. |
| litespec/ext/outbox#bound-delivery-retries | guidance | Retries run bounded exponential backoff with jitter. |
| litespec/ext/outbox#classify-permanent-delivery-failure | guidance | Permanent failures stop at the retry bound with safe investigation and replay data retained. |
| litespec/ext/outbox#distinguish-dependency-outage | guidance | Store availability reads as a gauge while claimed-message outcomes read as a counter. |
| litespec/ext/outbox#back-off-unavailable-store-polling | guidance | Polling during a store outage backs off with rate-limited logging. |
| litespec/ext/outbox#restrict-message-retry-to-claimed-records | guidance | Retry and poison handling touch claimed records only. |
| litespec/ext/outbox#gate-dispatch-on-readiness | guidance | Unready hosts stop dispatch and dead-store polling. |
| litespec/ext/outbox#version-message-types | guidance | Each message carries a stable type name with an explicit schema version. |
| litespec/ext/outbox#support-coexisting-message-producers | guidance | The dispatcher reads records from every coexisting application version. |
| litespec/ext/outbox#publish-backlog-indicators | guidance | The deployment publishes pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate. |
| litespec/ext/outbox#set-delivery-alerts | guidance | Alert thresholds sit in setting records derived from each use-case delivery target. |
| litespec/ext/outbox#model-outbox-lifecycle-states | guidance | Outbox lifecycle states form sealed records over an abstract base with documented transitions. |
| litespec/ext/outbox#preserve-message-identity-during-retry | guidance | Message ID stays identical across retry and replay. |
| litespec/ext/outbox#audit-outbox-replay | guidance | Each replay records actor, reason, time, and failure without editing the payload. |
| litespec/ext/outbox#protect-active-worker-compatibility | guidance | Every active Worker reads the type and schema version of new messages. |
| litespec/ext/outbox#deploy-readers-before-writers | guidance | Releases deploy compatible readers before additive writers. |
| litespec/ext/outbox#plan-undispatched-rollback-records | guidance | The rollback Runbook covers records the new writer staged but nobody dispatched. |
| litespec/ext/outbox#group-outbox-infrastructure | guidance | Outbox infrastructure sits under `Infrastructure/Messaging/Outbox/`, or the project names another home in its documentation. |
| litespec/ext/outbox#isolate-the-worker-host | guidance | The outbox Worker host lives in its own project, or the project hosts dispatch inside its request host. |
| litespec/ext/outbox#keep-provider-mapping-with-integration | guidance | Provider mapping sits in the owning integration, or the project keeps it in the shared dispatch path. |
| litespec/ext/outbox#dispatch-journey-step-commands-in-a-new-scope | guidance | Journey-step commands run through `ICommandMediator` in a fresh Worker scope, or the project runs them inline in the dispatcher scope. |
| litespec/ext/outbox#avoid-automatic-durable-bus-adoption | guidance | Dispatch runs on project-owned Marten records, or the project names a pinned durable bus package as its transport in its documentation. |
