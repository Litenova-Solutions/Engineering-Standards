# Outbox Worker

## Intent

The outbox makes a business or Workflow commit and its required outgoing message durable in one database transaction. A Worker dispatches pending records with retry, idempotency, visibility, and safe replay.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`, `end-to-end-flow`.

The consumer enables `outbox` when a committed change requires durable delivery after process failure. Delivery can carry an Integration Event, provider side effect, or Workflow Command.

The use case carries `durable-delivery` Risk, or the Workflow selects the extension for durable Commands. The extension activates `BACKEND.ARCHITECTURE.WORKER.001` and adds `apps/api/src/{ProjectName}.Worker/`.

## Baseline relationship

This extension replaces `BACKEND.PERSISTENCE.EVENT.001`.

## Agent Summary {#agent-summary}

- Record delivery guarantee, retry, and recovery ownership. (EXT.OUTBOX.ADOPT.001)
- Stage outbox messages with committed business work. (EXT.OUTBOX.ATOMIC.001, EXT.OUTBOX.ATOMIC.004)
- Claim and dispatch records only from Worker. (EXT.OUTBOX.WORKER.001, EXT.OUTBOX.WORKER.002)
- Treat delivery as at-least-once. (EXT.OUTBOX.IDEMPOTENCY.001, EXT.OUTBOX.IDEMPOTENCY.002)
- Bound retry and retain poison evidence. (EXT.OUTBOX.RETRY.001)
- Distinguish store outage from claimed-message failure. (EXT.OUTBOX.READINESS.001, EXT.OUTBOX.READINESS.002)
- Version message types for active Worker compatibility. (EXT.OUTBOX.SCHEMA.001, EXT.OUTBOX.SCHEMA.002)
- Publish backlog health and delivery targets. (EXT.OUTBOX.OBSERVABILITY.001, EXT.OUTBOX.OBSERVABILITY.002)
- Preserve state and message identity during replay. (EXT.OUTBOX.STATE.001, EXT.OUTBOX.STATE.002)
- Deploy readers before compatible writers. (EXT.OUTBOX.ROLLOUT.001, EXT.OUTBOX.ROLLOUT.002)

## Standards

### Record durable delivery behavior (EXT.OUTBOX.ADOPT.001)

**Requirement:** A durable-delivery specification MUST document delivery guarantee, downstream boundary, duplicate behavior, retry horizon, and recovery owner.

**Rationale:** The specification defines the expected delivery behavior before a message record exists.

### Exclude manually repeatable reactions (EXT.OUTBOX.ADOPT.002)

**Requirement:** A project MUST NOT activate outbox for a `best-effort-optional` reaction that operators can repeat manually.

**Rationale:** Outbox storage and Worker operation are unnecessary when loss is an accepted recoverable outcome.

### Stage messages with business work (EXT.OUTBOX.ATOMIC.001)

**Requirement:** A command post-handler MUST stage pending durable messages in the same Marten session as aggregate changes or Workflow progress.

**Rationale:** One session makes the business commit and outgoing message durable together.

### Serialize durable messages (EXT.OUTBOX.ATOMIC.002)

**Requirement:** An outbox writer MUST serialize each pending durable message into an outbox record.

**Rationale:** A durable record holds the dispatch input after the command scope completes.

### Commit staged work once (EXT.OUTBOX.ATOMIC.003)

**Requirement:** An outbox command pipeline MUST call `SaveChangesAsync` once after staging business and outbox work.

**Rationale:** One commit preserves atomic outcome between the accepted change and durable message.

### Store required message fields (EXT.OUTBOX.ATOMIC.004)

**Requirement:** An outbox record MUST contain message identity, kind, stable type, schema version, time, payload, tenant, state, attempt, and next-attempt data.

**Rationale:** The implementation dispatches and recovery need one complete durable description of the message.

### Store failure and completion evidence (EXT.OUTBOX.ATOMIC.005)

**Requirement:** An outbox record MUST retain its last error summary and completion time.

**Rationale:** Operators need failure and completion evidence for backlog review and replay.

### Classify message kinds (EXT.OUTBOX.ATOMIC.006)

**Requirement:** An outbox `messageKind` MUST distinguish integration event, workflow command, and provider-specific side effect.

**Rationale:** The implementation dispatches ownership and transport behavior can differ by logical message kind.

### Use the scoped business session (EXT.OUTBOX.ATOMIC.007)

**Requirement:** An outbox writer MUST use the same scoped `IDocumentSession` as its aggregate repository.

**Rationale:** A separate connection cannot provide the required atomic business and message commit.

### Reject independent outbox commits (EXT.OUTBOX.ATOMIC.008)

**Requirement:** An outbox writer MUST NOT use another connection or independent commit for required durable delivery.

**Rationale:** A shared PostgreSQL database does not make separate transactions atomic together.

### Dispatch claimed records in Worker (EXT.OUTBOX.WORKER.001)

**Requirement:** A Worker MUST claim pending outbox records, dispatch a bounded batch, and record success or retry information.

**Rationale:** Worker ownership separates durable dispatch from the request transaction.

### Exclude request-transaction dispatch (EXT.OUTBOX.WORKER.002)

**Requirement:** WebApi MUST NOT dispatch a durable message inside the request transaction.

**Rationale:** The request commit only makes the message eligible for later Worker dispatch.

### Define claim ownership (EXT.OUTBOX.WORKER.003)

**Requirement:** An outbox claim MUST use a short transaction with unique lease owner, lease expiry, and fencing value.

**Rationale:** Claim fields establish which Worker owns one dispatch attempt.

### Release claim transactions before calls (EXT.OUTBOX.WORKER.004)

**Requirement:** A Worker MUST NOT hold an outbox claim transaction open during a network call.

**Rationale:** Network delay does not retain database locks or transaction resources.

### Restrict completion to current lease owners (EXT.OUTBOX.WORKER.005)

**Requirement:** A Worker MUST update an outbox record only while it owns the matching lease and fencing value.

**Rationale:** A stale Worker does not overwrite a newer owner's dispatch result.

### Requeue expired claims (EXT.OUTBOX.WORKER.006)

**Requirement:** An outbox store MUST return expired claims to eligible work.

**Rationale:** A crashed Worker cannot permanently strand a pending message.

### Accept repeated delivery (EXT.OUTBOX.IDEMPOTENCY.001)

**Requirement:** An outbox consumer MUST handle the same message more than once.

**Rationale:** A crash after external acceptance can cause one message to be delivered again.

### Identify repeated delivery (EXT.OUTBOX.IDEMPOTENCY.002)

**Requirement:** An outbox consumer MUST use message ID or a business idempotency key at its Command or side-effect boundary.

**Rationale:** One stable identity lets the target suppress a repeated delivery.

### Await target acceptance (EXT.OUTBOX.IDEMPOTENCY.003)

**Requirement:** A Worker MUST NOT mark an outbox record complete before the target boundary accepts it.

**Rationale:** Completed state claims delivery that has not yet reached the required target.

### Bound delivery retries (EXT.OUTBOX.RETRY.001)

**Requirement:** An outbox dispatcher MUST use bounded exponential backoff with jitter.

**Rationale:** Bounded jitter reduces repeated load during a transient target failure.

### Classify permanent delivery failure (EXT.OUTBOX.RETRY.002)

**Requirement:** An outbox dispatcher MUST classify permanent failures, stop automatic retry at its configured limit, and retain safe investigation and replay data.

**Rationale:** A dead-letter outcome preserves evidence after automatic recovery is no longer safe.

### Distinguish dependency outage (EXT.OUTBOX.READINESS.001)

**Requirement:** A Worker MUST distinguish an unavailable outbox store from a failed claimed message.

**Rationale:** The implementation stores availability and a claimed record's target result require different recovery paths.

### Back off unavailable-store polling (EXT.OUTBOX.READINESS.002)

**Requirement:** A Worker MUST apply bounded backoff and rate-limited logging when its outbox store is unavailable.

**Rationale:** Cold start before schema application and store outage do not justify one exception per loop.

### Restrict message retry to claimed records (EXT.OUTBOX.READINESS.003)

**Requirement:** A Worker MUST apply message retry and poison handling only to claimed outbox records.

**Rationale:** An unavailable store has no claimed message eligible for delivery retry.

### Gate dispatch on readiness (EXT.OUTBOX.READINESS.004)

**Requirement:** A Worker host exposing readiness MUST gate dispatch and stop polling stores that cannot serve requests.

**Rationale:** Readiness prevents avoidable work against unavailable storage dependencies.

### Version message types (EXT.OUTBOX.SCHEMA.001)

**Requirement:** An outbox message MUST use a stable type name and explicit schema version.

**Rationale:** The pair defines a durable contract for Worker deserialization and dispatch.

### Support coexisting message producers (EXT.OUTBOX.SCHEMA.002)

**Requirement:** A deployed Worker MUST process records from every application version that can coexist during rollout or rollback.

**Rationale:** Active deployment versions can place different valid message shapes in one store.

### Publish backlog indicators (EXT.OUTBOX.OBSERVABILITY.001)

**Requirement:** An outbox deployment MUST publish pending count, failed count, oldest pending age, attempts, dispatch duration, and success rate.

**Rationale:** These indicators make backlog growth and dispatch quality observable.

### Set delivery alerts (EXT.OUTBOX.OBSERVABILITY.002)

**Requirement:** An outbox deployment MUST set alert thresholds from its use-case delivery target.

**Rationale:** Alert urgency follows the business consequence of delayed delivery.

### Model outbox lifecycle states (EXT.OUTBOX.STATE.001)

**Requirement:** An outbox record MUST use pending, processing, dispatched, and dead-letter states with the declared transition boundaries.

**Rationale:** `pending` becomes `processing`; processing becomes dispatched, pending, or dead-letter; audited replay moves dead-letter to pending.

**Example:** `processing` has one unexpired lease before a Worker records `dispatched` or retry state.

### Preserve message identity during retry (EXT.OUTBOX.STATE.002)

**Requirement:** An outbox dispatcher MUST preserve message ID across retry and replay.

**Rationale:** Stable identity lets target idempotency suppress delivery after a crash before dispatch completion.

### Audit outbox replay (EXT.OUTBOX.STATE.003)

**Requirement:** An outbox replay MUST record actor, reason, time, and previous failure without editing the original payload.

**Rationale:** Replay history preserves message evidence and explains a renewed dispatch attempt.

### Protect active Worker compatibility (EXT.OUTBOX.ROLLOUT.001)

**Requirement:** New WebApi code MUST emit a message only after every active Worker can read its type and schema version.

**Rationale:** A writer does not create a message shape that a running dispatcher cannot understand.

### Deploy readers before writers (EXT.OUTBOX.ROLLOUT.002)

**Requirement:** A release MUST deploy compatible readers before writers for additive event versions.

**Rationale:** Reader-first deployment preserves dispatch during a mixed-version rollout.

### Plan undispatched rollback records (EXT.OUTBOX.ROLLOUT.003)

**Requirement:** A rollback plan MUST include records created by the new writer but not yet dispatched.

**Rationale:** These records can outlive the deployment that originally wrote them.

## Conventions

### Group outbox infrastructure (EXT.OUTBOX.CONVENTION.001)

**Default:** Keep outbox record, storage, claim, and dispatch infrastructure under `Infrastructure/Messaging/Outbox/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One Infrastructure location contains the persistent dispatch mechanism.

