# Concurrency and Idempotency

## Intent

Concurrency and idempotency rules stop overlapping writes from silently overwriting each other and stop a retried request from executing twice. This page states how a project documents conflicting writes, coordinates them with versions, and makes retried operations return one result through client keys and fingerprints. A team applies it when overlap or retry can corrupt behavior, so its callers get one predictable outcome instead of a silent overwrite or a duplicated effect.

## Activation

Activation scope: `local`.

Applicable specification kinds: `module`, `aggregate`, `use-case`.

The consumer enables `concurrency` when accepted writes can conflict with each other, or when a retry can duplicate an irreversible or externally visible effect.

## Baseline Relationship

This extension replaces no baseline provision. `litespec/ext/concurrency#return-precondition-outcomes` adds the 428 outcome for a missing precondition to the outcome table that `litespec/backend/api#use-consistent-status-codes` owns.

This extension switches on `limit`: key retention is a limit record under `litespec/ext/concurrency#set-key-retention`.

## Standards

### Document Write Conflict Behavior

**Statement:** A conflicting-write use case MUST document conflicting operations, invalid combined result, expected winner behavior, and user-visible conflict response.

**Rationale:** Version coordination exists to protect one invariant. Naming the conflicting operations, the invalid combined result, the expected winner, and the caller-visible response states which invariant that is. An implementation without that document cannot tell a conflict it has to reject from contention it has to absorb.

### Limit Version Checks

**Statement:** An implementation MUST NOT add version checks without a documented conflicting-write case.

**Rationale:** Each version check adds a rejection path callers have to handle. A check without a documented conflicting-write case rejects callers to protect nothing. The document stays the gate: no case, no check.

### Compare Expected Aggregate Versions

**Statement:** A conflicting-write implementation MUST store and compare the aggregate version through its selected persistence model.

**Rationale:** The aggregate version stored with the state marks which write the caller saw. Comparing the expected version on write detects a competing accepted write against the same state. Storing and comparing it through the selected persistence model keeps the check inside the same transaction as the change.

### Map Failed Expected Versions

**Statement:** An HTTP API MUST map a failed expected version to status 409 Problem Details with a stable code.

**Rationale:** A caller that loses a version race retries: re-read, re-apply, re-send. Status 409 with a stable Problem Details code names the loss as a conflict, distinct from validation and authorization failures. Without the stable code, the caller guesses which failure it met.

### Reject Silent Overwrites

**Statement:** A conflicting-write implementation MUST NOT silently overwrite a conflicting accepted change.

**Rationale:** A conflicting write that silently replaces the accepted change destroys work another caller committed. The losing caller never learns its change is gone. Rejecting the conflict instead hands the caller the facts it needs to reconcile.

### Apply HTTP Version Preconditions

**Statement:** An HTTP operation requiring a caller version MUST return a strong persistence-derived `ETag` and require `If-Match` on writes.

**Rationale:** The caller reads the current state with its strong persistence-derived `ETag` and sends it back in `If-Match` on the write. The server compares what the caller saw with what is stored. The round trip carries the version through HTTP headers instead of a second contract field.

**Example:** A current `ETag` permits the write; a changed entity version rejects it.

### Return Precondition Outcomes

**Statement:** An HTTP API MUST return 428 `precondition_required` for missing `If-Match` and 409 `version_conflict` for stale versions.

**Rationale:** A missing `If-Match` and a stale version are different caller mistakes with different fixes: send the version, or re-read and retry. Status 428 `precondition_required` names the omission and 409 `version_conflict` names the stale version. One code for both would leave the caller guessing which fix applies.

### Hide Provider Version Values

**Statement:** An HTTP API MUST NOT expose a provider-specific version value in another contract field.

**Rationale:** The `ETag` is the one contract field that carries the persistence version. A provider-specific version leaked into another field gives callers a second version to depend on. Hiding it keeps the coordination behind one boundary the project can change.

### Scope Client Keys

**Statement:** An idempotent operation MUST scope its client key to the tenant, authenticated actor, and operation.

**Rationale:** A client key alone proves nothing about who sent it: two callers can pick the same key. Scoping the key to tenant, authenticated actor, and operation stops one caller's key from replaying another caller's operation. A project without the tenancy extension uses one fixed tenant value.

### Store Idempotency State Atomically

