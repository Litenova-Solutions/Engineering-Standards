# Outbox Worker

## Intent

The outbox pattern makes a business change and the message it owes the outside world durable together, so a crash between the two cannot lose the message. This page states how the product stages that message in the same database transaction as the business commit and how a background Worker delivers it later with retry, idempotency, visibility, and safe replay. A team selects it for each use case (one operation the product offers) or journey (steps toward one goal) whose committed change needs delivery that survives process failure, so no accepted change silently drops its consequence.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

A use case or journey selects this extension when a committed change needs delivery that survives a process failure. That delivery can carry an integration event to another system, a command that advances a journey step, or a side effect on an outside provider. Selecting it also activates `litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request`: the project declares the execution host that runs the dispatcher.

## Baseline relationship

This extension replaces `litespec/backend/persistence#collect-events-without-a-public-unit-of-work`.

Selecting it switches on the Event, Limit, and Runbook record types. The project writes an Event record for each integration event it delivers, Limit records for the delivery bounds, and Runbook records for recovery and rollback.

## Standards

### Record durable delivery behavior

**Statement:** A durable-delivery specification MUST document delivery guarantee, downstream boundary, duplicate behavior, retry horizon, recovery owner, record owner, and status.

**Rationale:** Delivery crosses a system boundary, so the team agrees up front on the guarantee, the boundary, the duplicate behavior, the retry horizon, and who recovers when delivery fails. Without that agreement, the writer assumes once-only delivery while the target assumes retries, and both discover the mismatch in production. A draft names its decider and decide-by date so the agreement lands before the first message does.

### Exclude manually repeatable reactions

**Statement:** A project MUST NOT activate outbox for a reaction whose delivery guarantee is best-effort and which operators can repeat manually.

**Rationale:** Outbox storage, dispatch, retries, and replay exist to prevent loss; a reaction whose loss the operators accept and can repeat by hand needs none of that machinery. The reaction's own declaration states its best-effort guarantee, and the module specification records it with the vocabulary its event table uses.

### Publish best-effort reactions after commit

**Statement:** A reaction the outbox excludes MUST publish after its commit succeeds without staging an outbox record.

**Rationale:** Without an outbox record, nothing survives a crash between the commit and the publish, so the reaction publishes immediately after its commit succeeds and accepts the gap. Publishing before the commit risks worse: the reaction fires for a change the database then rolls back.

### Stage messages with business work

**Statement:** A command post-handler MUST stage pending durable messages in the same scoped business session as its aggregate changes.

**Rationale:** The business change and its message share one fate: both persist or neither does. Staging the message in the same scoped business session as the aggregate changes puts both under one commit, so a crash can never leave an accepted change without its message or a message without its change.

### Serialize durable messages

**Statement:** An outbox writer MUST serialize each pending durable message into an outbox record.

**Rationale:** The command scope ends when the request ends, while dispatch happens later in a Worker that never saw the request. Serializing the message into an outbox record gives that Worker everything it needs after the scope is gone.

### Store required message fields

**Statement:** An outbox record MUST contain message identity, kind, stable type, schema version, time, payload, tenant, state, attempt, and next-attempt data.

**Rationale:** The dispatcher, the retry logic, and the operator each read the record: identity and type route it, the schema version selects its reader, time and tenant scope it, and state, attempt, and next-attempt data drive the retry. A field stored nowhere forces one of those readers to guess.

### Store failure and completion evidence

**Statement:** An outbox record MUST retain its last error summary and completion time.

**Rationale:** When delivery stalls, the operator opens the record first: the last error summary says why the previous attempt failed, and the completion time says which records finished. Without that evidence on the record, each investigation starts from scattered logs instead.

### Classify message kinds

**Statement:** An outbox record MUST name its message kind as integration event, journey-step command, or provider side effect, with an integration event citing its Event record.

**Rationale:** An integration event, a journey-step command, and a provider side effect dispatch through different owners and transports, so the record names which one it holds. The integration event cites its Event record, which carries the raises and reacts-to links the model uses to trace the flow.

