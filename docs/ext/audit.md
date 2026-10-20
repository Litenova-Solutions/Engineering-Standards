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

This extension replaces `litespec/rule/quality-security.record-security-audit-events`. The baseline states the required record fields for one security audit event. This extension owns the producer, the transaction boundary, the selection policy, the store, and the read path.

This extension switches on no optional record type.

## Agent Summary {#agent-summary}

- Record the audited categories, retention, access, and integrity method before writing code. (litespec/rule/ext-audit.record-the-audit-adoption-decision)
- Declare every Command as audited or excluded with a reason. (litespec/rule/ext-audit.declare-audit-selection-on-every-command, litespec/rule/ext-audit.reject-an-undeclared-command)
- Produce records at the mediation boundary, not inside a handler. (litespec/rule/ext-audit.emit-audit-records-at-the-mediation-boundary, litespec/rule/ext-audit.restrict-handler-contribution-to-determined-values)
- Record refused and failed attempts, not successes alone. (litespec/rule/ext-audit.record-every-attempt-outcome, litespec/rule/ext-audit.record-refused-authorization)
- Carry actor, target, outcome, time, origin, and trace identity. (litespec/rule/ext-audit.record-the-required-audit-fields, litespec/rule/ext-audit.record-the-request-origin)
- Exclude secrets, personal data, and state snapshots from the record. (litespec/rule/ext-audit.exclude-secrets-and-payment-data, litespec/rule/ext-audit.exclude-personal-data-beyond-actor-identity)
- Commit a success record with its business change. (litespec/rule/ext-audit.commit-a-success-record-with-its-business-change, litespec/rule/ext-audit.stage-the-audit-write-before-the-business-commit)
- Enforce append-only through storage privilege and chained integrity evidence. (litespec/rule/ext-audit.enforce-append-only-through-storage-privilege, litespec/rule/ext-audit.provide-tamper-evidence)
- Scope every record to its owning tenant. (litespec/rule/ext-audit.scope-every-record-to-its-tenant)
- Give the trail a permission-gated read path. (litespec/rule/ext-audit.give-the-trail-a-read-path)

## Standards

### Record the audit adoption decision (litespec/rule/ext-audit.record-the-audit-adoption-decision)

**Requirement:** An audit adoption decision MUST record its owner, status, decider, decide-by, audited categories, threshold, access model, integrity method, and records entry.

**Rationale:** The selection, its retention, and its protection are policy choices. A reviewer evaluates the declared policy before evaluating the implementation. No record is approved while this decision is draft. Each audited category carries its retention period and lawful basis. The decision records the bulk-read threshold, the read access model, the integrity method, and the processing-records entry.

### Declare audit selection on every Command (litespec/rule/ext-audit.declare-audit-selection-on-every-command)

**Requirement:** Every Command MUST declare that it is audited, or declare that it is excluded together with the reason for exclusion.

**Rationale:** An implicit selection cannot be reviewed. A total declaration makes an omission a visible statement rather than an absent call.

**Example:** A storefront browse Command declares exclusion because a public catalog read is not a sensitive action.

### Cover the required audit categories (litespec/rule/ext-audit.cover-the-required-audit-categories)

**Requirement:** An audit selection MUST include authentication, authorization denial, grant change, monetary action, tenant configuration, personal-data read, bulk export, and background-process change.

**Rationale:** These categories carry the questions a security review, a customer, and a supervisory authority ask. A trail that omits one of them cannot answer its own purpose.

### Exclude indiscriminate auditing (litespec/rule/ext-audit.exclude-indiscriminate-auditing)

**Requirement:** A project MUST NOT audit every Command without a recorded selection.

**Rationale:** An undifferentiated trail buries the sensitive action inside routine traffic. Volume then defeats the review the trail exists to support.

### Emit audit records at the mediation boundary (litespec/rule/ext-audit.emit-audit-records-at-the-mediation-boundary)

**Requirement:** An audit producer MUST run in the mediation pipeline stages that dispatch the Command.

**Rationale:** Only the pipeline observes the whole attempt, including its outcome. A handler that throws never reaches an audit call placed inside it.

