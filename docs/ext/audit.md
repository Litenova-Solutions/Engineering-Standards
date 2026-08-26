# Audit Trail

## Intent

An audit trail is evidence that one actor attempted one action against one target, and what the attempt produced. It answers who is accountable.

An audited system keeps three records with different producers, readers, and retention. Conflating them removes evidence.

| Record | Holds | Read by |
|:---|:---|:---|
| Diagnostic log | What the software did | Engineers during an incident |
| Domain event stream | What became true | The system itself |
| Audit trail | Who is accountable for an attempt | Reviewers, customers, regulators |

A domain event cannot substitute for an audit record. A domain event carries domain identity rather than use-case identity, and one event type can come from more than one use case. A domain event carries only the fields the domain needs, so an actor the domain ignores is absent. A refused attempt changes no state and raises no event, and refusal is the case a reviewer asks about.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `audit` when a person or a machine acts inside data that another party owns, and a later reviewer must establish accountability. Regulatory obligation, customer contract, payment scope, and platform-side support access each meet this condition.

[Audit obligations](../reference/audit-obligations.md) maps each provision on this page to the external obligation it satisfies.

## Baseline relationship

This extension replaces `QUALITY.SECURITY.AUDIT.001`. The baseline states the required record fields for one security audit event. This extension owns the producer, the transaction boundary, the selection policy, the store, and the read path.

## Agent Summary {#agent-summary}

- Record the audited categories, retention, access, and integrity method before writing code. (EXT.AUDIT.ADOPT.001)
- Declare every Command as audited or excluded with a reason. (EXT.AUDIT.ADOPT.002, EXT.AUDIT.ENFORCEMENT.001)
- Produce records at the mediation boundary, not inside a handler. (EXT.AUDIT.BOUNDARY.001, EXT.AUDIT.BOUNDARY.002)
- Record refused and failed attempts, not successes alone. (EXT.AUDIT.STATUS.001, EXT.AUDIT.STATUS.002)
- Carry actor, target, outcome, time, origin, and trace identity. (EXT.AUDIT.RECORD.001, EXT.AUDIT.CONTEXT.001)
- Exclude secrets, personal data, and state snapshots from the record. (EXT.AUDIT.CLASSIFICATION.001, EXT.AUDIT.CLASSIFICATION.002)
- Commit a success record with its business change. (EXT.AUDIT.ATOMIC.001, EXT.AUDIT.ATOMIC.003)
- Enforce append-only through storage privilege and chained integrity evidence. (EXT.AUDIT.PROTECTION.001, EXT.AUDIT.PROTECTION.002)
- Scope every record to its owning tenant. (EXT.AUDIT.ISOLATION.001)
- Give the trail a permission-gated read path. (EXT.AUDIT.ACCESS.001)

## Standards

### Record the audit adoption decision (EXT.AUDIT.ADOPT.001)

**Requirement:** An audit adoption decision MUST record the audited categories, the retention period of each category, the read access model, and the integrity method.

**Rationale:** The selection, its retention, and its protection are policy choices. A reviewer evaluates the declared policy before evaluating the implementation.

### Declare audit selection on every Command (EXT.AUDIT.ADOPT.002)

**Requirement:** Every Command MUST declare that it is audited, or declare that it is excluded together with the reason for exclusion.

**Rationale:** An implicit selection cannot be reviewed. A total declaration makes an omission a visible statement rather than an absent call.

**Example:** A storefront browse Command declares exclusion because a public catalog read is not a sensitive action.

### Cover the required audit categories (EXT.AUDIT.COVERAGE.001)

**Requirement:** An audit selection MUST include authentication, authorization denial, grant change, monetary action, tenant configuration, personal-data read, bulk export, and background-process change.

**Rationale:** These categories carry the questions a security review, a customer, and a supervisory authority ask. A trail that omits one of them cannot answer its own purpose.

### Exclude indiscriminate auditing (EXT.AUDIT.COVERAGE.002)

**Requirement:** A project MUST NOT audit every Command without a recorded selection.

**Rationale:** An undifferentiated trail buries the sensitive action inside routine traffic. Volume then defeats the review the trail exists to support.

### Emit audit records at the mediation boundary (EXT.AUDIT.BOUNDARY.001)