**Statement:** An idempotent operation MUST store its fingerprint, state, response status, response body, and expiry with its business change in one provider transaction.

**Rationale:** The fingerprint, state, response status, response body, and expiry describe the accepted change, so they commit with it in one provider transaction. One transaction leaves neither a completed record without its change nor a change without its replay record. A retry then replays exactly what the first attempt accepted.

### Reject Conflicting Key Reuse

**Statement:** An idempotent operation MUST reject reuse of one key with a different request fingerprint.

**Rationale:** A key reused with a different request fingerprint names two different intents under one key. Accepting both would replay the first intent's result for the second intent's request. Rejecting the reuse keeps one key bound to one intent.

### Enforce Key Uniqueness

**Statement:** An idempotency store MUST enforce a unique constraint on tenant, actor, operation, and client key.

**Rationale:** Two concurrent requests can arrive with the same key before either commits. The unique constraint on tenant, actor, operation, and client key admits one winner and rejects the other at the store. Application code alone cannot order two requests that arrive together. A project without the tenancy extension uses one fixed tenant value.

### Canonicalize Request Fingerprints

**Statement:** An idempotency implementation MUST derive its fingerprint from canonical mapped command input, route identity, and the authenticated actor identifier, excluding credentials and the client key.

**Rationale:** The fingerprint decides whether two requests under one key carry the same intent. Canonical mapped command input, route identity, and the authenticated actor identifier make equivalent requests produce one value. The actor identifier is in the fingerprint because two actors can present the same client key, and a fingerprint without it would replay one actor's stored response to another. The credential that proved the actor stays out: a cookie and a signature each change between two requests the rule treats as equal.

### Protect Fingerprint Source Data

**Statement:** An idempotency implementation MUST store a cryptographic hash when support does not require original sensitive request content.

**Rationale:** The fingerprint needs to compare requests, not to show what they contained. A cryptographic hash preserves the comparison while the original sensitive content stays out of the store. Support keeps original content only where it needs the original to help.

### Replay Completed Results

**Statement:** A completed idempotent retry MUST return the original response status and body.

**Rationale:** The first attempt performed the state change, and the retry performs it no second time. Returning the original response status and body gives the retry the accepted result. The caller sees one execution no matter how many times the network retried.

### Define Concurrent Retry Behavior

**Statement:** An idempotent use case MUST define whether a concurrent request waits, reports in-progress, or returns a stable conflict.

**Rationale:** An identical request can arrive while the first is still running. The use case states whether the concurrent request waits, learns the work is in progress, or receives a stable conflict. Without one documented result, each implementation invents its own and callers handle all of them.

### Reload Concurrent Winners

**Statement:** A losing concurrent idempotency request MUST reload and replay the winning record when its fingerprint matches.

**Rationale:** The unique constraint admits one winner among concurrent same-key requests. A losing request whose fingerprint matches reloads the winning record and replays its result. The loser then returns the accepted outcome instead of an error for work that succeeded.

### Discard Failed Replay State

**Statement:** A failed pre-commit idempotent request MUST leave neither the business change nor a completed replay record.

**Rationale:** A request that fails before commit changed nothing, so it leaves neither the business change nor a completed replay record. A leftover completed record would replay success for work that never happened. Clean state lets a later retry perform the operation for the first time.

### Delay Irreversible Provider Calls

**Statement:** An idempotent operation MUST NOT perform an irreversible provider call before its business transaction commits.

**Rationale:** A provider call that cannot be undone follows the commit. A call made before commit fires even when the transaction then rolls back. The business change would vanish while its external effect stands.

### Route Required External Effects Durably

**Statement:** An idempotent operation MUST use the outbox extension or a documented provider idempotency contract for required external effects.

**Rationale:** A required external effect has to survive retries without duplicating. The outbox extension delivers it durably after commit, or a documented provider idempotency contract lets the provider absorb the replay. An effect with neither path fires once per retry.

### Set Key Retention

**Statement:** An idempotency owner MUST record key retention as a limit record set from the caller retry window and business risk.

**Rationale:** A key that expires too early turns a legitimate retry into duplicate business work. Retention therefore spans the caller retry window plus the business risk of a late duplicate. The limit record states that span where reviewers and operators read it.

### Bound Expired-Record Cleanup

**Statement:** An idempotency owner MUST remove expired records through a bounded maintenance process.