**Example:** A pre-handler opens the audit scope, a post-handler closes it as `succeeded`, and an error handler closes it as `denied` or `failed`.

### Restrict handler contribution to determined values (litespec/rule/ext-audit.restrict-handler-contribution-to-determined-values)

**Requirement:** A handler MUST contribute only the audit values that the handler alone determines.

**Rationale:** A generated target identity and a composed reason are unavailable before the handler runs. Every other field comes from the declaration, the actor, and the request context.

**Example:** A create handler contributes the identity it generated. It contributes no actor, action code, or timestamp.

### Exclude derived audit trails (litespec/rule/ext-audit.exclude-derived-audit-trails)

**Requirement:** An audit trail MUST NOT be derived from domain events, database triggers, or change data capture.

**Rationale:** These sources describe committed state change. They carry no refused attempt, no use-case identity, and no request origin.

### Record the required audit fields (litespec/rule/ext-audit.record-the-required-audit-fields)

**Requirement:** An audit record MUST contain actor, action, target, outcome, business time, record time, and tenant, fixed where the tenancy extension is absent.

**Rationale:** These fields carry the accountability question. Business time states when the action happened, and record time states when the evidence was written. Actor and target each carry kind and identity.

### State the action as use-case identity (litespec/rule/ext-audit.state-the-action-as-use-case-identity)

**Requirement:** An audit `action` MUST use the identity of the use case that the actor invoked.

**Rationale:** A reviewer resolves the record to the specification that defines the intended behavior. A separate vocabulary requires a mapping that drifts.

**Example:** `catalog.add-product` names both the use case and the audited action.

### Record the failure code on an unsuccessful attempt (litespec/rule/ext-audit.record-the-failure-code-on-an-unsuccessful-attempt)

**Requirement:** An audit record with a `denied` or `failed` outcome MUST carry the stable failure code that the attempt produced.

**Rationale:** The code distinguishes a refused permission from an exhausted precondition, which are different review findings.

### Version the audit record shape (litespec/rule/ext-audit.version-the-audit-record-shape)

**Requirement:** An audit record MUST carry an explicit schema version.

**Rationale:** A retained record outlives several shapes of the application that wrote it. The version keeps an old record readable without rewriting it.

### Use a closed actor set (litespec/rule/ext-audit.use-a-closed-actor-set)

**Requirement:** An audit actor MUST be one of `person`, `company`, `provider`, `system`, or `guest`.

**Rationale:** An absent actor collapses three answers into one. A scheduled process acted, a device acted, or nobody recorded the actor, and only the third is a defect. A device maps to the person whose account authorized it, with the device recorded as the client description. A named process maps to `system`.

**Example:** A warehouse handheld records the person actor whose account authorized it, and the origin record names the device.

### Record delegated administrative access (litespec/rule/ext-audit.record-delegated-administrative-access)

**Requirement:** An action that an actor takes under an administrative or support grant MUST record that the grant was used.

**Rationale:** A supplier-side action and a customer-side action are indistinguishable without this field. The distinction is what makes a no-silent-access commitment demonstrable.

### Record every attempt outcome (litespec/rule/ext-audit.record-every-attempt-outcome)

**Requirement:** An audit record MUST carry an outcome of `succeeded`, `denied`, or `failed`.

**Rationale:** A trail of successes is a change history. The refused attempt carries the security signal.

**Example:** `succeeded` names a committed change, `denied` names a refused authorization, and `failed` names a permitted attempt that did not complete.

### Record refused authorization (litespec/rule/ext-audit.record-refused-authorization)

**Requirement:** An authorization decision that refuses an audited action MUST produce an audit record.

**Rationale:** Repeated refusal is the primary indicator of a compromised or probing account. No other record holds it.

### Record failed audited attempts (litespec/rule/ext-audit.record-failed-audited-attempts)

**Requirement:** An audited action that the actor was permitted to take and that did not complete MUST produce an audit record.

**Rationale:** A permitted attempt that fails repeatedly separates an operating defect from an access problem.

### Record the request origin (litespec/rule/ext-audit.record-the-request-origin)

**Requirement:** An audit record produced from an inbound request MUST carry the request origin address, the client description, and the request identifier.

