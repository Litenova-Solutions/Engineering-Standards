# Multitenancy

## Intent

Multitenancy lets independent customer organizations share one deployment while each keeps isolated data and policy. This page states how the product resolves tenant identity from trusted context, isolates each tenant's data and policy across authorization, storage, caches, jobs, exports, diagnostics, and recovery, and records the operations that cross tenant lines. A project selects it when separate customers require isolated data or policy in one deployment, because a tenant column without these obligations leaks one customer's data to another.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `tenancy` only when independent customer organizations share one deployment and need isolated data or policy. One organization with many users does not select it: tenants are separate customers, not separate logins.

## Baseline relationship

This extension replaces no baseline provision. It adds tenant obligations the baseline does not state: identity, isolation, scope, and operations across every boundary a tenant touches.

It switches on no record type: tenant scope applies to records every project requires, such as Decisions, audit records, and exports.

## Standards

### Record the tenant adoption decision

**Statement:** A consumer selecting `tenancy` MUST record a Decision naming tenant source, storage model, isolation guarantee, administrative access, evolution path, and enumeration bound.

**Rationale:** Tenant source, storage model, isolation guarantee, administrative access, and evolution path interact across every boundary, so one Decision records them together before code assumes any of them. Approval waits while that Decision stays a draft, and the enumeration bound caps how many tenant identifiers an all-tenant record lists.

### Define tenant isolation

**Statement:** A multi-tenant decision MUST define shared-table, schema, or database isolation and state its guarantee and operating trade-off.

**Rationale:** Shared tables, separate schemas, and separate databases isolate differently and operate differently: each choice moves work between queries, migrations, backups, and scaling. Naming the model with its guarantee and its operating trade-off tells every later choice which isolation it can rely on.

### Avoid unplanned isolation models

**Statement:** A multi-tenant system MUST NOT mix isolation models without a decision and data evolution plan.

**Rationale:** One part of the product on shared tables and another on separate databases answers which rows each tenant sees two ways. Each mixed model needs its own decision with a data evolution plan, or backup, restore, and incident response each guess which guarantee covers which data.

### Resolve tenant identity from trusted context

**Statement:** A trusted host boundary MUST resolve tenant identity from verified claims, host mapping, or another authenticated source.

**Rationale:** The tenant decides which data the request may touch, so only a trusted host boundary resolves it: verified claims, host mapping, or another authenticated source. An identity the caller supplies itself is a choice, not a fact.

### Reject unrestricted tenant input

**Statement:** A tenant resolver MUST NOT accept an unrestricted tenant ID from request data.

**Rationale:** A tenant ID taken straight from request data lets any caller name any tenant. Rejecting unrestricted input keeps the request from choosing a data boundary outside its authenticated context.

### Verify actor and target tenancy

**Statement:** A protected multi-tenant operation MUST confirm actor and target tenancy, with the needed Permission held at the resolved scope and the target belonging to it.

**Rationale:** Checking the caller alone leaves the target unchecked: an authorized caller can still name a resource from another tenant. The operation confirms both sides through one chain: the actor holds a role at the resolved scope, the role allows the permission, the use case needs that permission, and the target belongs to the same scope.

### Isolate administrative cross-tenant access

**Statement:** An administrative cross-tenant operation MUST require a Permission the actor holds through a Role at platform scope, writing an audit record.

**Rationale:** Support and operations sometimes reach across tenants, and that exceptional reach needs exceptional control: a permission held through a role at platform scope, with an audit record for every use. Without both, one support login becomes an unscoped key to every customer's data.

### Use selected tenant storage support

**Statement:** A multi-tenant persistence implementation MUST resolve its tenant at session creation through the selected provider's own tenancy support.

**Rationale:** Session creation is the point that matters: a session opened without a tenant serves an unscoped next query. Resolving the tenant then, through the selected provider's own tenancy support, scopes every query the session runs, so no query carries the concern alone. Adding the filter per query instead leaves every new query one omission away from reading across tenants. The baseline provider resolves the tenant from the registered tenancy at session creation; an Entity Framework Core implementation resolves it when the context is created and applies it through a query filter convention.

### Scope tenant-owned records

**Statement:** Every tenant-owned document, query, unique constraint, cache key, outbox record, job, export, and object-storage path MUST include tenant scope.

**Rationale:** Documents, queries, unique constraints, cache keys, outbox records, jobs, exports, and object-storage paths each form a boundary where tenants meet. Leaving tenant scope out of any one of them discloses or mixes customer data through exactly that gap.

### Apply cross-tenant disclosure policy

**Statement:** A cross-tenant resource response MUST use the documented not-found or forbidden policy.

**Rationale:** A caller that names another tenant's resource forces an answer: pretend it does not exist, or admit it exists and refuse. The product documents one policy and applies it to every cross-tenant response, so callers cannot probe for resources through inconsistent answers.