**Rationale:** Expired keys accumulate without cleanup, and cleanup without bounds steals capacity from live work. A bounded maintenance process removes expired records within fixed limits on rate and batch. The store stays small without starving the application.

### Retain Safe Retry Keys

**Statement:** An idempotency owner MUST NOT expire a key before callers can safely retry.

**Rationale:** Callers retry inside a documented window after an uncertain response. A key expired inside that window is gone when the retry arrives, so the retry executes as new work. Retention covers the whole window the project promises.

### Declare Replayed Transport Outcomes

**Statement:** An idempotent use case MUST list the statuses and headers stored for replay.

**Rationale:** A completed retry reproduces the stored statuses and headers instead of the live ones. The declared list states which statuses and headers the store holds. A reviewer reads the list to learn exactly what a retry can return.

### Restrict Replay Data

**Statement:** An idempotent implementation MUST store only safe response fields required to reproduce an accepted result.

**Rationale:** The store holds what a retry needs to reproduce the accepted result and nothing more. Each extra field widens the sensitive data held under the key's retention. A field that serves no replay need stays out.

### Exclude Unsafe Replay Outcomes

**Statement:** An idempotent implementation MUST NOT replay authentication failures, transient server failures, `Set-Cookie`, `Cache-Control`, `Vary`, `Expires`, `Age`, hop-by-hop headers, tokens, or secrets.