**Rationale:** Two records naming one account state nothing about location. The same records from two countries within one minute state that the account is compromised.

### Record the operation trace identity (litespec/rule/ext-audit.record-the-operation-trace-identity)

**Requirement:** An audit record MUST carry the trace identifier of the operation that produced it.

**Rationale:** The identifier joins the evidence record to the diagnostic detail. An investigation without it stops at the audit record.

### Exclude secrets and payment data (litespec/rule/ext-audit.exclude-secrets-and-payment-data)

**Requirement:** An audit record MUST NOT contain a credential, token, session identifier, encryption key, or payment instrument value.

**Rationale:** A retained, widely readable, append-only store is the worst location for a secret. Retention then extends the exposure.

### Exclude personal data beyond actor identity (litespec/rule/ext-audit.exclude-personal-data-beyond-actor-identity)

**Requirement:** An audit record MUST NOT contain personal data other than the pseudonymous identifier of the actor and the target.

**Rationale:** A record holding a name, an address, or a message body turns retention into an erasure conflict. An identifier keeps the record meaningful and erasable.

A pseudonymous identifier is still personal data where the party holding it can reverse it. That is the position [the EDPB states](https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-012020-processing-personal-data-context-art-6-1). The identifier is therefore safe inside the tenant that owns the mapping, and is a disclosure when it leaves that tenant.

**Example:** An audit export crossing a tenant boundary replaces each identifier with one derived for that export. The receiving party then cannot join the records back to a subject.

### Exclude state snapshots (litespec/rule/ext-audit.exclude-state-snapshots)

**Requirement:** An audit record MUST NOT contain a copy of the state before or after the audited change.

**Rationale:** The domain event stream already holds the change under its own retention. The trail adds the actor and the reason, which nothing else holds.

### Commit a success record with its business change (litespec/rule/ext-audit.commit-a-success-record-with-its-business-change)

**Requirement:** An audit record with a `succeeded` outcome MUST commit in the same database transaction as the change it describes.

**Rationale:** One transaction makes the action and its evidence inseparable. Neither an unrecorded action nor a record of a rolled-back action can exist.

### Write an unsuccessful record outside the failed transaction (litespec/rule/ext-audit.write-an-unsuccessful-record-outside-the-failed-transaction)

**Requirement:** An audit record with a `denied` or `failed` outcome MUST be written on a connection that the failing transaction does not roll back.

**Rationale:** The transaction that would carry the record is the one being abandoned. The evidence of a refusal must outlive the refusal.

### Stage the audit write before the business commit (litespec/rule/ext-audit.stage-the-audit-write-before-the-business-commit)

**Requirement:** An audit producer that stages a success record MUST run before the pipeline stage that commits the business transaction.

**Rationale:** A record staged after the commit reaches a closed transaction. Pipeline ordering therefore carries an explicit priority rather than a registration order.

### Publish unsuccessful write failures (litespec/rule/ext-audit.publish-unsuccessful-write-failures)

**Requirement:** An audit deployment MUST publish the write failure count of its unsuccessful-outcome path.

**Rationale:** The separate connection accepts a rare lost record at process death. Continuous loss is a defect, and only a published indicator separates the two.

### Scope every record to its tenant (litespec/rule/ext-audit.scope-every-record-to-its-tenant)

**Requirement:** An audit record describing an action inside tenant-owned data MUST carry the identity of that tenant.

**Rationale:** The tenant is the filter for every read of the trail. A trail without it serves an internal reviewer and no customer.

### Enforce append-only through storage privilege (litespec/rule/ext-audit.enforce-append-only-through-storage-privilege)

**Requirement:** An audit store MUST refuse update and delete through the privileges granted to the writing account.

**Rationale:** An absent code path is a convention. A revoked privilege is a control that a reviewer can be shown.

**Example:** The application account holds `INSERT` and `SELECT` on the audit table and holds neither `UPDATE` nor `DELETE`.

### Provide tamper evidence (litespec/rule/ext-audit.provide-tamper-evidence)

**Requirement:** An audit store MUST chain each record to its predecessor with a SHA-256 hash over a canonical serialization of both.

**Rationale:** A chain detects an edit and a removal, because a changed or missing record breaks every following value. Detection is the obligation, and prevention at a higher cost is not.