**Requirement:** An audit producer MUST run in the mediation pipeline stages that dispatch the Command.

**Rationale:** Only the pipeline observes the whole attempt, including its outcome. A handler that throws never reaches an audit call placed inside it.

**Example:** A pre-handler opens the audit scope, a post-handler closes it as `succeeded`, and an error handler closes it as `denied` or `failed`.

### Restrict handler contribution to determined values (EXT.AUDIT.BOUNDARY.002)

**Requirement:** A handler MUST contribute only the audit values that the handler alone determines.

**Rationale:** A generated target identity and a composed reason are unavailable before the handler runs. Every other field comes from the declaration, the actor, and the request context.

**Example:** A create handler contributes the identity it generated. It contributes no actor, action code, or timestamp.

### Exclude derived audit trails (EXT.AUDIT.BOUNDARY.003)

**Requirement:** An audit trail MUST NOT be derived from domain events, database triggers, or change data capture.

**Rationale:** These sources describe committed state change. They carry no refused attempt, no use-case identity, and no request origin.

### Record the required audit fields (EXT.AUDIT.RECORD.001)

**Requirement:** An audit record MUST contain actor kind, actor identity, action, target kind, target identity, outcome, business time, record time, and tenant.

**Rationale:** These fields carry the accountability question. Business time states when the action happened, and record time states when the evidence was written.

### State the action as use-case identity (EXT.AUDIT.RECORD.002)

**Requirement:** An audit `action` MUST use the identity of the use case that the actor invoked.

**Rationale:** A reviewer resolves the record to the specification that defines the intended behavior. A separate vocabulary requires a mapping that drifts.

**Example:** `events.schedule-event` names both the use case and the audited action.

### Record the failure code on an unsuccessful attempt (EXT.AUDIT.RECORD.003)

**Requirement:** An audit record with a `denied` or `failed` outcome MUST carry the stable failure code that the attempt produced.

**Rationale:** The code distinguishes a refused permission from an exhausted precondition, which are different review findings.

### Version the audit record shape (EXT.AUDIT.SCHEMA.001)

**Requirement:** An audit record MUST carry an explicit schema version.

**Rationale:** A retained record outlives several shapes of the application that wrote it. The version keeps an old record readable without rewriting it.

### Use a closed actor set (EXT.AUDIT.ACTOR.001)

**Requirement:** An audit actor MUST be one member of a closed set that distinguishes a person, a device, and a named process.

**Rationale:** An absent actor collapses three answers into one. A scheduled process acted, a device acted, or nobody recorded the actor, and only the third is a defect.

**Example:** A door scanner records a device actor with the account that authorized the device.

### Record delegated administrative access (EXT.AUDIT.ACTOR.002)

**Requirement:** An action that an actor takes under an administrative or support grant MUST record that the grant was used.

**Rationale:** A supplier-side action and a customer-side action are indistinguishable without this field. The distinction is what makes a no-silent-access commitment demonstrable.

### Record every attempt outcome (EXT.AUDIT.STATUS.001)

**Requirement:** An audit record MUST carry an outcome of `succeeded`, `denied`, or `failed`.

**Rationale:** A trail of successes is a change history. The refused attempt carries the security signal.

**Example:** `succeeded` names a committed change, `denied` names a refused authorization, and `failed` names a permitted attempt that did not complete.

### Record refused authorization (EXT.AUDIT.STATUS.002)

**Requirement:** An authorization decision that refuses an audited action MUST produce an audit record.

**Rationale:** Repeated refusal is the primary indicator of a compromised or probing account. No other record holds it.

### Record failed audited attempts (EXT.AUDIT.STATUS.003)

**Requirement:** An audited action that the actor was permitted to take and that did not complete MUST produce an audit record.

**Rationale:** A permitted attempt that fails repeatedly separates an operating defect from an access problem.

### Record the request origin (EXT.AUDIT.CONTEXT.001)

**Requirement:** An audit record produced from an inbound request MUST carry the request origin address, the client description, and the request identifier.

**Rationale:** Two records naming one account state nothing about location. The same records from two countries within one minute state that the account is compromised.

### Record the operation trace identity (EXT.AUDIT.CONTEXT.002)

**Requirement:** An audit record MUST carry the trace identifier of the operation that produced it.

