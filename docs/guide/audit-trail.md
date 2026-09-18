# Build an Audit Trail

## Purpose

Build the audit trail that the [audit extension](../ext/audit.md) requires, on the LiteBus command pipeline of the .NET profile.

This guide carries no provision. Each step cites the provisions it satisfies.

## Prerequisites

Start with:

- The `audit` extension selected in `standards.project.json`.
- The adoption decision required by `standards/rule/ext-audit.record-the-audit-adoption-decision`.
- A command pipeline that commits once for each Command.
- A database account that the application does not use for business writes.

Read the extension page before this guide. The extension states the obligations. This guide states one compliant way to meet them.

## Procedure

### Define the record shape

Model the record once, as the concrete form of `standards/rule/ext-audit.record-the-required-audit-fields`.

| Field | Type | Holds | Provision |
|:---|:---|:---|:---|
| `auditId` | UUID v7 | Record identity, ordered by write time | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `occurredAt` | Timestamp with zone | Business time of the attempt | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `recordedAt` | Timestamp with zone | Time the evidence was written | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `action` | Use-case identity | The invoked use case | `standards/rule/ext-audit.state-the-action-as-use-case-identity` |
| `category` | Closed set | Retention and review classification | `standards/rule/ext-audit.use-a-fixed-category-vocabulary` |
| `outcome` | Closed set | `succeeded`, `denied`, or `failed` | `standards/rule/ext-audit.record-every-attempt-outcome` |
| `failureCode` | Stable code | The refusal or failure reason | `standards/rule/ext-audit.record-the-failure-code-on-an-unsuccessful-attempt` |
| `actorKind` | Closed set | Person, device, or named process | `standards/rule/ext-audit.use-a-closed-actor-set` |
| `actorId` | Pseudonymous identifier | The acting account | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `actorDeviceId` | Pseudonymous identifier | The acting device | `standards/rule/ext-audit.use-a-closed-actor-set` |
| `actorProcess` | Name | The acting scheduled process | `standards/rule/ext-audit.use-a-closed-actor-set` |
| `underGrant` | Boolean | The actor used a support grant | `standards/rule/ext-audit.record-delegated-administrative-access` |
| `tenantId` | Identifier | The tenant that owns the data | `standards/rule/ext-audit.scope-every-record-to-its-tenant` |
| `targetKind` | Name | The kind of thing acted on | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `targetId` | Identifier | Its identity | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `reason` | Bounded text | Why, where the action requires one | `standards/rule/ext-audit.record-the-required-audit-fields` |
| `sourceIp` | Address | Request origin | `standards/rule/ext-audit.record-the-request-origin` |
| `userAgent` | Bounded text | The calling client | `standards/rule/ext-audit.record-the-request-origin` |
| `requestId` | Identifier | The request that produced the attempt | `standards/rule/ext-audit.record-the-request-origin` |
| `traceId` | Identifier | Join key to the diagnostic log | `standards/rule/ext-audit.record-the-operation-trace-identity` |
| `schemaVersion` | Integer | The shape this record was written in | `standards/rule/ext-audit.version-the-audit-record-shape` |
| `previousHash` | Hash | The preceding record hash | `standards/rule/ext-audit.provide-tamper-evidence` |
| `entryHash` | Hash | Hash over this canonical record | `standards/rule/ext-audit.provide-tamper-evidence` |

The shape holds no name, no address, no message body, and no state snapshot. That exclusion is what `standards/rule/ext-audit.exclude-personal-data-beyond-actor-identity` and `standards/rule/ext-audit.remove-the-identity-mapping-on-erasure` depend on.

### Declare the selection on each Command

Attach the constant half of the record to the Command type, following `standards/rule/ext-audit.declare-audit-selection-beside-the-command`.

