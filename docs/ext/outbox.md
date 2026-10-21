# Outbox Worker

## Intent

The outbox makes a business commit and its required outgoing message durable in one database transaction. A Worker dispatches pending records with retry, idempotency, visibility, and safe replay.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `outbox` when a committed change requires durable delivery after process failure. Delivery can carry an integration event, a journey-step command, or a provider side effect.

A use case that stages a durable message selects this extension. The extension activates `litespec/backend/architecture#declare-the-execution-host-for-work-that-outlives-a-request`. The project declares the execution host that runs the dispatcher.

## Baseline relationship

This extension replaces `litespec/backend/persistence#collect-events-without-a-public-unit-of-work`.

This extension switches on the Event, Limit, and Runbook record types.

## Standards

### Record durable delivery behavior

**Requirement:** A durable-delivery specification MUST document delivery guarantee, downstream boundary, duplicate behavior, retry horizon, recovery owner, record owner, and status.

**Rationale:** The specification defines the expected delivery behavior before a message record exists. A draft names its decider and decide-by date.

### Exclude manually repeatable reactions

**Requirement:** A project MUST NOT activate outbox for a reaction whose delivery guarantee is best-effort and which operators can repeat manually.

**Rationale:** Outbox storage and dispatcher operation are unnecessary when loss is an accepted recoverable outcome. The delivery guarantee comes from the reaction's own declaration. The module specification records it with the vocabulary its event table already uses.

### Publish best-effort reactions after commit

**Requirement:** A reaction the outbox excludes MUST publish after its commit succeeds without staging an outbox record.

**Rationale:** Best-effort delivery has no durable record. The commit success is its only guarantee.

### Stage messages with business work

**Requirement:** A command post-handler MUST stage pending durable messages in the same scoped business session as its aggregate changes.

**Rationale:** One session makes the business commit and outgoing message durable together.

### Serialize durable messages

**Requirement:** An outbox writer MUST serialize each pending durable message into an outbox record.

**Rationale:** A durable record holds the dispatch input after the command scope completes.

### Store required message fields

**Requirement:** An outbox record MUST contain message identity, kind, stable type, schema version, time, payload, tenant, state, attempt, and next-attempt data.

**Rationale:** Dispatch and recovery need one complete durable description of the message.

### Store failure and completion evidence

**Requirement:** An outbox record MUST retain its last error summary and completion time.

**Rationale:** Operators need failure and completion evidence for backlog review and replay.

### Classify message kinds

**Requirement:** An outbox record MUST name its message kind as integration event, journey-step command, or provider side effect, with an integration event citing its Event record.

**Rationale:** The kind decides dispatch ownership and transport. The Event record carries the raises and reacts-to links.

### Reject independent outbox commits

**Requirement:** An outbox writer MUST NOT use another connection or independent commit for required durable delivery.

**Rationale:** A shared PostgreSQL database does not make separate transactions atomic together.

### Dispatch claimed records in Worker

**Requirement:** A Worker MUST claim pending outbox records, dispatch a bounded batch, and record success or retry information.

**Rationale:** Worker ownership separates durable dispatch from the request transaction.

### Exclude request-transaction dispatch

**Requirement:** WebApi MUST NOT dispatch a durable message inside the request transaction.

**Rationale:** The request commit only makes the message eligible for later Worker dispatch.

### Define claim ownership

**Requirement:** An outbox claim MUST use a short transaction with the lease owner, lease expiry, and fencing value that `litespec/ext/jobs#store-execution-leases` defines.

**Rationale:** Claim fields establish which Worker owns one dispatch attempt.

### Release claim transactions before calls

**Requirement:** A Worker MUST NOT hold an outbox claim transaction open during a network call.

**Rationale:** Network delay does not retain database locks or transaction resources.

### Restrict completion to current lease owners

**Requirement:** A Worker MUST update an outbox record only while it owns the matching lease and fencing value.

**Rationale:** A stale Worker does not overwrite a newer owner's dispatch result.

### Requeue expired claims

**Requirement:** An outbox store MUST return expired claims to eligible work.

**Rationale:** A crashed Worker cannot permanently strand a pending message.

### Accept repeated delivery

**Requirement:** An outbox consumer MUST handle the same message more than once.

**Rationale:** A crash after external acceptance can cause one message to be delivered again.

### Identify repeated delivery

**Requirement:** An outbox consumer MUST use message ID or a business idempotency key at its Command or side-effect boundary.

**Rationale:** One stable identity lets the target suppress a repeated delivery.

### Await target acceptance

**Requirement:** A Worker MUST NOT mark an outbox record complete before the target boundary accepts it.

**Rationale:** Completed state claims delivery that has not yet reached the required target.

### Bound delivery retries

**Requirement:** An outbox dispatcher MUST use bounded exponential backoff with jitter.

**Rationale:** Bounded jitter reduces repeated load during a transient target failure.

### Classify permanent delivery failure

**Requirement:** An outbox dispatcher MUST classify permanent failures, stop automatic retry at its configured limit, and retain safe investigation and replay data.