**Rationale:** The identifier joins the evidence record to the diagnostic detail. An investigation without it stops at the audit record.

### Exclude secrets and payment data (EXT.AUDIT.CLASSIFICATION.001)

**Requirement:** An audit record MUST NOT contain a credential, token, session identifier, encryption key, or payment instrument value.

**Rationale:** A retained, widely readable, append-only store is the worst location for a secret. Retention then extends the exposure.

### Exclude personal data beyond actor identity (EXT.AUDIT.CLASSIFICATION.002)

**Requirement:** An audit record MUST NOT contain personal data other than the pseudonymous identifier of the actor and the target.

**Rationale:** A record holding a name, an address, or a message body turns retention into an erasure conflict. An identifier keeps the record meaningful and erasable.

### Exclude state snapshots (EXT.AUDIT.CLASSIFICATION.003)

**Requirement:** An audit record MUST NOT contain a copy of the state before or after the audited change.

**Rationale:** The domain event stream already holds the change under its own retention. The trail adds the actor and the reason, which nothing else holds.

### Commit a success record with its business change (EXT.AUDIT.ATOMIC.001)

**Requirement:** An audit record with a `succeeded` outcome MUST commit in the same database transaction as the change it describes.

**Rationale:** One transaction makes the action and its evidence inseparable. Neither an unrecorded action nor a record of a rolled-back action can exist.

### Write an unsuccessful record outside the failed transaction (EXT.AUDIT.ATOMIC.002)

**Requirement:** An audit record with a `denied` or `failed` outcome MUST be written on a connection that the failing transaction does not roll back.

**Rationale:** The transaction that would carry the record is the one being abandoned. The evidence of a refusal must outlive the refusal.

### Stage the audit write before the business commit (EXT.AUDIT.ATOMIC.003)

**Requirement:** An audit producer that stages a success record MUST run before the pipeline stage that commits the business transaction.

**Rationale:** A record staged after the commit reaches a closed transaction. Pipeline ordering therefore carries an explicit priority rather than a registration order.

### Publish unsuccessful write failures (EXT.AUDIT.ATOMIC.004)

**Requirement:** An audit deployment MUST publish the write failure count of its unsuccessful-outcome path.

**Rationale:** The separate connection accepts a rare lost record at process death. Continuous loss is a defect, and only a published indicator separates the two.

### Scope every record to its tenant (EXT.AUDIT.ISOLATION.001)

**Requirement:** An audit record describing an action inside tenant-owned data MUST carry the identity of that tenant.

**Rationale:** The tenant is the filter for every read of the trail. A trail without it serves an internal reviewer and no customer.

### Enforce append-only through storage privilege (EXT.AUDIT.PROTECTION.001)

**Requirement:** An audit store MUST refuse update and delete through the privileges granted to the writing account.

**Rationale:** An absent code path is a convention. A revoked privilege is a control that a reviewer can be shown.

**Example:** The application account holds `INSERT` and `SELECT` on the audit table and holds neither `UPDATE` nor `DELETE`.

### Provide tamper evidence (EXT.AUDIT.PROTECTION.002)

**Requirement:** An audit store MUST chain each record to its predecessor with a hash over the canonical record content.

**Rationale:** A chain detects an edit and a removal, because a changed or missing record breaks every following value. Detection is the obligation, and prevention at a higher cost is not.

### Verify the integrity chain on a schedule (EXT.AUDIT.PROTECTION.003)

**Requirement:** An audit deployment MUST verify its integrity chain on a recurring schedule and raise an alert on a break.

**Rationale:** Unverified tamper evidence proves nothing. The verification result is the evidence a reviewer receives.

### Add a correcting record (EXT.AUDIT.PROTECTION.004)

**Requirement:** A correction to the trail MUST be a new record that references the earlier one.

**Rationale:** An edited history carries no evidential value. The correction and the original both stay visible.

### Retain each category for its declared period (EXT.AUDIT.PURGE.001)

**Requirement:** An audit deployment MUST delete a record after the retention period declared for its category.

**Rationale:** An indefinite period is the hardest retention to defend and the easiest to correct at design time.

### Remove the identity mapping on erasure (EXT.AUDIT.PURGE.002)

