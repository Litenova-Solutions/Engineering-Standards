# Build an Audit Trail

## Purpose

Build the audit trail that the [audit extension](../ext/audit.md) requires, on the LiteBus command pipeline of the .NET profile.

This guide carries no provision. Each step cites the provisions it satisfies.

## Prerequisites

Start with:

- The `audit` extension selected in `standards.project.json`.
- The adoption decision required by `EXT.AUDIT.ADOPT.001`.
- A command pipeline that commits once for each Command.
- A database account that the application does not use for business writes.

Read the extension page before this guide. The extension states the obligations. This guide states one compliant way to meet them.

## Procedure

### Define the record shape

Model the record once, as the concrete form of `EXT.AUDIT.RECORD.001`.

| Field | Type | Holds | Provision |
|:---|:---|:---|:---|
| `auditId` | UUID v7 | Record identity, ordered by write time | `EXT.AUDIT.RECORD.001` |
| `occurredAt` | Timestamp with zone | Business time of the attempt | `EXT.AUDIT.RECORD.001` |
| `recordedAt` | Timestamp with zone | Time the evidence was written | `EXT.AUDIT.RECORD.001` |
| `action` | Use-case identity | The invoked use case | `EXT.AUDIT.RECORD.002` |
| `category` | Closed set | Retention and review classification | `EXT.AUDIT.CONVENTION.003` |
| `outcome` | Closed set | `succeeded`, `denied`, or `failed` | `EXT.AUDIT.STATUS.001` |
| `failureCode` | Stable code | The refusal or failure reason | `EXT.AUDIT.RECORD.003` |
| `actorKind` | Closed set | Person, device, or named process | `EXT.AUDIT.ACTOR.001` |
| `actorId` | Pseudonymous identifier | The acting account | `EXT.AUDIT.RECORD.001` |
| `actorDeviceId` | Pseudonymous identifier | The acting device | `EXT.AUDIT.ACTOR.001` |
| `actorProcess` | Name | The acting scheduled process | `EXT.AUDIT.ACTOR.001` |
| `underGrant` | Boolean | The actor used a support grant | `EXT.AUDIT.ACTOR.002` |
| `tenantId` | Identifier | The tenant that owns the data | `EXT.AUDIT.ISOLATION.001` |
| `targetKind` | Name | The kind of thing acted on | `EXT.AUDIT.RECORD.001` |
| `targetId` | Identifier | Its identity | `EXT.AUDIT.RECORD.001` |
| `reason` | Bounded text | Why, where the action requires one | `EXT.AUDIT.RECORD.001` |
| `sourceIp` | Address | Request origin | `EXT.AUDIT.CONTEXT.001` |
| `userAgent` | Bounded text | The calling client | `EXT.AUDIT.CONTEXT.001` |
| `requestId` | Identifier | The request that produced the attempt | `EXT.AUDIT.CONTEXT.001` |
| `traceId` | Identifier | Join key to the diagnostic log | `EXT.AUDIT.CONTEXT.002` |
| `schemaVersion` | Integer | The shape this record was written in | `EXT.AUDIT.SCHEMA.001` |
| `previousHash` | Hash | The preceding record hash | `EXT.AUDIT.PROTECTION.002` |
| `entryHash` | Hash | Hash over this canonical record | `EXT.AUDIT.PROTECTION.002` |

The shape holds no name, no address, no message body, and no state snapshot. That exclusion is what `EXT.AUDIT.CLASSIFICATION.002` and `EXT.AUDIT.PURGE.002` depend on.

### Declare the selection on each Command

Attach the constant half of the record to the Command type, following `EXT.AUDIT.CONVENTION.002`.

```csharp
[Audited("events.schedule-event", TargetKind = "event", Category = AuditCategory.Configuration)]
public sealed record ScheduleEventCommand(...) : ICommand<ScheduleEventCommandResult>;

[NotAudited("A public catalog read discloses no tenant-owned data.")]
public sealed record BrowseStorefrontQuery(...) : IQuery<BrowseStorefrontQueryResult>;
```

Write an architecture test over every `ICommand` implementation. Fail the build when a type carries neither attribute, which is `EXT.AUDIT.ENFORCEMENT.001`.

### Carry request context to the pipeline

Capture the origin at the HTTP boundary and place it where the pipeline reads it. The endpoint already resolves the actor from verified claims under `BACKEND.API.ACTOR.001`.