### Reject independent outbox commits

**Statement:** An outbox writer MUST NOT use another connection or independent commit for required durable delivery.

**Rationale:** Two commits on two connections can split around a crash: the business change persists while the message rolls back, or the message persists for a change that never happened. Sharing one PostgreSQL database does not make separate transactions atomic, so the message joins the business transaction instead.

### Dispatch claimed records in Worker

**Statement:** A Worker MUST claim pending outbox records, dispatch a bounded batch, and record success or retry information.

**Rationale:** Dispatch needs time, retries, and network calls that no request transaction can hold. The Worker claims pending records, dispatches a bounded batch, and records each outcome, so the request commits fast while delivery proceeds on its own schedule.

### Exclude request-transaction dispatch

**Statement:** WebApi MUST NOT dispatch a durable message inside the request transaction.

**Rationale:** A network call inside the request transaction holds database locks while the outside world answers, and a slow target slows every request behind it. The request commits only to make the message eligible; the Worker performs the delivery later.

### Define claim ownership

**Statement:** An outbox claim MUST use a short transaction with the lease owner, lease expiry, and fencing value that `litespec/ext/jobs#store-execution-leases` defines.

**Rationale:** Several Workers poll the same store, so each dispatch attempt needs one owner: the lease owner, the lease expiry, and the fencing value name it. The short transaction takes the claim without holding locks into the delivery itself.

### Release claim transactions before calls

**Statement:** A Worker MUST NOT hold an outbox claim transaction open during a network call.

**Rationale:** A network call to a slow target can last seconds or minutes. Holding the claim transaction open across that call pins database locks and connection slots, starving the Workers behind it; releasing the claim first lets the database serve other work while the call runs.

### Restrict completion to current lease owners

**Statement:** A Worker MUST update an outbox record only while it owns the matching lease and fencing value.

**Rationale:** A Worker that lost its lease, through a crash, a pause, or an expiry, can wake up after another Worker claimed the same record. Checking the lease and fencing value before each update stops the stale Worker from overwriting the current owner's result.

### Requeue expired claims

**Statement:** An outbox store MUST return expired claims to eligible work.

**Rationale:** A Worker can die between claiming a record and dispatching it. Returning expired claims to eligible work lets a live Worker pick them up, so one crash delays a message instead of losing it.

### Accept repeated delivery

**Statement:** An outbox consumer MUST handle the same message more than once.

**Rationale:** The target can accept a message while the Worker crashes before recording completion, and the requeued claim then dispatches it again. Delivery promises at-least-once, so every consumer handles the same message more than once without corrupting its state.

### Identify repeated delivery

**Statement:** An outbox consumer MUST use message ID or a business idempotency key at its Command or side-effect boundary.

**Rationale:** Handling a repeat means recognizing it: the message ID or a business idempotency key gives the target a stable identity to check at its command or side-effect boundary. Without that key, the target processes the repeat as new work and charges, notifies, or ships twice.

### Await target acceptance

**Statement:** A Worker MUST NOT mark an outbox record complete before the target boundary accepts it.

**Rationale:** Marking a record complete before the target accepts it declares a delivery that never happened, and no retry follows because the record looks done. The Worker waits for the target boundary's acceptance before recording completion.

### Bound delivery retries

**Statement:** An outbox dispatcher MUST use bounded exponential backoff with jitter.

**Rationale:** A failing target with ten thousand pending messages meets a retry storm when every message retries at once on a fixed interval. Bounded exponential backoff with jitter spreads the retries over time and caps the total, so the target recovers instead of drowning.

### Classify permanent delivery failure

**Statement:** An outbox dispatcher MUST classify permanent failures, stop automatic retry at its configured limit, and retain safe investigation and replay data.

**Rationale:** Some failures never clear on retry: a deleted destination, a rejected payload, a revoked credential. Retrying those forever burns resources and buries the real backlog, so the dispatcher classifies them, stops at its configured limit, and keeps the evidence an operator needs to investigate and replay safely.