```csharp
[Audited("events.schedule-event", TargetKind = "event", Category = AuditCategory.Configuration)]
public sealed record ScheduleEventCommand(...) : ICommand<ScheduleEventCommandResult>;

[NotAudited("A public catalog read discloses no tenant-owned data.")]
public sealed record BrowseStorefrontQuery(...) : IQuery<BrowseStorefrontQueryResult>;
```

Write an architecture test over every `ICommand` implementation. Fail the build when a type carries neither attribute, which is `standards/rule/ext-audit.reject-an-undeclared-command`.

### Carry request context to the pipeline

Capture the origin at the HTTP boundary and place it where the pipeline reads it. The endpoint already resolves the actor from verified claims under `standards/rule/backend-api.derive-authenticated-identity-from-claims`.

Register middleware that reads the connection address, the user agent, and the request identifier. Expose them through a scoped accessor that the audit producer resolves. This satisfies `standards/rule/ext-audit.record-the-request-origin` and `standards/rule/ext-audit.record-the-operation-trace-identity`.

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

Let the handler contribute the values it alone determines, which is `standards/rule/ext-audit.restrict-handler-contribution-to-determined-values`. A generated identity and a composed reason are the usual two.

```csharp
var occurrence = Event.Create(EventId.New(), ...);
events.Store(occurrence);
audit.Target(occurrence.Id);
```

The handler sets no actor, action, timestamp, or outcome. The pipeline owns those.

### Close the scope as succeeded

Implement `ICommandPostHandler`. LiteBus runs a post-handler only when the main handler returns, so reaching this stage is itself the success signal.

Stage the record in the same session as the business change, which is `standards/rule/ext-audit.commit-a-success-record-with-its-business-change`.

Order matters. The post-handler that commits the session runs in the same stage, so give the commit an explicit later priority. `HandlerPriorityAttribute` orders handlers by ascending value, and a handler with no attribute takes priority zero.

```csharp
[HandlerPriority(10)]
internal sealed class WriteAuditRecordPostHandler : ICommandPostHandler { }

[HandlerPriority(20)]
internal sealed class CommitChangesPostHandler : ICommandPostHandler { }
```

Leaving both at the default value makes the order depend on registration, which `standards/rule/ext-audit.stage-the-audit-write-before-the-business-commit` rejects.

### Close the scope as denied or failed

Implement `ICommandErrorHandler`, which runs when any stage throws. Map the authorization refusal to `denied` and every other failure to `failed`.

Write this record on a connection that the failing transaction does not roll back, following `standards/rule/ext-audit.write-an-unsuccessful-record-outside-the-failed-transaction`. Open a second session, write, and commit it there.

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

Publish the write failure count of this path, which is `standards/rule/ext-audit.publish-unsuccessful-write-failures`. The separate connection accepts a rare loss at process death, and only the counter separates that from a defect.

### Protect the store

Create a role that holds `INSERT` and `SELECT` on the audit table and holds neither `UPDATE` nor `DELETE`. Write through that role, satisfying `standards/rule/ext-audit.enforce-append-only-through-storage-privilege`.

Compute `entryHash` over the canonical record content and the preceding `previousHash`. Run a recurring job that walks the chain and raises an alert on a break, satisfying `standards/rule/ext-audit.provide-tamper-evidence` and `standards/rule/ext-audit.verify-the-integrity-chain-on-a-schedule`.

### Provide the read path

Add a query use case that filters by tenant, actor, action, target, and outcome. Gate it on a permission, satisfying `standards/rule/ext-audit.give-the-trail-a-read-path`.

Declare that query audited. Reading the evidence is a sensitive action under `standards/rule/ext-audit.audit-reads-of-the-trail`.

## Verification

Run the extension verification table in [the audit extension](../ext/audit.md#verification). The table names one evidence row for each provision this guide implements.

Confirm three behaviors by test before review:

- A refused authorization leaves one `denied` record after the transaction rolls back.
- A committed Command leaves exactly one `succeeded` record in the same transaction.
- An `UPDATE` against the audit table returns a privilege error.