**Rationale:** Authentication failures and transient server failures describe one exchange rather than the accepted result, so replaying them answers a new request with an old failure. Tokens, secrets, cookies, and hop-by-hop headers each belong to the exchange that produced them. The caching headers are computed for the response that produced them: replaying them hands a later caller freshness instructions from an earlier moment. [RFC 9111](https://datatracker.ietf.org/doc/html/rfc9111) makes each one a property of the exchange rather than of the result, so the replayed response computes its own.

## Conventions

### Use the Standard Idempotency Header

**Default:** Use `Idempotency-Key` for HTTP commands that accept client keys, bounded to 255 characters of visible ASCII.

**Replacement:** A consumer records a client-key convention naming the header and value bounds its commands accept.

**Rationale:** The `Idempotency-Key` header makes client-key behavior recognizable at the HTTP boundary. [The IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) leaves the value opaque, so a server stores whatever a client sends. The 255-character visible-ASCII bound stops an unbounded key from becoming an unbounded store entry and keeps control characters out of log lines.

### Keep Idempotency Persistence in Infrastructure

**Default:** Keep idempotency persistence and transaction handling in Infrastructure.

**Replacement:** A consumer records an idempotency-store convention naming where its idempotency state lives.

**Rationale:** Idempotency state lives in provider transactions guarded by store constraints. That machinery belongs in Infrastructure, where provider details live. Application and Domain stay free of the store mechanics behind their operations.

### Map Replay Responses at the API Boundary

**Default:** Keep replay response mapping at the API boundary.

**Replacement:** A consumer records a replay-mapping convention naming where its replay mapping lives.

**Rationale:** Replaying a stored result means rebuilding its statuses and headers. Those are transport concerns, so the mapping lives at the API boundary. Application code then deals in operation results, never in wire shapes.

### Declare Applicable Headers

**Default:** Declare the idempotency header as required on each applicable HTTP operation.

**Replacement:** A consumer records a header-declaration convention naming how its contracts expose the idempotency header.

**Rationale:** Each HTTP operation that accepts a client key declares the header as required. Generated API contracts then expose the requirement to every client author under `litespec/backend/api#publish-precise-complete-schemas`. An undeclared header reaches only the callers who read the implementation.

## Dependencies

Packages: None.

Related extensions: `outbox` for durable required external effects.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/concurrency#document-write-conflict-behavior | guidance | Which conflicting-write use cases lack conflicts, invalid state, winner behavior, or caller response? Look at the use case pages. |
| litespec/ext/concurrency#limit-version-checks | checkable | `ConcurrencyVersionTests` link every version check to a documented conflicting-write case. |
| litespec/ext/concurrency#compare-expected-aggregate-versions | checkable | `ConcurrencyVersionTests` race conflicting aggregate writes with expected versions. |
| litespec/ext/concurrency#map-failed-expected-versions | checkable | `ConcurrencyVersionTests` assert a failed expected version returns 409 Problem Details with its stable code. |
| litespec/ext/concurrency#reject-silent-overwrites | checkable | `ConcurrencyVersionTests` assert conflicting accepted writes preserve the winner without silent replacement. |
| litespec/ext/concurrency#apply-http-version-preconditions | checkable | `ConcurrencyVersionTests` require and validate a strong persistence-derived ETag. |
| litespec/ext/concurrency#return-precondition-outcomes | checkable | `ConcurrencyVersionTests` return 428 for a missing `If-Match` and 409 for a stale version. |
| litespec/ext/concurrency#hide-provider-version-values | checkable | `ConcurrencyVersionTests` assert public transport models expose no provider-specific version field. |
| litespec/ext/concurrency#scope-client-keys | checkable | `IdempotencyKeyTests` assert keys from different tenants, actors, or operations do not replay each other. |
| litespec/ext/concurrency#store-idempotency-state-atomically | checkable | `IdempotencyKeyTests` commit fingerprint, state, response, and expiry with the accepted business change. |
| litespec/ext/concurrency#reject-conflicting-key-reuse | checkable | `IdempotencyKeyTests` assert reused keys with changed input return the documented rejection. |
| litespec/ext/concurrency#enforce-key-uniqueness | checkable | `IdempotencyKeyTests` assert concurrent inserts prove the tenant-actor-operation-key uniqueness constraint. |
| litespec/ext/concurrency#canonicalize-request-fingerprints | checkable | `IdempotencyKeyTests` assert equivalent mapped requests produce one fingerprint without credentials or client key. |
| litespec/ext/concurrency#protect-fingerprint-source-data | guidance | Which idempotency stores keep original sensitive request content that support never needs? Look at the fingerprint store. |
| litespec/ext/concurrency#replay-completed-results | checkable | `IdempotencyReplayTests` return the original accepted status and body. |
| litespec/ext/concurrency#define-concurrent-retry-behavior | checkable | `IdempotencyReplayTests` prove the documented wait, in-progress, or conflict behavior. |
| litespec/ext/concurrency#reload-concurrent-winners | checkable | `IdempotencyReplayTests` reload and replay the matching winner record. |
| litespec/ext/concurrency#discard-failed-replay-state | checkable | `IdempotencyReplayTests` leave no business change or completed replay state. |
| litespec/ext/concurrency#delay-irreversible-provider-calls | guidance | Which irreversible provider calls run before their business transaction commits? Look at the idempotent operation paths. |
| litespec/ext/concurrency#route-required-external-effects-durably | guidance | Which required external effects use neither the outbox nor a documented provider idempotency contract? Look at the idempotent operation paths. |
| litespec/ext/concurrency#set-key-retention | guidance | Which key retentions miss the caller retry window or the business risk? Look at the limit record beside the idempotent use case. |
| litespec/ext/concurrency#bound-expired-record-cleanup | checkable | `IdempotencyRetentionTests` show bounded deletion of expired idempotency records. |
| litespec/ext/concurrency#retain-safe-retry-keys | checkable | `IdempotencyRetentionTests` reject expiration before the documented safe retry time. |
| litespec/ext/concurrency#declare-replayed-transport-outcomes | checkable | `IdempotencyOutcomeTests` match replayed statuses and headers against the declared list. |
| litespec/ext/concurrency#restrict-replay-data | guidance | Which stored replay fields serve no accepted result callers reproduce? Look at the replay store. |
| litespec/ext/concurrency#exclude-unsafe-replay-outcomes | checkable | `IdempotencyOutcomeTests` exclude authentication, transient failures, cookies, hop-by-hop headers, tokens, and secrets. |
| litespec/ext/concurrency#use-the-standard-idempotency-header | checkable | `ConcurrencyTests` assert applicable operations accept `Idempotency-Key` or follow the recorded local convention. |
| litespec/ext/concurrency#keep-idempotency-persistence-in-infrastructure | checkable | `ConcurrencyTests` assert idempotency persistence and transaction handling live in Infrastructure. |
| litespec/ext/concurrency#map-replay-responses-at-the-api-boundary | checkable | `ConcurrencyTests` assert replay response mapping lives at the API boundary. |
| litespec/ext/concurrency#declare-applicable-headers | checkable | `ConcurrencyTests` asserts generated OpenAPI declares the header for every applicable operation. |