### Distinguish dependency outage

**Statement:** A dispatcher MUST distinguish an unavailable outbox store from a failed claimed message.

**Rationale:** A dead outbox store and a failed delivery ask for different recoveries: the first needs a database restored, the second needs one destination investigated. Each carries its own signal. The store's availability is a gauge the readiness endpoint reads, while a claimed message's outcome is a counter carrying the result, following [the OpenTelemetry metrics specification](https://opentelemetry.io/docs/specs/otel/metrics/). A single error counter cannot tell an operator whether to restore a database or investigate one destination.

### Back off unavailable-store polling

**Statement:** A Worker MUST apply bounded backoff and rate-limited logging when its outbox store is unavailable.

**Rationale:** A Worker that polls a dead store on a tight loop writes an exception per iteration and fills disks and log quotas before anyone reads the first one. Bounded backoff with rate-limited logging keeps the Worker alive and quiet until the store returns.

### Restrict message retry to claimed records

**Statement:** A Worker MUST apply message retry and poison handling only to claimed outbox records.

**Rationale:** Retry and poison handling act on a claimed message; when the store itself is down, no claim exists and no message waits for delivery. Running retry logic against the outage double-counts attempts and can dead-letter messages whose only fault was an unreachable store.

### Gate dispatch on readiness

**Statement:** A Worker host exposing readiness MUST gate dispatch and stop polling stores that cannot serve requests.

**Rationale:** A host that reports unready still serves traffic it cannot finish when its Workers keep polling dead stores. Gating dispatch on readiness stops the polling, so the host fails fast and recovers instead of churning against storage that cannot answer.

### Version message types

**Statement:** An outbox message MUST use a stable type name and explicit schema version.

**Rationale:** An outbox record outlives the deployment that wrote it, so the dispatcher meets records written by several versions at once. A stable type name with an explicit schema version tells the dispatcher which reader parses each record; without the pair, one shape change breaks every record written before it.

### Support coexisting message producers

**Statement:** A deployed dispatcher MUST process records from every application version that can coexist during rollout or rollback.

**Rationale:** During rollout and rollback, several application versions share one store and write different valid shapes into it. The dispatcher reads from every version that can coexist, or the deployment itself causes delivery failures.

Each message record therefore carries its own shape version, and the dispatcher selects a reader from that value. Adding an optional member with a defined absent-value behavior needs no new version. Removing a member, renaming one, narrowing a type, or changing a discriminator needs a new version, and the reader for each version stays until no record carries that version.

### Publish backlog indicators

**Statement:** An outbox deployment MUST publish pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate.

**Rationale:** Pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate together show whether delivery keeps up: growth in the backlog or age reveals a stall, while duration and success rate reveal a struggling target. Without these indicators, the first sign of failure is a customer asking where their message went.

### Set delivery alerts

**Statement:** An outbox deployment MUST set alert thresholds as Limit records from its use-case delivery target.

**Rationale:** A shipment notice delayed an hour and a receipt delayed a week carry different business consequences, so each use case sets alert thresholds from its own delivery target. Limit records hold those thresholds, so the alert fires when delay passes what the business accepted.

### Model outbox lifecycle states

**Statement:** An outbox record MUST model its lifecycle as an abstract state base with one sealed record for each of pending, processing, dispatched, and dead-letter.

**Rationale:** `pending` becomes `processing`, and `processing` becomes `dispatched`, `pending`, or `dead-letter`, while audited replay moves `dead-letter` back to `pending`. Three of the four states carry data the others do not: `processing` holds a lease expiry, `dispatched` holds a dispatch time, and `dead-letter` holds a failure reason and an attempt count. A four-value label forces those onto nullable columns that mean something in one state each, which is the shape `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` removes everywhere else.

**Example:** `OutboxState.Processing` carries one unexpired lease before a dispatcher records `OutboxState.Dispatched` or a retry state.

### Preserve message identity during retry

**Statement:** An outbox dispatcher MUST preserve message ID across retry and replay.

**Rationale:** The target suppresses a repeat by recognizing its identity, which works only when every retry and replay carries the same message ID. A dispatcher that mints a new ID per attempt turns each retry into a new message the target processes again.

### Audit outbox replay

**Statement:** An outbox replay MUST record actor, reason, time, and failure without editing the payload: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** A replay dispatches a message the system already handled or dead-lettered, so the team records who replayed it, why, when, and which failure it answers. Without that record, a duplicate delivery looks like a dispatcher bug instead of an operator's decision, and nobody can reconstruct the choice.

### Protect active Worker compatibility

**Statement:** New WebApi code MUST emit a message only after every active Worker can read its type and schema version.

**Rationale:** WebApi writers and Worker dispatchers deploy independently, so a writer can run ahead of the oldest active Worker. When the writer emits a shape that Worker cannot read, those messages dead-letter on arrival through no fault of their own.

### Deploy readers before writers

**Statement:** A release MUST deploy compatible readers before writers for additive event versions.

**Rationale:** In a mixed-version rollout, old and new records sit in one store. Deploying compatible readers before the writers that emit new shapes keeps every record dispatchable at every step; the reverse order strands new records until the readers catch up.

### Plan undispatched rollback records

**Statement:** A rollback Runbook MUST include records created by the new writer but not yet dispatched.

**Rationale:** Rolling back the deployment does not roll back the store: records the new writer staged but nobody dispatched stay behind. The rollback Runbook names how the previous version handles them, or they sit undispatched with no owner and no reader.

## Conventions

### Group outbox infrastructure

**Default:** Keep outbox record, storage, claim, and dispatch infrastructure under `Infrastructure/Messaging/Outbox/`.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The outbox record, storage, claim, and dispatch code form one mechanism with one owner. Keeping it under `Infrastructure/Messaging/Outbox/` puts every persistent dispatch question in one folder instead of scattered across the project.

### Isolate the Worker host

**Default:** Keep the outbox Worker host in its own project.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The Worker runs as its own process with its own lifetime, scaling, and configuration, apart from the request host. Its own project keeps that independence visible and stops request concerns leaking into dispatch configuration.

### Keep provider mapping with integration

**Default:** Keep Integration Event-to-provider mapping in the integration that owns the side effect.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Each provider speaks its own transport with its own mapping, retries, and quirks. The integration that owns the side effect owns that mapping, so a provider change touches one integration instead of the shared dispatch path.

### Dispatch journey-step commands in a new scope

**Default:** Dispatch a journey-step command through `ICommandMediator` in a fresh Worker scope.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** A journey-step command is a full command with validation, authorization, and its own transaction, not a subroutine of the dispatcher. Sending it through `ICommandMediator` in a fresh Worker scope runs the whole application pipeline for it.

### Avoid automatic durable-bus adoption

**Default:** Use project-owned Marten records and Worker dispatch unless a manifest-pinned durable package passes a shared-transaction integration test.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** A durable bus package earns its place only when an integration test proves it commits the message in the same transaction as the business work. Until that evidence exists, project-owned Marten records with Worker dispatch carry delivery without depending on behavior nobody verified.

## Dependencies

This extension requires no additional baseline package. Provider-specific dispatch dependencies follow the external integrations extension.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/outbox#record-durable-delivery-behavior | guidance | Does each delivery specification record guarantee, boundary, retry, owner, and status? |
| litespec/ext/outbox#exclude-manually-repeatable-reactions | guidance | Is the outbox free of manually repeatable best-effort reactions? |
| litespec/ext/outbox#publish-best-effort-reactions-after-commit | guidance | Do excluded reactions publish after commit without staging records? |
| litespec/ext/outbox#stage-messages-with-business-work | guidance | Are messages staged in the same session as business changes? |
| litespec/ext/outbox#serialize-durable-messages | guidance | Is each pending message serialized into an outbox record? |
| litespec/ext/outbox#store-required-message-fields | guidance | Does each record hold identity, kind, type, version, time, payload, and state? |
| litespec/ext/outbox#store-failure-and-completion-evidence | guidance | Does each record retain its error summary and completion time? |
| litespec/ext/outbox#classify-message-kinds | guidance | Does each record name its kind and cite its Event record? |
| litespec/ext/outbox#reject-independent-outbox-commits | guidance | Is writer source free of independent connections and commits? |
| litespec/ext/outbox#dispatch-claimed-records-in-worker | guidance | Does the Worker claim bounded batches and record outcomes? |
| litespec/ext/outbox#exclude-request-transaction-dispatch | guidance | Are request paths free of durable message dispatch? |
| litespec/ext/outbox#define-claim-ownership | guidance | Does each claim use the jobs lease definition in a short transaction? |
| litespec/ext/outbox#release-claim-transactions-before-calls | guidance | Are claim transactions released before network calls? |
| litespec/ext/outbox#restrict-completion-to-current-lease-owners | guidance | Does only the current lease owner update records? |
| litespec/ext/outbox#requeue-expired-claims | guidance | Do expired claims return to eligible work? |
| litespec/ext/outbox#accept-repeated-delivery | guidance | Does each consumer handle the same message twice? |
| litespec/ext/outbox#identify-repeated-delivery | guidance | Does each consumer suppress repeats by message ID or business key? |
| litespec/ext/outbox#await-target-acceptance | guidance | Does the Worker withhold completion until the target accepts? |
| litespec/ext/outbox#bound-delivery-retries | guidance | Are retries bounded with exponential backoff and jitter? |
| litespec/ext/outbox#classify-permanent-delivery-failure | guidance | Do permanent failures dead-letter with safe replay evidence? |
| litespec/ext/outbox#distinguish-dependency-outage | guidance | Is store outage distinct from claimed-message failure? |
| litespec/ext/outbox#back-off-unavailable-store-polling | guidance | Does polling back off with rate-limited logging during outages? |
| litespec/ext/outbox#restrict-message-retry-to-claimed-records | guidance | Does the Worker limit retries to claimed records? |
| litespec/ext/outbox#gate-dispatch-on-readiness | guidance | Does readiness gate dispatch and stop dead-store polling? |
| litespec/ext/outbox#version-message-types | guidance | Does each message carry a stable type name and schema version? |
| litespec/ext/outbox#support-coexisting-message-producers | guidance | Does the dispatcher read every coexisting producer shape? |
| litespec/ext/outbox#publish-backlog-indicators | guidance | Does the deployment publish pending, failed, age, attempts, duration, and rate? |
| litespec/ext/outbox#set-delivery-alerts | guidance | Are alert thresholds Limit records derived from the delivery target? |
| litespec/ext/outbox#model-outbox-lifecycle-states | guidance | Are lifecycle states sealed records with documented transitions? |
| litespec/ext/outbox#preserve-message-identity-during-retry | guidance | Is message ID stable across retry and replay? |
| litespec/ext/outbox#audit-outbox-replay | guidance | Does each replay record actor, reason, time, and prior failure? |
| litespec/ext/outbox#protect-active-worker-compatibility | guidance | Can every active Worker read new message shapes? |
| litespec/ext/outbox#deploy-readers-before-writers | guidance | Do releases deploy compatible readers before additive writers? |
| litespec/ext/outbox#plan-undispatched-rollback-records | guidance | Does the rollback Runbook cover undispatched new-writer records? |
| litespec/ext/outbox#group-outbox-infrastructure | guidance | Is outbox infrastructure grouped or is an Exception recorded? |
| litespec/ext/outbox#isolate-the-worker-host | guidance | Is the Worker host separate or is an Exception recorded? |
| litespec/ext/outbox#keep-provider-mapping-with-integration | guidance | Does provider mapping stay with its integration or record an Exception? |
| litespec/ext/outbox#dispatch-journey-step-commands-in-a-new-scope | guidance | Are journey-step commands dispatched in a fresh Worker scope? |
| litespec/ext/outbox#avoid-automatic-durable-bus-adoption | guidance | Is any durable package pinned with transaction evidence or avoided? |