The algorithm is named because two implementations that each chose their own cannot verify each other. A verifier written later cannot recompute a chain whose algorithm nobody recorded. Canonical serialization is named for the same reason: a hash over a serialization that reorders fields verifies nothing.

**Example:** The chain value is `SHA-256(previousHash || canonical(record))`, where `canonical` sorts object members and uses one fixed encoding for every timestamp and number.

### Anchor the audit chain outside its own store (litespec/rule/ext-audit.anchor-the-audit-chain-outside-its-own-store)

**Requirement:** An audit store SHOULD publish a periodic checkpoint of its chain head to a destination that the store's own operators cannot rewrite.

**Deviation:** A store whose recorded threat model excludes its own operators publishes no checkpoint.

**Rationale:** A chain proves that records are consistent with each other. It does not prove that the whole chain was not recomputed, which anyone holding the store can do. A checkpoint somebody else holds fixes the chain as it stood at that moment, so a later recomputation disagrees with it.

**Example:** The checkpoint is the chain head and its record count, published at a stated interval. A separate append-only destination, a timestamping authority, and a transparency log each qualify.

### Verify the integrity chain on a schedule (litespec/rule/ext-audit.verify-the-integrity-chain-on-a-schedule)

**Requirement:** An audit deployment MUST verify its integrity chain on a recurring schedule and raise an alert on a break.

**Rationale:** Unverified tamper evidence proves nothing. The verification result is the evidence a reviewer receives.

### Add a correcting record (litespec/rule/ext-audit.add-a-correcting-record)

**Requirement:** A correction to the trail MUST be a new record that references the earlier one.

**Rationale:** An edited history carries no evidential value. The correction and the original both stay visible.

### Retain each category for its declared period (litespec/rule/ext-audit.retain-each-category-for-its-declared-period)

**Requirement:** An audit deployment MUST delete a record after the retention period declared for its category.

**Rationale:** An indefinite period is the hardest retention to defend and the easiest to correct at design time.

### Remove the identity mapping on erasure (litespec/rule/ext-audit.remove-the-identity-mapping-on-erasure)

**Requirement:** An erasure request MUST remove the mapping from actor identifier to person and retain every audit record.

**Rationale:** The record keeps its evidential value and the person stops being identifiable from it. This depends on the record holding no personal data.

### Give the trail a read path (litespec/rule/ext-audit.give-the-trail-a-read-path)

**Requirement:** An audited system MUST provide a trail read as a use case needing a Permission record, filtered by tenant, actor, action, target, and outcome.

**Rationale:** A trail that no use case reads is storage rather than a control. The actor holds a Role at a scope, the Role allows the Permission, and the guard permits the read.

### Audit reads of the trail (litespec/rule/ext-audit.audit-reads-of-the-trail)

**Requirement:** A read of the audit trail MUST itself produce an audit record.

**Rationale:** Access to the evidence is a sensitive action. An unrecorded read leaves the reviewer outside the trail.

### Record personal-data reads (litespec/rule/ext-audit.record-personal-data-reads)

**Requirement:** A query returning personal data across a boundary MUST produce an audit record, defining the account boundary in the adoption decision where tenancy is absent.

**Rationale:** A read leaves no state change and therefore no other trace. Disclosure without a record cannot be investigated.

### Record a bulk read inside its own boundary (litespec/rule/ext-audit.record-a-bulk-read-inside-its-own-boundary)

**Requirement:** A query returning personal data for more subjects than its declared threshold MUST produce an audit record, inside one tenant or account boundary as well.