**Rationale:** A dead-letter outcome preserves evidence after automatic recovery is no longer safe.

### Distinguish dependency outage

**Requirement:** A dispatcher MUST distinguish an unavailable outbox store from a failed claimed message.

**Rationale:** Store availability and a claimed record's target result require different recovery paths.

Each has its own signal. The store's availability is a gauge the readiness endpoint reads. A claimed message's outcome is a counter carrying the result, following [the OpenTelemetry metrics specification](https://opentelemetry.io/docs/specs/otel/metrics/). A single error counter cannot tell an operator whether to restore a database or investigate one destination.

### Back off unavailable-store polling

**Requirement:** A Worker MUST apply bounded backoff and rate-limited logging when its outbox store is unavailable.

**Rationale:** Cold start before schema application and store outage do not justify one exception per loop.

### Restrict message retry to claimed records

**Requirement:** A Worker MUST apply message retry and poison handling only to claimed outbox records.

**Rationale:** An unavailable store has no claimed message eligible for delivery retry.

### Gate dispatch on readiness

**Requirement:** A Worker host exposing readiness MUST gate dispatch and stop polling stores that cannot serve requests.

**Rationale:** Readiness prevents avoidable work against unavailable storage dependencies.

### Version message types

**Requirement:** An outbox message MUST use a stable type name and explicit schema version.

**Rationale:** The pair defines a durable contract for Worker deserialization and dispatch.

### Support coexisting message producers

**Requirement:** A deployed dispatcher MUST process records from every application version that can coexist during rollout or rollback.

**Rationale:** Active deployment versions can place different valid message shapes in one store.

A message record therefore carries its own shape version. The dispatcher selects a reader from that value. Adding an optional member with a defined absent-value behavior needs no new version. Removing a member, renaming one, narrowing a type, or changing a discriminator needs a new version. The older reader stays until no record carries the older version.

### Publish backlog indicators

**Requirement:** An outbox deployment MUST publish pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate.

**Rationale:** These indicators make backlog growth and dispatch quality observable.

### Set delivery alerts

**Requirement:** An outbox deployment MUST set alert thresholds as Limit records from its use-case delivery target.

**Rationale:** Alert urgency follows the business consequence of delayed delivery.

### Model outbox lifecycle states

**Requirement:** An outbox record MUST model its lifecycle as an abstract state base with one sealed record for each of pending, processing, dispatched, and dead-letter.

**Rationale:** `pending` becomes `processing`. `processing` becomes `dispatched`, `pending`, or `dead-letter`. Audited replay moves `dead-letter` to `pending`. Three of the four carry data the others do not. `processing` holds a lease expiry. `dispatched` holds a dispatch time. `dead-letter` holds a failure reason and an attempt count. A four-value label forces those onto nullable columns that are meaningful in one state each, which is the shape `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` removes everywhere else.

**Example:** `OutboxState.Processing` carries one unexpired lease before a dispatcher records `OutboxState.Dispatched` or a retry state.

### Preserve message identity during retry

**Requirement:** An outbox dispatcher MUST preserve message ID across retry and replay.

**Rationale:** Stable identity lets target idempotency suppress delivery after a crash before dispatch completion.

### Audit outbox replay

**Requirement:** An outbox replay MUST record actor, reason, time, and failure without editing the payload: an audit record when audit is selected, a standalone record otherwise.

**Rationale:** Replay history preserves message evidence and explains a renewed dispatch attempt.

### Protect active Worker compatibility

**Requirement:** New WebApi code MUST emit a message only after every active Worker can read its type and schema version.

**Rationale:** A writer does not create a message shape that a running dispatcher cannot understand.

### Deploy readers before writers

**Requirement:** A release MUST deploy compatible readers before writers for additive event versions.

**Rationale:** Reader-first deployment preserves dispatch during a mixed-version rollout.

### Plan undispatched rollback records

**Requirement:** A rollback Runbook MUST include records created by the new writer but not yet dispatched.

**Rationale:** These records can outlive the deployment that originally wrote them.

## Conventions

### Group outbox infrastructure

**Default:** Keep outbox record, storage, claim, and dispatch infrastructure under `Infrastructure/Messaging/Outbox/`.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** One Infrastructure location contains the persistent dispatch mechanism.

### Isolate the Worker host

**Default:** Keep the outbox Worker host in its own project.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The Worker has independent process lifetime and operating configuration.

### Keep provider mapping with integration

**Default:** Keep Integration Event-to-provider mapping in the integration that owns the side effect.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** A provider integration owns its transport mapping and external delivery behavior.

### Dispatch journey-step commands in a new scope

**Default:** Dispatch a journey-step command through `ICommandMediator` in a fresh Worker scope.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** The command enters its own application pipeline and transaction.

### Avoid automatic durable-bus adoption

**Default:** Use project-owned Marten records and Worker dispatch unless a manifest-pinned durable package passes a shared-transaction integration test.

**Replacement:** A consumer records a departure as an Exception record with reason and review date.

**Rationale:** Optional LiteBus durable packages remain unselected until their transaction behavior has evidence.

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
