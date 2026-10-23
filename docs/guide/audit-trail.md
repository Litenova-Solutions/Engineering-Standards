# Build an Audit Trail

## Purpose

An audit trail proves who attempted what against which data and what each attempt produced, so a product can answer for every sensitive action. This guide builds that proof on the LiteBus pipeline that runs each state change in the .NET backend: the entry shape, the pipeline handlers, the protected store, and the read path. Each step names the audit rule it satisfies, and the guide adds no rule of its own.

## Prerequisites

Start with:

- The `audit` extension selected in the consumer's `litespec.project.json`.
- The audit adoption decision that `litespec/ext/audit#record-the-audit-adoption-decision` requires.
- The `audit` field on each command record, set to its reason and target or left at its default of audited with reason `none`.
- A LiteBus command pipeline that commits once for each command.
- A database account reserved for audit writes, separate from the account that writes business data.
- The LiteBus release pinned for the `LiteBus.*` packages in `litespec.manifest.json`.
- The pipeline reference in the `docs/` folder of the [LiteBus v7 branch](https://github.com/litenova/LiteBus/tree/v7/docs), which defines the handler interfaces this guide implements.

Read the [audit extension](../ext/audit.md) before this guide: it states the obligations, and this guide shows one compliant way to meet them.

## Procedure

### Define the Record Shape

Model the audit record once, using the fields the extension requires in `litespec/ext/audit#record-the-required-audit-fields`. Each row below names the provision that requires it.

| Field | Type | Holds | Provision |
|:---|:---|:---|:---|
| `auditId` | UUID v7 | Record identity, ordered by write time | `litespec/ext/audit#record-the-required-audit-fields` |
| `occurredAt` | Timestamp with zone | Business time of the attempt | `litespec/ext/audit#record-the-required-audit-fields` |
| `recordedAt` | Timestamp with zone | Time the evidence was written | `litespec/ext/audit#record-the-required-audit-fields` |
| `action` | Use case identity | The invoked use case | `litespec/ext/audit#state-the-action-as-use-case-identity` |
| `category` | Closed set | Retention and review classification | `litespec/ext/audit#use-a-fixed-category-vocabulary` |
| `outcome` | Closed set | `succeeded`, `denied`, or `failed` | `litespec/ext/audit#record-every-attempt-outcome` |
| `failureCode` | Stable code | The refusal or failure reason | `litespec/ext/audit#record-the-refusal-code-on-an-unsuccessful-attempt` |
| `actorKind` | Closed set | Person, device, or named process | `litespec/ext/audit#use-a-closed-actor-set` |
| `actorId` | Pseudonymous identifier | The acting account | `litespec/ext/audit#record-the-required-audit-fields` |
| `actorDeviceId` | Pseudonymous identifier | The acting device | `litespec/ext/audit#use-a-closed-actor-set` |
| `actorProcess` | Name | The acting scheduled process | `litespec/ext/audit#use-a-closed-actor-set` |
| `underGrant` | Boolean | The actor used a support grant | `litespec/ext/audit#record-delegated-administrative-access` |
| `tenantId` | Identifier | The tenant that owns the data | `litespec/ext/audit#scope-every-record-to-its-tenant` |
| `targetKind` | Name | The kind of thing acted on | `litespec/ext/audit#record-the-required-audit-fields` |
| `targetId` | Identifier | Its identity | `litespec/ext/audit#record-the-required-audit-fields` |
| `reason` | Bounded text | Why, where the action requires one | `litespec/ext/audit#record-the-required-audit-fields` |
| `sourceIp` | Address | Request origin | `litespec/ext/audit#record-the-request-origin` |
| `userAgent` | Bounded text | The calling client | `litespec/ext/audit#record-the-request-origin` |
| `requestId` | Identifier | The request that produced the attempt | `litespec/ext/audit#record-the-request-origin` |
| `traceId` | Identifier | Join key to the diagnostic log | `litespec/ext/audit#record-the-operation-trace-identity` |
| `schemaVersion` | Integer | The shape this record was written in | `litespec/ext/audit#version-the-audit-record-shape` |
| `previousHash` | Hash | The preceding record hash | `litespec/ext/audit#provide-tamper-evidence` |
| `entryHash` | Hash | Hash over this canonical record | `litespec/ext/audit#provide-tamper-evidence` |

The shape carries no person name, no address, no message body, and no state snapshot. That exclusion lets the product meet `litespec/ext/audit#exclude-personal-data-beyond-actor-identity` and `litespec/ext/audit#remove-the-identity-mapping-on-erasure`.

### Declare the Selection on Each Command

Attach the values fixed per use case (action identity, target kind, category) to the command type with an attribute, as `litespec/ext/audit#declare-audit-selection-beside-the-command` requires. The command record's `audit` field selects which use cases are audited and why; async work audits at request time.

```csharp
[Audited("catalog.add-product", TargetKind = "product", Category = AuditCategory.Configuration)]
public sealed record AddProductCommand(...) : ICommand<AddProductCommandResult>;

[NotAudited("A public catalog read discloses no tenant-owned data.")]
public sealed record BrowseStorefrontQuery(...) : IQuery<BrowseStorefrontQueryResult>;
```

Write an architecture test that scans every `ICommand` implementation and fails the build when a type carries neither attribute. That test implements `litespec/ext/audit#reject-an-undeclared-command`.

### Carry Request Context to the Pipeline

Capture the request origin at the HTTP boundary and place it where the pipeline reads it. The endpoint already resolves the actor from verified claims under `litespec/quality/security#derive-the-actor-from-claims`.

Register middleware that reads the connection address, the user agent, and the request identifier, and expose the three through a scoped accessor that the audit producer resolves. This satisfies `litespec/ext/audit#record-the-request-origin` and `litespec/ext/audit#record-the-operation-trace-identity`.

### Open the Audit Scope in a Pre-Handler

Implement `ICommandPreHandler`, the handler interface that LiteBus runs before every command.

Read the declaration from the command type. Resolve the actor, the tenant, the clock, and the request context, and put the assembled scope into `IExecutionContext.Items`. The ambient execution context carries those items through every later pipeline stage.

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

### Enrich from the Handler

Let the command handler contribute only the values it alone determines, as `litespec/ext/audit#restrict-handler-contribution-to-determined-values` requires. A generated identity and a composed reason are the usual two.

```csharp
var product = Product.Create(ProductId.New(), ...);
products.Store(product);
audit.Target(product.Id);
```

The handler sets no actor, action, timestamp, or outcome. The pipeline owns those.

### Close the Scope as Succeeded

Implement `ICommandPostHandler`. LiteBus runs a post-handler only when the main handler returns, so reaching this stage is itself the success signal.

Stage the audit record in the same session as the business change, as `litespec/ext/audit#commit-a-success-record-with-its-business-change` requires.

Order matters. The post-handler that commits the session runs in the same stage, so give the commit an explicit later priority. `HandlerPriorityAttribute` orders handlers by ascending value, and a handler with no attribute takes priority `0`.

```csharp
[HandlerPriority(10)]
internal sealed class WriteAuditRecordPostHandler : ICommandPostHandler { }

[HandlerPriority(20)]
internal sealed class CommitChangesPostHandler : ICommandPostHandler { }
```

When both handlers keep the default priority, the order depends on registration order, which `litespec/ext/audit#stage-the-audit-write-before-the-business-commit` rejects.

### Close the Scope as Denied or Failed

Implement `ICommandErrorHandler`, which runs when any stage throws. Map the authorization refusal to `denied` and every other failure to `failed`.

Write this record on a connection outside the failing transaction, so the rollback does not remove it, as `litespec/ext/audit#write-an-unsuccessful-record-outside-the-failed-transaction` requires. Open a second session, write, and commit it there.

```csharp
internal sealed class WriteFailedAuditRecordErrorHandler(IAuditFailureWriter writer) : ICommandErrorHandler
{
    public async Task HandleErrorAsync(ICommand message, Exception exception, CancellationToken cancellationToken = default)
    {
        var scope = AmbientExecutionContext.Current.Items[AuditScope.Key] as AuditScope;
        if (scope is null)
        {
            writer.CountMissingScope();
            return;
        }

        var outcome = exception is UseCaseForbiddenException ? AuditOutcome.Denied : AuditOutcome.Failed;
        await writer.WriteOutOfBandAsync(scope.Complete(outcome, exception), cancellationToken);
    }
}
```

Publish the write failure count of this path, as `litespec/ext/audit#publish-unsuccessful-write-failures` requires. Count a missing scope on the same counter before returning. The separate connection can lose a record when the process dies mid-write; the counter is what distinguishes that rare loss from a defect.

### Protect the Store

Create a database role that holds `INSERT` and `SELECT` on the audit table and holds neither `UPDATE` nor `DELETE`, and write through that role. This satisfies `litespec/ext/audit#enforce-append-only-through-storage-privilege`.

Compute `entryHash` over the canonical record content and the preceding `previousHash`. Run a recurring job that walks the chain and raises an alert on a break. The pair satisfies `litespec/ext/audit#provide-tamper-evidence` and `litespec/ext/audit#verify-the-integrity-chain-on-a-schedule`.

### Provide the Read Path

Add a query use case that filters by tenant, actor, action, target, and outcome, and gate it on a permission. This satisfies `litespec/ext/audit#give-the-trail-a-read-path`.

Declare that query audited: reading the evidence is itself a sensitive action under `litespec/ext/audit#audit-reads-of-the-trail`.

## Check

Work through the verification table in [the audit extension](../ext/audit.md#verification); it names one evidence row for each provision this guide implements.

Confirm four behaviors by test before review:

- A refused authorization leaves one `denied` record after the transaction rolls back.
- A committed command leaves exactly one `succeeded` record in the same transaction.
- An `UPDATE` against the audit table returns a privilege error.
- Each behavior above is a scenario on its own use case page, proved by the test that asserts it.