**Rationale:** The cross-boundary rule catches a disclosure to the wrong party. It does not catch an export of every record a party may read one at a time. That is the shape a copied dataset has. [Article 30 of the GDPR](https://gdpr-info.eu/art-30-gdpr/) asks what categories of data were processed and by whom, and an unrecorded bulk read cannot answer either.

**Example:** A project records the threshold in the adoption decision. A list endpoint whose page size can exceed it audits the read with the subject count rather than the subjects.

### Record bulk export (litespec/rule/ext-audit.record-bulk-export)

**Requirement:** An export that returns a set of records to a caller MUST produce an audit record naming the requested scope.

**Rationale:** Bulk extraction is the highest-consequence read in most products. The scope states what left the system.

### Reject an undeclared Command (litespec/rule/ext-audit.reject-an-undeclared-command)

**Requirement:** An automated check MUST fail when a Command declares neither audited nor excluded status, with a composition refusal at startup satisfying this rule.

**Rationale:** The next Command is written by somebody who did not read this page. Only an automated gate catches it.

## Conventions

### Keep audit infrastructure in one location (litespec/rule/ext-audit.keep-audit-infrastructure-in-one-location)

**Default:** Keep the audit record, its store, the producer, and the integrity job under `Infrastructure/Auditing/`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** One Infrastructure location contains the evidence mechanism.

### Declare audit selection beside the Command (litespec/rule/ext-audit.declare-audit-selection-beside-the-command)

**Default:** Declare the action, target kind, category, and exclusion reason as an attribute on the Command type.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The declaration stays with the code it describes, so a review reads both at once.

### Use a fixed category vocabulary (litespec/rule/ext-audit.use-a-fixed-category-vocabulary)

**Default:** Classify each audited action as `authentication`, `authorization-denial`, `grant-change`, `monetary-action`, `tenant-configuration`, `personal-data-read`, `bulk-export`, or `background-process-change`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The category drives retention and the review query, so a free-text value defeats both.

### Store the trail beside the business data (litespec/rule/ext-audit.store-the-trail-beside-the-business-data)

**Default:** Store audit records in the business database, under a separate account holding insert and select privileges.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** One database provides the atomic success write. Privilege separation provides the append-only guarantee.

### Publish a copy to the security platform (litespec/rule/ext-audit.publish-a-copy-to-the-security-platform)

**Default:** Publish a copy of each record to an external security platform through the outbox, and keep the local store authoritative.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Delivery is at-least-once and evidence needs one durable source. The copy serves detection and the store serves accountability.

## Dependencies

No additional baseline package is required. The `tenancy` extension owns tenant resolution when a deployment serves several customer organizations. The `outbox` extension owns delivery when `litespec/rule/ext-audit.publish-a-copy-to-the-security-platform` applies.

[Build an audit trail](../guide/audit-trail.md) states one compliant implementation on the command pipeline of the .NET profile.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/ext-audit.record-the-audit-adoption-decision | guidance | Does the adoption decision record the required fields, and is no record approved behind its draft? |
| litespec/rule/ext-audit.declare-audit-selection-on-every-command | guidance | Does every Command declare audited status or excluded status with a reason? |
| litespec/rule/ext-audit.cover-the-required-audit-categories | guidance | Does the declared selection contain one entry for each required category? |
| litespec/rule/ext-audit.exclude-indiscriminate-auditing | guidance | Does the selection justify each audited category rather than auditing every Command? |
| litespec/rule/ext-audit.emit-audit-records-at-the-mediation-boundary | guidance | Does the producer run in the mediation pipeline rather than inside handlers? |
| litespec/rule/ext-audit.restrict-handler-contribution-to-determined-values | guidance | Does each handler contribute only the audit values it alone determines? |
| litespec/rule/ext-audit.exclude-derived-audit-trails | guidance | Is the trail produced directly rather than derived from events, triggers, or capture? |
| litespec/rule/ext-audit.record-the-required-audit-fields | guidance | Does every record carry each required field, including the tenant value? |
| litespec/rule/ext-audit.state-the-action-as-use-case-identity | guidance | Does each action value name the invoked use case? |
| litespec/rule/ext-audit.record-the-failure-code-on-an-unsuccessful-attempt | guidance | Does each denied or failed record carry its stable failure code? |
| litespec/rule/ext-audit.version-the-audit-record-shape | guidance | Does every record carry an explicit schema version? |
| litespec/rule/ext-audit.use-a-closed-actor-set | guidance | Is every actor one of the five Actor kinds, with devices and processes mapped? |
| litespec/rule/ext-audit.record-delegated-administrative-access | guidance | Does an action under a support grant record that the grant was used? |
| litespec/rule/ext-audit.record-every-attempt-outcome | guidance | Does every record carry one of the three declared outcomes? |
| litespec/rule/ext-audit.record-refused-authorization | guidance | Does a refused authorization produce a denied record? |
| litespec/rule/ext-audit.record-failed-audited-attempts | guidance | Does a permitted attempt that throws produce a failed record? |
| litespec/rule/ext-audit.record-the-request-origin | guidance | Does each request-produced record carry origin, client, and request identifier? |
| litespec/rule/ext-audit.record-the-operation-trace-identity | guidance | Does each record carry the trace identifier of its operation? |
| litespec/rule/ext-audit.exclude-secrets-and-payment-data | guidance | Is every record free of credentials, tokens, session identifiers, keys, and payment values? |
| litespec/rule/ext-audit.exclude-personal-data-beyond-actor-identity | guidance | Does each record hold only pseudonymous actor and target identifiers? |
| litespec/rule/ext-audit.exclude-state-snapshots | guidance | Is every record free of before and after state copies? |
| litespec/rule/ext-audit.commit-a-success-record-with-its-business-change | guidance | Does a succeeded record commit in the same transaction as its change? |
| litespec/rule/ext-audit.write-an-unsuccessful-record-outside-the-failed-transaction | guidance | Does a denied or failed record survive the rollback of its transaction? |
| litespec/rule/ext-audit.stage-the-audit-write-before-the-business-commit | guidance | Does the audit stage run before the business commit stage? |
| litespec/rule/ext-audit.publish-unsuccessful-write-failures | guidance | Does the deployment publish the write failure count of the unsuccessful path? |
| litespec/rule/ext-audit.scope-every-record-to-its-tenant | guidance | Does each record carry the tenant of the acted-on resource? |
| litespec/rule/ext-audit.enforce-append-only-through-storage-privilege | guidance | Does the writing account lack update and delete privileges on the store? |
| litespec/rule/ext-audit.provide-tamper-evidence | guidance | Does each record chain to its predecessor with the stated hash? |
| litespec/rule/ext-audit.anchor-the-audit-chain-outside-its-own-store | guidance | Does a checkpoint the operators cannot rewrite anchor the chain head? |
| litespec/rule/ext-audit.verify-the-integrity-chain-on-a-schedule | guidance | Does a scheduled job verify the chain and alert on a break? |
| litespec/rule/ext-audit.add-a-correcting-record | guidance | Is each correction a new record referencing the earlier one? |
| litespec/rule/ext-audit.retain-each-category-for-its-declared-period | guidance | Are records deleted after the declared retention of their category? |
| litespec/rule/ext-audit.remove-the-identity-mapping-on-erasure | guidance | Does erasure remove the identity mapping while retaining the records? |
| litespec/rule/ext-audit.give-the-trail-a-read-path | guidance | Does a permission-gated read filter the trail by every declared filter? |
| litespec/rule/ext-audit.audit-reads-of-the-trail | guidance | Does a completed trail read produce one audit record? |
| litespec/rule/ext-audit.record-personal-data-reads | guidance | Does a cross-boundary personal-data query produce a record? |
| litespec/rule/ext-audit.record-a-bulk-read-inside-its-own-boundary | guidance | Does a query above the threshold produce a record carrying the subject count? |
| litespec/rule/ext-audit.record-bulk-export | guidance | Does each export produce a record naming the requested scope? |
| litespec/rule/ext-audit.reject-an-undeclared-command | guidance | Does the build or startup fail for a Command with no declaration? |
| litespec/rule/ext-audit.keep-audit-infrastructure-in-one-location | guidance | Does the audit code use the documented path or a recorded Exception? |
| litespec/rule/ext-audit.declare-audit-selection-beside-the-command | guidance | Does each Command carry the declaration attribute or a recorded Exception? |
| litespec/rule/ext-audit.use-a-fixed-category-vocabulary | guidance | Does each category value belong to the eight-value vocabulary? |
| litespec/rule/ext-audit.store-the-trail-beside-the-business-data | guidance | Is the trail in the business database under separated privileges or a recorded Exception? |
| litespec/rule/ext-audit.publish-a-copy-to-the-security-platform | guidance | Does a published copy leave the local store authoritative, or is there a recorded Exception? |
