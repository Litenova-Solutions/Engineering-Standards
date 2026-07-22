# Upgrade to Standards v1.7

Standards v1.7 tightens the API contract and Worker resilience. It adds no vocabulary rename, changes no Specification Metadata schema, and moves no documentation directories. It adds one API rule (`API.OPENAPI.003`), one outbox rule (`EXT.OUTBOX.READINESS.001`), and matching guidance for HTTP idempotency and scheduled jobs. Consumers pass v1.7 after tightening what their generated OpenAPI publishes and after making the Worker tolerate an unavailable store.

## Publish precise, complete OpenAPI schemas (`API.OPENAPI.003`)

The generated contract must express real shape and constraints, not only base types.

- Closed-set fields become enums. A response or request field whose values form a closed set declares those values as an OpenAPI `enum`. A field projected from a Domain state hierarchy or discriminated union publishes its allowed values so a consumer gets a typed union instead of `string`. Keep the Domain free of enums (`DOMAIN.CLOSEDSET.001`); introduce a boundary enum type or a schema transformer that sets the values only in the transport document.

```csharp
// Illustrative: a boundary enum drives the emitted schema, mapped from the Domain state.
public enum EventStateModel { Planned, Scheduled, Live, Closed, Completed, Cancelled }
```

- Parameters declare their constraints. Add `minimum`, `maximum`, length, `format`, and allowed values, and a description for a non-obvious business limit (for example a maximum date-range span). A caller should learn a limit from the contract, not from a 400.
- Required control headers are declared. An operation that requires `Idempotency-Key` or `If-Match` declares it as a required parameter, consistently across the operations that share it.

Regenerate the committed OpenAPI artifact and typed consumers in the same change, and confirm the new enums, constraints, and headers appear.

## Declare the idempotency header where required

If HTTP commands adopt client keys, declare the `Idempotency-Key` header as a required parameter on every operation that requires it, not just some. Consumers and generated clients then see the requirement in the contract.

## Separate Worker dependency outage from message failure (`EXT.OUTBOX.READINESS.001`)

If the outbox extension is active, make the dispatch loop distinguish an unavailable store from a failing record. On a cold start or before a migration, a store that cannot be reached or has no schema is a transient dependency outage: back off with the bounded policy and rate-limit the logged error rather than emitting a per-iteration exception storm. Gate the loop on readiness where the host exposes it. The same applies to a scheduled-jobs store (`EXT.JOBS.RETRY.001`).

```csharp
// Illustrative: treat connectivity or missing-schema as a backed-off transient.
catch (Exception ex) when (IsDependencyUnavailable(ex))
{
    _rateLimitedLog.Warn(ex, "Outbox store unavailable; backing off.");
    await _backoff.DelayAsync(cancellationToken);
}
```

Add a test that an unavailable or not-yet-migrated store produces backed-off, rate-limited logging instead of a storm.