### Isolate the Worker host (EXT.OUTBOX.CONVENTION.002)

**Default:** Keep the outbox Worker host in its own project.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The Worker has independent process lifetime and operating configuration.

### Keep provider mapping with integration (EXT.OUTBOX.CONVENTION.003)

**Default:** Keep Integration Event-to-provider mapping in the integration that owns the side effect.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A provider integration owns its transport mapping and external delivery behavior.

### Dispatch Workflow Commands in a new scope (EXT.OUTBOX.CONVENTION.004)

**Default:** Dispatch a Workflow Command through `ICommandMediator` in a fresh Worker scope.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The Command enters its own application pipeline and transaction.

### Avoid automatic durable-bus adoption (EXT.OUTBOX.CONVENTION.005)

**Default:** Use project-owned Marten records and Worker dispatch unless a manifest-pinned durable package passes a shared-transaction integration test.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Optional LiteBus durable packages remain unselected until their transaction behavior has evidence.

## Dependencies

No additional baseline package is required. Provider-specific dispatch dependencies follow the external integrations extension.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.OUTBOX.ADOPT.001 | inspection | Durable-delivery specification records all declared guarantee and recovery fields. |
| EXT.OUTBOX.ADOPT.002 | inspection | Selected outbox use cases exclude manually repeatable best-effort reactions. |
| EXT.OUTBOX.ATOMIC.001 | test | `OutboxAtomicTests` stage message and business work in one Marten session. |
| EXT.OUTBOX.ATOMIC.002 | test | `OutboxAtomicTests` produce durable outbox records. |
| EXT.OUTBOX.ATOMIC.003 | test | `OutboxAtomicTests` observe one post-handler commit. |
| EXT.OUTBOX.ATOMIC.004 | test | `OutboxAtomicTests` contain each required durable field. |
| EXT.OUTBOX.ATOMIC.005 | test | `OutboxAtomicTests` retain error summary and completion time. |
| EXT.OUTBOX.ATOMIC.006 | test | `OutboxAtomicTests` distinguish integration, workflow, and provider effects. |
| EXT.OUTBOX.ATOMIC.007 | test | Repository and writer resolve the same scoped `IDocumentSession`. |
| EXT.OUTBOX.ATOMIC.008 | static | `OutboxAtomicTests` asserts outbox writer source contains no independent connection or commit. |
| EXT.OUTBOX.WORKER.001 | test | `OutboxWorkerTests` claim bounded batches and record dispatch outcomes. |
| EXT.OUTBOX.WORKER.002 | static | `OutboxWorkerTests` asserts webApi request paths contain no durable outbox dispatch. |
| EXT.OUTBOX.WORKER.003 | test | `OutboxWorkerTests` store unique owner, expiry, and fencing value. |
| EXT.OUTBOX.WORKER.004 | test | `OutboxWorkerTests` release claim transactions before provider calls. |
| EXT.OUTBOX.WORKER.005 | test | `OutboxWorkerTests` cannot overwrite current Worker outcome. |
| EXT.OUTBOX.WORKER.006 | test | `OutboxWorkerTests` become eligible for new claim. |
| EXT.OUTBOX.IDEMPOTENCY.001 | test | `OutboxIdempotencyTests` leave one accepted target outcome. |
| EXT.OUTBOX.IDEMPOTENCY.002 | test | `OutboxIdempotencyTests` use message ID or business idempotency key. |
| EXT.OUTBOX.IDEMPOTENCY.003 | test | `OutboxIdempotencyTests` keep records uncompleted. |
| EXT.OUTBOX.RETRY.001 | test | `OutboxRetryTests` use bounded exponential backoff with jitter. |
| EXT.OUTBOX.RETRY.002 | test | `OutboxRetryTests` asserts permanent failures dead-letter after limit with safe replay evidence. |
| EXT.OUTBOX.READINESS.001 | test | `OutboxReadinessTests` remain distinct from failed claimed-message fixtures. |
| EXT.OUTBOX.READINESS.002 | test | `OutboxReadinessTests` use bounded backoff and rate-limited logging. |
| EXT.OUTBOX.READINESS.003 | test | `OutboxReadinessTests` run only after successful record claim. |
| EXT.OUTBOX.READINESS.004 | test | `OutboxReadinessTests` gates dispatch and stops polling. |
| EXT.OUTBOX.SCHEMA.001 | static | `OutboxSchemaTests` asserts message definitions provide stable type names and explicit schema versions. |
| EXT.OUTBOX.SCHEMA.002 | test | `OutboxSchemaTests` dispatch every active producer message shape. |
| EXT.OUTBOX.OBSERVABILITY.001 | operation | Metrics backend receives each declared backlog indicator. |
| EXT.OUTBOX.OBSERVABILITY.002 | operation | Alert configuration derives thresholds from the delivery target. |
| EXT.OUTBOX.STATE.001 | test | `OutboxStateTests` permit only documented state transitions. |
| EXT.OUTBOX.STATE.002 | test | `OutboxStateTests` retain one message ID. |
| EXT.OUTBOX.STATE.003 | operation | Replay audit record captures actor, reason, time, and previous failure. |
| EXT.OUTBOX.ROLLOUT.001 | test | `OutboxRolloutTests` reject unsupported writer message shapes. |
| EXT.OUTBOX.ROLLOUT.002 | operation | Release record deploys compatible readers before additive writers. |
| EXT.OUTBOX.ROLLOUT.003 | inspection | Rollback plan identifies undispatched records from the new writer. |
| EXT.OUTBOX.CONVENTION.001 | inspection | Outbox Infrastructure files use documented path or a local replacement. |
| EXT.OUTBOX.CONVENTION.002 | inspection | Worker host remains a separate project or a local replacement. |
| EXT.OUTBOX.CONVENTION.003 | inspection | Provider mapping remains with the owning external integration. |
| EXT.OUTBOX.CONVENTION.004 | test | `OutboxTests` asserts workflow Command dispatch occurs through a fresh Worker scope. |
| EXT.OUTBOX.CONVENTION.005 | test | `OutboxTests` asserts any durable package has a manifest pin and shared-transaction integration evidence. |