**Requirement:** An erasure request MUST remove the mapping from actor identifier to person and retain every audit record.

**Rationale:** The record keeps its evidential value and the person stops being identifiable from it. This depends on the record holding no personal data.

### Give the trail a read path (EXT.AUDIT.ACCESS.001)

**Requirement:** An audited system MUST provide a permission-gated read of the trail, filtered by tenant, actor, action, target, and outcome.

**Rationale:** A trail that no use case reads is storage rather than a control. The reviewer and the customer ask one query.

### Audit reads of the trail (EXT.AUDIT.ACCESS.002)

**Requirement:** A read of the audit trail MUST itself produce an audit record.

**Rationale:** Access to the evidence is a sensitive action. An unrecorded read leaves the reviewer outside the trail.

### Record personal-data reads (EXT.AUDIT.READ.001)

**Requirement:** A query that returns personal data across a tenant or account boundary MUST produce an audit record.

**Rationale:** A read leaves no state change and therefore no other trace. Disclosure without a record cannot be investigated.

### Record bulk export (EXT.AUDIT.EXPORT.001)

**Requirement:** An export that returns a set of records to a caller MUST produce an audit record naming the requested scope.

**Rationale:** Bulk extraction is the highest-consequence read in most products. The scope states what left the system.

### Reject an undeclared Command (EXT.AUDIT.ENFORCEMENT.001)

**Requirement:** An automated check MUST fail when a Command declares neither audited nor excluded status.

**Rationale:** The next Command is written by somebody who did not read this page. Only an automated gate catches it.

## Conventions

### Keep audit infrastructure in one location (EXT.AUDIT.CONVENTION.001)