Register middleware that reads the connection address, the user agent, and the request identifier. Expose them through a scoped accessor that the audit producer resolves. This satisfies `EXT.AUDIT.CONTEXT.001` and `EXT.AUDIT.CONTEXT.002`.

### Open the audit scope in a pre-handler

Implement `ICommandPreHandler`, the global pre-handler that runs for every Command.

Read the declaration from the Command type. Resolve the actor, the tenant, the clock, and the request context. Put the assembled scope into `IExecutionContext.Items`, which flows through the whole pipeline on the ambient execution context.

```csharp
internal sealed class OpenAuditScopePreHandler(IAuditScopeFactory factory) : ICommandPreHandler
{
    public Task PreHandleAsync(ICommand message, CancellationToken cancellationToken = default)
    {
        var scope = factory.CreateFor(message);
        if (scope is not null)
        {
            AmbientExecutionContext.Current.Items[AuditScope.Key] = scope;
        }

        return Task.CompletedTask;
    }
}
```

### Enrich from the handler

Let the handler contribute the values it alone determines, which is `EXT.AUDIT.BOUNDARY.002`. A generated identity and a composed reason are the usual two.

```csharp
var occurrence = Event.Create(EventId.New(), ...);
events.Store(occurrence);
audit.Target(occurrence.Id);
```

The handler sets no actor, action, timestamp, or outcome. The pipeline owns those.

### Close the scope as succeeded

Implement `ICommandPostHandler`. LiteBus runs a post-handler only when the main handler returns, so reaching this stage is itself the success signal.

Stage the record in the same session as the business change, which is `EXT.AUDIT.ATOMIC.001`.

Order matters. The post-handler that commits the session runs in the same stage, so give the commit an explicit later priority. `HandlerPriorityAttribute` orders handlers by ascending value, and a handler with no attribute takes priority zero.

```csharp
[HandlerPriority(10)]
internal sealed class WriteAuditRecordPostHandler : ICommandPostHandler { }

[HandlerPriority(20)]
internal sealed class CommitChangesPostHandler : ICommandPostHandler { }
```

Leaving both at the default value makes the order depend on registration, which `EXT.AUDIT.ATOMIC.003` rejects.

### Close the scope as denied or failed

Implement `ICommandErrorHandler`, which runs when any stage throws. Map the authorization refusal to `denied` and every other failure to `failed`.

Write this record on a connection that the failing transaction does not roll back, following `EXT.AUDIT.ATOMIC.002`. Open a second session, write, and commit it there.

```csharp
internal sealed class WriteFailedAuditRecordErrorHandler(IAuditFailureWriter writer) : ICommandErrorHandler
{
    public async Task HandleErrorAsync(ICommand message, Exception exception, CancellationToken cancellationToken = default)
    {
        var scope = AmbientExecutionContext.Current.Items[AuditScope.Key] as AuditScope;
        if (scope is null)
        {
            return;
        }

        var outcome = exception is UseCaseForbiddenException ? AuditOutcome.Denied : AuditOutcome.Failed;
        await writer.WriteOutOfBandAsync(scope.Complete(outcome, exception), cancellationToken);
    }
}
```

Publish the write failure count of this path, which is `EXT.AUDIT.ATOMIC.004`. The separate connection accepts a rare loss at process death, and only the counter separates that from a defect.

### Protect the store

Create a role that holds `INSERT` and `SELECT` on the audit table and holds neither `UPDATE` nor `DELETE`. Write through that role, satisfying `EXT.AUDIT.PROTECTION.001`.

Compute `entryHash` over the canonical record content and the preceding `previousHash`. Run a recurring job that walks the chain and raises an alert on a break, satisfying `EXT.AUDIT.PROTECTION.002` and `EXT.AUDIT.PROTECTION.003`.

### Provide the read path

Add a query use case that filters by tenant, actor, action, target, and outcome. Gate it on a permission, satisfying `EXT.AUDIT.ACCESS.001`.

Declare that query audited. Reading the evidence is a sensitive action under `EXT.AUDIT.ACCESS.002`.

## Verification

Run the extension verification table in [the audit extension](../ext/audit.md#verification). The table names one evidence row for each provision this guide implements.

Confirm three behaviors by test before review:

- A refused authorization leaves one `denied` record after the transaction rolls back.
- A committed Command leaves exactly one `succeeded` record in the same transaction.
- An `UPDATE` against the audit table returns a privilege error.