### Protect tenant diagnostics

**Statement:** Errors, logs, metrics, and traces MUST NOT reveal another tenant's business identifiers or data.

**Rationale:** Errors, logs, metrics, and traces travel to readers the API never authorized: support screens, dashboards, and log stores shared across tenants. Scrubbing other tenants' identifiers and data from diagnostics keeps the disclosure policy whole past the API boundary.

### Scope tenant operations

**Statement:** Backup, restore, replay, deletion, export, support access, and incident investigation MUST document one-tenant or all-tenant scope.

**Rationale:** Backup, restore, replay, deletion, export, support access, and incident investigation each touch more data than one normal request. Documenting each as one-tenant or all-tenant tells the operator how much data the run touches before it starts.

### Record an all-tenant operation

**Statement:** An all-tenant operation MUST record actor, operation, reason, tenant count, and reached tenant identifiers up to the adoption Decision bound.

**Rationale:** A documented scope states what an operation may touch, not what one run touched, and the run is what a tenant asks about after an incident. An all-tenant run is also the one case where no single tenant's audit trail holds the whole event. [The OWASP logging guidance](https://owasp.org/www-project-cheat-sheets/cheatsheets/Logging_Cheat_Sheet) treats an administrative action over many subjects as one event to record: actor, operation, reason, tenant count, and reached tenant identifiers up to the adoption Decision bound. When the audit extension is selected, the record is an audit record; otherwise it stays a standalone record.

**Example:** A support export covering every tenant records the operator, the export, the tenant count, and the incident it was run for.

## Conventions

### Use typed tenant identities

**Default:** Represent tenant identity with a strongly typed `TenantId`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A bare string tenant ID passes anywhere a string passes: into an actor field, a business record key, or a log line. A strongly typed `TenantId` fails compilation at each of those mistakes instead of failing in production.

### Use one tenant accessor

**Default:** Use one current-tenant accessor at the trusted host boundary.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Every boundary reads the current tenant, and two accessors can disagree about which tenant is current. One accessor at the trusted host boundary gives every reader the same answer from the same trusted source.

### Pass tenant scope explicitly

**Default:** Pass tenant scope through Application messages or trusted ports rather than ambient Domain request state.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Domain logic that reads the tenant from ambient request state depends on the host to run at all, which complicates tests and reuse. Passing the scope through Application messages or trusted ports keeps the tenant visible in the call and the Domain free of host state.

## Dependencies

Tenancy support for Marten ships in the baseline persistence package. A project that isolates tenants with another provider records a Decision and pins that provider in the manifest.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/tenancy#record-the-tenant-adoption-decision | guidance | Does an owned Decision record the tenant source, model, guarantee, access, path, and bound? |
| litespec/ext/tenancy#define-tenant-isolation | guidance | Does the decision define the isolation model, guarantee, and trade-off? |
| litespec/ext/tenancy#avoid-unplanned-isolation-models | guidance | Does each mixed model record its decision and evolution plan? |
| litespec/ext/tenancy#resolve-tenant-identity-from-trusted-context | guidance | Does each trusted source resolve the tenant? |
| litespec/ext/tenancy#reject-unrestricted-tenant-input | guidance | Can request tampering with a tenant ID select another boundary? |
| litespec/ext/tenancy#verify-actor-and-target-tenancy | guidance | Do mismatched actor and target tenants fail? |
| litespec/ext/tenancy#isolate-administrative-cross-tenant-access | guidance | Does administrative access need its platform-scope Permission and write its audit record? |
| litespec/ext/tenancy#use-selected-tenant-storage-support | guidance | Does each provider resolve the tenant at session creation? |
| litespec/ext/tenancy#scope-tenant-owned-records | guidance | Does every listed boundary include tenant scope? |
| litespec/ext/tenancy#apply-cross-tenant-disclosure-policy | guidance | Does each cross-tenant response use the documented policy? |
| litespec/ext/tenancy#protect-tenant-diagnostics | guidance | Do diagnostics exclude foreign tenant identifiers and data? |
| litespec/ext/tenancy#scope-tenant-operations | guidance | Does each procedure declare one-tenant or all-tenant scope? |
| litespec/ext/tenancy#record-an-all-tenant-operation | guidance | Does each all-tenant run write its record with count and bounded list? |
| litespec/ext/tenancy#use-typed-tenant-identities | guidance | Do tenant references use `TenantId` or a recorded Exception? |
| litespec/ext/tenancy#use-one-tenant-accessor | guidance | Does the host boundary hold one current-tenant accessor or a recorded Exception? |
| litespec/ext/tenancy#pass-tenant-scope-explicitly | guidance | Does domain code read no ambient tenant state, or does an Exception record it? |