**Default:** Keep the audit record, its store, the producer, and the integrity job under `Infrastructure/Auditing/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One Infrastructure location contains the evidence mechanism.

### Declare audit selection beside the Command (EXT.AUDIT.CONVENTION.002)

**Default:** Declare the action, target kind, category, and exclusion reason as an attribute on the Command type.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The declaration stays with the code it describes, so a review reads both at once.

### Use a fixed category vocabulary (EXT.AUDIT.CONVENTION.003)

**Default:** Classify each audited action as `authentication`, `access`, `grant`, `money`, `configuration`, `privacy`, or `support`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The category drives retention and the review query, so a free-text value defeats both.

### Store the trail beside the business data (EXT.AUDIT.CONVENTION.004)

**Default:** Store audit records in the business database, under a separate account holding insert and select privileges.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One database provides the atomic success write. Privilege separation provides the append-only guarantee.

### Publish a copy to the security platform (EXT.AUDIT.CONVENTION.005)

**Default:** Publish a copy of each record to an external security platform through the outbox, and keep the local store authoritative.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Delivery is at-least-once and evidence needs one durable source. The copy serves detection and the store serves accountability.

## Dependencies

No additional baseline package is required. The `tenancy` extension owns tenant resolution when a deployment serves several customer organizations. The `outbox` extension owns delivery when `EXT.AUDIT.CONVENTION.005` applies.

[Build an audit trail](../guide/audit-trail.md) states one compliant implementation on the command pipeline of the .NET profile.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.AUDIT.ADOPT.001 | inspection | Adoption decision records categories, per-category retention, access model, and integrity method. |
| EXT.AUDIT.ADOPT.002 | static | `AuditSelectionTests` asserts every Command type carries an audited or excluded declaration. |
| EXT.AUDIT.COVERAGE.001 | inspection | Declared selection contains one entry for each of the eight required categories. |
| EXT.AUDIT.COVERAGE.002 | inspection | Selection record justifies each audited category rather than covering all Commands. |
| EXT.AUDIT.BOUNDARY.001 | test | `AuditBoundaryTests` produce one record for a Command with no audit call in the handler. |
| EXT.AUDIT.BOUNDARY.002 | static | `AuditBoundaryTests` asserts handler sources set only target identity and reason. |
| EXT.AUDIT.BOUNDARY.003 | static | `AuditBoundaryTests` asserts no audit writer subscribes to domain events or database triggers. |
| EXT.AUDIT.RECORD.001 | test | `AuditRecordTests` assert every required field is present and non-default. |
| EXT.AUDIT.RECORD.002 | test | `AuditRecordTests` match each `action` value against the registered use-case identity list. |
| EXT.AUDIT.RECORD.003 | test | `AuditRecordTests` carry a failure code on `denied` and `failed` records. |
| EXT.AUDIT.SCHEMA.001 | test | `AuditRecordTests` carry an explicit schema version value. |
| EXT.AUDIT.ACTOR.001 | static | `AuditActorTests` asserts the actor type is a closed set covering person, device, and process. |
| EXT.AUDIT.ACTOR.002 | test | `AuditActorTests` set the grant field for an action taken under a support grant. |
| EXT.AUDIT.STATUS.001 | test | `AuditStatusTests` assert one of the three declared outcome values. |
| EXT.AUDIT.STATUS.002 | test | `AuditStatusTests` produce a `denied` record from a refused authorization. |
| EXT.AUDIT.STATUS.003 | test | `AuditStatusTests` produce a `failed` record from a permitted attempt that throws. |
| EXT.AUDIT.CONTEXT.001 | test | `AuditContextTests` carry origin address, client description, and request identifier. |
| EXT.AUDIT.CONTEXT.002 | test | `AuditContextTests` match the record trace identifier to the diagnostic log entry. |
| EXT.AUDIT.CLASSIFICATION.001 | test | `AuditClassificationTests` reject a record containing a credential or payment value. |
| EXT.AUDIT.CLASSIFICATION.002 | static | `AuditClassificationTests` asserts the record type exposes no personal-data field. |
| EXT.AUDIT.CLASSIFICATION.003 | static | `AuditClassificationTests` asserts the record type exposes no before or after state field. |
| EXT.AUDIT.ATOMIC.001 | test | `AuditAtomicTests` observe no audit record after the business transaction rolls back. |
| EXT.AUDIT.ATOMIC.002 | test | `AuditAtomicTests` retain a `denied` record after the request transaction rolls back. |
| EXT.AUDIT.ATOMIC.003 | test | `AuditAtomicTests` assert the audit stage priority precedes the commit stage priority. |
| EXT.AUDIT.ATOMIC.004 | operation | Metrics backend receives the unsuccessful-path write failure count. |
| EXT.AUDIT.ISOLATION.001 | test | `AuditIsolationTests` carry the tenant of the acted-on resource. |
| EXT.AUDIT.PROTECTION.001 | test | `AuditProtectionTests` receive a privilege error from update and delete statements. |
| EXT.AUDIT.PROTECTION.002 | test | `AuditProtectionTests` detect a modified record through a broken chain value. |
| EXT.AUDIT.PROTECTION.003 | operation | Scheduled verification job publishes its result and raises an alert on a break. |
| EXT.AUDIT.PROTECTION.004 | test | `AuditProtectionTests` append a correcting record that references the original. |
| EXT.AUDIT.PURGE.001 | test | `AuditPurgeTests` remove records past the declared retention of their category. |
| EXT.AUDIT.PURGE.002 | test | `AuditPurgeTests` retain records and resolve no person after identity removal. |
| EXT.AUDIT.ACCESS.001 | test | `AuditAccessTests` return records filtered by each declared filter and reject an unpermitted caller. |
| EXT.AUDIT.ACCESS.002 | test | `AuditAccessTests` produce one record for a completed trail read. |
| EXT.AUDIT.READ.001 | test | `AuditReadTests` produce a record for a cross-boundary personal-data query. |
| EXT.AUDIT.EXPORT.001 | test | `AuditExportTests` produce a record naming the requested export scope. |
| EXT.AUDIT.ENFORCEMENT.001 | static | `AuditSelectionTests` fails the build for a Command with no declaration. |
| EXT.AUDIT.CONVENTION.001 | inspection | Audit Infrastructure files use the documented path or a local replacement. |
| EXT.AUDIT.CONVENTION.002 | inspection | Command types carry the declaration attribute or a local replacement. |
| EXT.AUDIT.CONVENTION.003 | test | `AuditSelectionTests` assert each category value belongs to the declared vocabulary. |
| EXT.AUDIT.CONVENTION.004 | inspection | Audit table privileges separate the writing account from the application account. |
| EXT.AUDIT.CONVENTION.005 | inspection | Outbox configuration publishes audit copies and names the local store authoritative. |
