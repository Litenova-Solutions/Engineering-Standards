# Audit Trail

## Intent

An audit trail proves who attempted what inside data one party owns while another party acts in it, including attempts the system refused. This page states what the trail stores for each attempt, which attempts it covers, where the producer runs, how the store resists tampering, and how a reviewer reads the trail. A team whose system acts in another party's data selects this extension and keeps one trail that proves accountability instead of reconstructing the answer from logs and domain events (facts the system recorded as completed).

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `audit` when a person or a machine acts inside data that another party owns and a later reviewer has to establish who is accountable. A regulatory obligation, a customer contract, payment scope, and platform-side support access each meet this condition.

[Audit obligations](../reference/audit-obligations.md) maps each provision on this page to the external obligation it satisfies.

## Baseline relationship

This extension replaces `litespec/quality/security#record-security-audit-events`. The baseline states the required record fields for one security audit event. This extension owns the producer, the transaction boundary, the selection policy, the store, and the read path.

This extension switches on no optional record type.

Diagnostic logs and domain events already exist in every system, but neither answers who is accountable. An audited system keeps three records with different producers, readers, and retention. Conflating them removes evidence.

| Record | Holds | Read by |
|:---|:---|:---|
| Diagnostic log | What the software did | Engineers during an incident |
| Domain event stream | What became true | The system itself |
| Audit trail | Who is accountable for an attempt | Reviewers, customers, regulators |

A domain event cannot substitute for an audit record. A domain event carries domain identity rather than use-case identity, and one event type can come from more than one use case. A domain event carries only the fields the domain needs, so an actor the domain ignores is absent. A refused attempt changes no state and raises no event, even though refusal is the case a reviewer asks about.

## Standards

### Record the audit adoption decision

**Statement:** An audit adoption decision MUST record its owner, status, decider, decide-by, audited categories, threshold, access model, integrity method, and records entry.

**Rationale:** Which actions to audit, how long to keep them, and how to protect them are policy choices, so the project declares them once in the adoption decision. A reviewer reads the declared policy before reading the implementation, and no record is approved while the decision is still draft. Without that order, each reviewer reconstructs the policy from the code and two reviewers reconstruct different policies.

### Declare audit selection on every Command

**Statement:** Every Command MUST declare that it is audited, or declare that it is excluded together with the reason for exclusion.

**Rationale:** An audit selection that lives only in code is invisible: a reader cannot tell an unaudited Command from an audited one whose call is missing. A declaration on every Command turns each omission into a visible statement with a reason. Review then reads the selection instead of hunting for missing calls.

**Example:** A storefront browse Command declares exclusion because a public catalog read is not a sensitive action.

### Cover the required audit categories

**Statement:** An audit selection MUST include authentication, authorization denial, grant change, monetary action, tenant configuration, personal-data read, bulk export, and background-process change.

**Rationale:** Each listed category answers a question a security review, a customer, or a supervisory authority asks after an incident: who signed in, who was refused, who changed a grant, who moved money, and the rest. A trail that omits a category has no answer when that question arrives. The list fixes the floor so no project discovers the gap during its first review.

### Exclude indiscriminate auditing

**Statement:** A project MUST NOT audit every Command without a recorded selection.

**Rationale:** A trail that records every Command buries the sensitive action inside routine traffic, and the reviewer who must read it stops reading. Volume then defeats the review the trail exists to support. A recorded selection keeps the trail small enough to read.

### Emit audit records at the mediation boundary

**Statement:** An audit producer MUST run in the mediation pipeline stages that dispatch the Command.

**Rationale:** Only the pipeline stages that dispatch the Command observe the whole attempt, including attempts the handler never reaches. An audit call inside the handler misses every attempt that throws before it and every refusal the pipeline makes. The pipeline is therefore the one place that records all three outcomes.

**Example:** A pre-handler opens the audit scope, a post-handler closes it as `succeeded`, and an error handler closes it as `denied` or `failed`.

### Restrict handler contribution to determined values

**Statement:** A handler MUST contribute only the audit values that the handler alone determines.

**Rationale:** The declaration, the actor, and the request context already fix most fields before the handler runs. Only the handler knows the values it alone determines, such as a generated target identity or a composed reason. Letting the handler write the rest invites a second copy of each field that drifts from the first.

**Example:** A create handler contributes the identity it generated. It contributes no actor, action code, or timestamp.

### Exclude derived audit trails

**Statement:** An audit trail MUST NOT be derived from domain events, database triggers, or change data capture.

**Rationale:** Domain events, triggers, and change data capture describe committed state change. They carry no refused attempt, no use-case identity, and no request origin, which are the fields a reviewer reads. A trail derived from them answers what changed and never who attempted it.

### Record the required audit fields

**Statement:** An audit record MUST contain actor, action, target, outcome, business time, record time, and tenant, fixed where the tenancy extension is absent.

**Rationale:** Actor, action, target, outcome, the two times, and the tenant together answer who attempted what, against whose data, with what result, and when. Business time states when the action happened and record time states when the evidence was written, so a delayed write stays visible as a delay. A record missing any of them leaves the accountability question half answered.

### State the action as use-case identity

**Statement:** An audit `action` MUST use the identity of the use case that the actor invoked.

**Rationale:** A reviewer who reads an action value opens the specification of that use case to learn the intended behavior. A separate action vocabulary needs a mapping to those specifications, and the mapping drifts as both sides change. Reusing the use-case identity keeps record and specification joined with no mapping to maintain.

**Example:** `catalog.add-product` names both the use case and the audited action.

### Record the failure code on an unsuccessful attempt

**Statement:** An audit record with a `denied` or `failed` outcome MUST carry the stable failure code that the attempt produced.

**Rationale:** A refused permission and an exhausted precondition need different responses, but both look like failure without a code. The stable failure code tells the reviewer which one the attempt produced. It also lets trend queries count one kind of refusal across the whole trail.

### Version the audit record shape

**Statement:** An audit record MUST carry an explicit schema version.

**Rationale:** A retained record outlives several shapes of the application that wrote it. An explicit version lets a later reader parse each record in the shape it was written in. Without it, every shape change forces a rewrite of retained evidence.

### Use a closed actor set

**Statement:** An audit actor MUST be one of `person`, `company`, `provider`, `system`, or `guest`.

**Rationale:** An absent actor collapses three answers into one: a scheduled process acted, a device acted, or no one recorded the actor, and only the third is a defect. The five kinds separate them: a device maps to the person whose account authorized it, with the device as the client description, and a named process maps to `system`. A free-text actor would let each writer spell the same actor differently and break every actor filter.

**Example:** A warehouse handheld records the person actor whose account authorized it. The origin record names the device.

### Record delegated administrative access

**Statement:** An action that an actor takes under an administrative or support grant MUST record that the grant was used.

**Rationale:** Support staff act inside customer data under a grant, and without a marker their actions read exactly like customer actions. The marker makes a no-silent-access commitment demonstrable: every supplier-side action says so on its own record. A reviewer who cannot separate the two cannot verify the commitment.

### Record every attempt outcome

**Statement:** An audit record MUST carry an outcome of `succeeded`, `denied`, or `failed`.

**Rationale:** A trail of successes is a change history, not evidence. The refused attempt carries the security signal, and the failed attempt carries the operating signal. Three outcomes keep both signals in the same trail as the successes they qualify.

**Example:** `succeeded` names a committed change, `denied` names a refused authorization, and `failed` names a permitted attempt that did not complete.

### Record refused authorization

**Statement:** An authorization decision that refuses an audited action MUST produce an audit record.

**Rationale:** Repeated refusal is the first indicator of a compromised or probing account, and no other record holds it: nothing changed, so nothing else was written. Each refusal therefore writes its own record. A trail without refusals shows an attacker who never failed.

### Record failed audited attempts

**Statement:** An audited action that the actor was permitted to take and that did not complete MUST produce an audit record.

**Rationale:** A permitted attempt that throws is neither a success nor a refusal, and without a record it vanishes entirely. Writing it separates an operating defect from an access problem: failures cluster around broken behavior, denials cluster around missing permission. Support reads that split before it reads the logs.

### Record the request origin

**Statement:** An audit record produced from an inbound request MUST carry the request origin address, the client description, and the request identifier.

**Rationale:** Two records naming one account state nothing about location. The same account acting from two countries within one minute states that the account is compromised, but only when each record carries origin, client, and request identifier. The request identifier further joins the record to the exact request in the diagnostic log.

### Record the operation trace identity

**Statement:** An audit record MUST carry the trace identifier of the operation that produced it.

**Rationale:** The audit record states what was attempted, and the diagnostic log states what the software did while attempting it. The trace identifier joins the two, so an investigation moves from evidence to detail in one step. Without it, the investigation stops at the audit record and reconstructs the rest by time.

### Exclude secrets and payment data

**Statement:** An audit record MUST NOT contain a credential, token, session identifier, encryption key, or payment instrument value.

**Rationale:** The trail is retained, widely readable, and append-only, which is the worst combination for a secret: retention extends the exposure and append-only removes the repair. A credential or payment value written once stays readable for the whole retention period. Secrets and payment values therefore travel in the systems built to hold them, never in the trail.

### Exclude personal data beyond actor identity

**Statement:** An audit record MUST NOT contain personal data other than the pseudonymous identifier of the actor and the target.

**Rationale:** A record holding a name, an address, or a message body turns retention into an erasure conflict: the law asks for deletion and the trail asks for keeping. Pseudonymous identifiers keep the record meaningful while the mapping lives, and erasable once the mapping goes. The record then survives erasure instead of fighting it.

A pseudonymous identifier is still personal data where the party holding it can reverse it. That is the position [the EDPB states](https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-012020-processing-personal-data-context-art-6-1). The identifier is therefore safe inside the tenant that owns the mapping. It is a disclosure when it leaves that tenant.

**Example:** An audit export crossing a tenant boundary replaces each identifier with one derived for that export. The receiving party then cannot join the records back to a subject.

### Exclude state snapshots

**Statement:** An audit record MUST NOT contain a copy of the state before or after the audited change.

**Rationale:** The domain event stream already holds each change under its own retention. Copying before and after state into the trail duplicates that storage and widens every record with data the reviewer did not ask for. The trail adds the actor and the reason, which nothing else holds, and leaves the change itself to the stream.

### Commit a success record with its business change

**Statement:** An audit record with a `succeeded` outcome MUST commit in the same database transaction as the change it describes.

**Rationale:** One transaction makes the action and its evidence inseparable: the change commits with its record or neither commits. Separate writes admit both an unrecorded action and a record of a rolled-back action. Either one leaves the trail disagreeing with the data it describes.

### Write an unsuccessful record outside the failed transaction

**Statement:** An audit record with a `denied` or `failed` outcome MUST be written on a connection that the failing transaction does not roll back.

**Rationale:** A denied or failed attempt ends with its transaction rolling back, which would take a record written inside it. The record therefore travels on a connection the rollback does not touch. The evidence of a refusal outlives the refusal itself.

### Stage the audit write before the business commit

**Statement:** An audit producer that stages a success record MUST run before the pipeline stage that commits the business transaction.

**Rationale:** A success record staged after the commit reaches a transaction that is already closed, so the write has nowhere to land. The producer therefore runs before the pipeline stage that commits. Pipeline priority states that order explicitly instead of leaving it to registration order.

### Publish unsuccessful write failures

**Statement:** An audit deployment MUST publish the write failure count of its unsuccessful-outcome path.

**Rationale:** The separate connection for unsuccessful records accepts a rare lost record when the process dies between the refusal and the write. Continuous loss is a defect, not bad luck, and only a published count separates the two. The deployment publishes that count so monitoring tells rarity from breakage.

### Scope every record to its tenant

**Statement:** An audit record describing an action inside tenant-owned data MUST carry the identity of that tenant.

**Rationale:** The tenant is the filter for every read of the trail: each customer reads its own records and no one else's. A record without a tenant identity serves an internal reviewer and no customer. Scoping every record at write time keeps that filter exact.

### Enforce append-only through storage privilege

**Statement:** An audit store MUST refuse update and delete through the privileges granted to the writing account.

**Rationale:** An audit store that relies on absent code paths stays append-only until someone writes the missing path. Revoked privileges refuse update and delete no matter what the code attempts. A reviewer verifies a privilege in the database instead of auditing every line for a missing write.

**Example:** The application account holds `INSERT` and `SELECT` on the audit table. It holds neither `UPDATE` nor `DELETE`.

### Provide tamper evidence

**Statement:** An audit store MUST chain each record to its predecessor with a SHA-256 hash over a canonical serialization of both.

**Rationale:** The hash chain detects an edit and a removal, because a changed or missing record breaks every value after it. Detection is the obligation: it lets a reviewer prove the trail is intact. Prevention at a higher cost is not required.

The algorithm is named because two implementations that each choose their own cannot verify each other. A verifier written later cannot recompute a chain whose algorithm no one recorded. Canonical serialization is named for the same reason. A hash over a serialization that reorders fields verifies nothing.

**Example:** The chain value is `SHA-256(previousHash || canonical(record))`, where `canonical` sorts object members and uses one fixed encoding for every timestamp and number.

### Anchor the audit chain outside its own store

**Statement:** An audit store SHOULD publish a periodic checkpoint of its chain head to a destination that the store's own operators cannot rewrite.

**Deviation:** A store whose recorded threat model excludes its own operators publishes no checkpoint.

**Rationale:** A chain proves that records agree with each other, but anyone holding the store can recompute the whole chain and keep it agreeing. A checkpoint held somewhere the operators cannot rewrite fixes the chain as it stood at that moment. A later recomputation disagrees with the checkpoint, which exposes it.

**Example:** The checkpoint is the chain head and its record count, published at a stated interval. A separate append-only destination, a timestamping authority, and a transparency log each qualify.

### Verify the integrity chain on a schedule

**Statement:** An audit deployment MUST verify its integrity chain on a recurring schedule and raise an alert on a break.

**Rationale:** Tamper evidence nobody checks proves nothing: a break sits in the store until someone looks. Scheduled verification turns the chain into a standing claim the deployment re-proves on each run. The alert carries the break to an operator instead of waiting for the next review.

### Add a correcting record

**Statement:** A correction to the trail MUST be a new record that references the earlier one.

**Rationale:** An edited history carries no evidential value, because the reviewer cannot tell a correction from a cover-up. A new record that references the earlier one keeps both visible: the mistake and its fix. The trail then shows its own repairs instead of hiding them.

### Retain each category for its declared period

**Statement:** An audit deployment MUST delete a record after the retention period declared for its category.

**Rationale:** Each category declares its retention in the adoption decision, and the deployment deletes records when that period ends. Deletion on schedule keeps retention defensible: kept data has a declared reason and nothing kept lacks one. An indefinite period is the hardest retention to defend and the easiest to correct at design time.

### Remove the identity mapping on erasure

**Statement:** An erasure request MUST remove the mapping from actor identifier to person and retain every audit record.

**Rationale:** Erasure asks that the person stop being identifiable, while accountability asks that the record stay. Removing the mapping from identifier to person satisfies both: the record keeps its evidential value and no longer points at anyone. This works only because the record holds no other personal data.

### Give the trail a read path

**Statement:** An audited system MUST provide a trail read as a use case needing a Permission record, filtered by tenant, actor, action, target, and outcome.

**Rationale:** A trail no use case reads is storage, not a control. The read path is a use case with its own Permission record: the actor holds a Role at a scope, the Role allows the Permission, and the guard permits the read. Tenant, actor, action, target, and outcome filters keep each reader inside the records they may see.

### Audit reads of the trail

**Statement:** A read of the audit trail MUST itself produce an audit record.

**Rationale:** Reading the evidence is itself a sensitive action: the trail shows who did what across the whole product. A read that writes no record leaves the reviewer outside the trail. Recording each read puts the reviewer inside the same accountability as everyone else.

### Record personal-data reads

**Statement:** A query returning personal data across a boundary MUST produce an audit record, defining the account boundary in the adoption decision where tenancy is absent.

**Rationale:** A read changes no state and therefore leaves no other trace, so a disclosure without a record cannot be investigated. The audit record on a cross-boundary personal-data query states who read whose data and when. Where tenancy is absent, the adoption decision defines the account boundary the rule watches.

### Record a bulk read inside its own boundary

**Statement:** A query returning personal data for more subjects than its declared threshold MUST produce an audit record, inside one tenant or account boundary as well.

**Rationale:** The cross-boundary rule catches a disclosure to the wrong party, but it misses an export of every record a party may read one at a time, which is the shape a copied dataset has. A query above the declared threshold therefore writes a record even inside one boundary. [Article 30 of the GDPR](https://gdpr-info.eu/art-30-gdpr/) asks what categories of data were processed and by whom, and an unrecorded bulk read answers neither.

**Example:** A project records the threshold in the adoption decision. A list endpoint whose page size can exceed it audits the read with the subject count rather than the subjects.

### Record bulk export

**Statement:** An export that returns a set of records to a caller MUST produce an audit record naming the requested scope.

**Rationale:** Bulk extraction is the highest-consequence read in most products: one call moves a dataset across the boundary. Naming the requested scope states what left the system. Without it, the project learns the shape of a leak from the party that received it.

### Reject an undeclared Command

**Statement:** An automated check MUST fail when a Command declares neither audited nor excluded status, with a composition refusal at startup satisfying this rule.

**Rationale:** The next Command is written by someone who did not read this page. Only an automated gate catches it: the build or startup fails while the declaration is missing. A selection that depends on every author remembering is a selection with holes.

## Conventions

### Keep audit infrastructure in one location

**Default:** Keep the audit record, its store, the producer, and the integrity job under `Infrastructure/Auditing/`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The record, the store, the producer, and the integrity job form one evidence mechanism. One Infrastructure location keeps that mechanism reviewable as a whole instead of scattered across the codebase.

### Declare audit selection beside the Command

**Default:** Declare the action, target kind, category, and exclusion reason as an attribute on the Command type.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The declaration stays with the code it describes, so a review reads both at once. A selection kept in a separate file drifts from the Commands it names.

### Use a fixed category vocabulary

**Default:** Classify each audited action as `authentication`, `authorization-denial`, `grant-change`, `monetary-action`, `tenant-configuration`, `personal-data-read`, `bulk-export`, or `background-process-change`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The category drives retention and the review query. A free-text value defeats both, because each writer spells the same category differently.

### Store the trail beside the business data

**Default:** Store audit records in the business database, under a separate account holding `INSERT` and `SELECT` privileges.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** One database provides the atomic success write the transaction rules depend on. A separate account holding only `INSERT` and `SELECT` provides the append-only guarantee.

### Publish a copy to the security platform

**Default:** Publish a copy of each record to an external security platform through the outbox, and keep the local store authoritative.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Delivery is at-least-once, while evidence needs one durable source. The local store stays authoritative for accountability and the published copy serves detection, so a lost copy never corrupts the evidence.

## Dependencies

This extension adds no required package. The `tenancy` extension owns tenant resolution when one deployment serves several customer organizations. The `outbox` extension owns delivery when the project publishes a copy to its security platform.

[Build an audit trail](../guide/audit-trail.md) states one compliant implementation on the command pipeline of the dotnet stack.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/audit#record-the-audit-adoption-decision | guidance | Does the adoption decision record the required fields? Is no record approved behind its draft? |
| litespec/ext/audit#declare-audit-selection-on-every-command | guidance | Does every Command declare audited status or excluded status with a reason? |
| litespec/ext/audit#cover-the-required-audit-categories | guidance | Does the declared selection contain one entry for each required category? |
| litespec/ext/audit#exclude-indiscriminate-auditing | guidance | Does the selection justify each audited category rather than auditing every Command? |
| litespec/ext/audit#emit-audit-records-at-the-mediation-boundary | guidance | Does the producer run in the mediation pipeline rather than inside handlers? |
| litespec/ext/audit#restrict-handler-contribution-to-determined-values | guidance | Does each handler contribute only the audit values it alone determines? |
| litespec/ext/audit#exclude-derived-audit-trails | guidance | Is the trail produced directly rather than derived from events, triggers, or capture? |
| litespec/ext/audit#record-the-required-audit-fields | guidance | Does every record carry each required field, including the tenant value? |
| litespec/ext/audit#state-the-action-as-use-case-identity | guidance | Does each action value name the invoked use case? |
| litespec/ext/audit#record-the-failure-code-on-an-unsuccessful-attempt | guidance | Does each denied or failed record carry its stable failure code? |
| litespec/ext/audit#version-the-audit-record-shape | guidance | Does every record carry an explicit schema version? |
| litespec/ext/audit#use-a-closed-actor-set | guidance | Is every actor one of the five Actor kinds, with devices and processes mapped? |
| litespec/ext/audit#record-delegated-administrative-access | guidance | Does an action under a support grant record that the grant was used? |
| litespec/ext/audit#record-every-attempt-outcome | guidance | Does every record carry one of the three declared outcomes? |
| litespec/ext/audit#record-refused-authorization | guidance | Does a refused authorization produce a denied record? |
| litespec/ext/audit#record-failed-audited-attempts | guidance | Does a permitted attempt that throws produce a failed record? |
| litespec/ext/audit#record-the-request-origin | guidance | Does each request-produced record carry origin, client, and request identifier? |
| litespec/ext/audit#record-the-operation-trace-identity | guidance | Does each record carry the trace identifier of its operation? |
| litespec/ext/audit#exclude-secrets-and-payment-data | guidance | Is every record free of credentials, tokens, session identifiers, keys, and payment values? |
| litespec/ext/audit#exclude-personal-data-beyond-actor-identity | guidance | Does each record hold only pseudonymous actor and target identifiers? |
| litespec/ext/audit#exclude-state-snapshots | guidance | Is every record free of before and after state copies? |
| litespec/ext/audit#commit-a-success-record-with-its-business-change | guidance | Does a succeeded record commit in the same transaction as its change? |
| litespec/ext/audit#write-an-unsuccessful-record-outside-the-failed-transaction | guidance | Does a denied or failed record survive the rollback of its transaction? |
| litespec/ext/audit#stage-the-audit-write-before-the-business-commit | guidance | Does the audit stage run before the business commit stage? |
| litespec/ext/audit#publish-unsuccessful-write-failures | guidance | Does the deployment publish the write failure count of the unsuccessful path? |
| litespec/ext/audit#scope-every-record-to-its-tenant | guidance | Does each record carry the tenant of the acted-on resource? |
| litespec/ext/audit#enforce-append-only-through-storage-privilege | guidance | Does the writing account lack update and delete privileges on the store? |
| litespec/ext/audit#provide-tamper-evidence | guidance | Does each record chain to its predecessor with the stated hash? |
| litespec/ext/audit#anchor-the-audit-chain-outside-its-own-store | guidance | Does a checkpoint the operators cannot rewrite anchor the chain head? |
| litespec/ext/audit#verify-the-integrity-chain-on-a-schedule | guidance | Does a scheduled job verify the chain and alert on a break? |
| litespec/ext/audit#add-a-correcting-record | guidance | Is each correction a new record referencing the earlier one? |
| litespec/ext/audit#retain-each-category-for-its-declared-period | guidance | Are records deleted after the declared retention of their category? |
| litespec/ext/audit#remove-the-identity-mapping-on-erasure | guidance | Does erasure remove the identity mapping while retaining the records? |
| litespec/ext/audit#give-the-trail-a-read-path | guidance | Does a permission-gated read filter the trail by every declared filter? |
| litespec/ext/audit#audit-reads-of-the-trail | guidance | Does a completed trail read produce one audit record? |
| litespec/ext/audit#record-personal-data-reads | guidance | Does a cross-boundary personal-data query produce a record? |
| litespec/ext/audit#record-a-bulk-read-inside-its-own-boundary | guidance | Does a query above the threshold produce a record carrying the subject count? |
| litespec/ext/audit#record-bulk-export | guidance | Does each export produce a record naming the requested scope? |
| litespec/ext/audit#reject-an-undeclared-command | guidance | Does the build or startup fail for a Command with no declaration? |
| litespec/ext/audit#keep-audit-infrastructure-in-one-location | guidance | Does the audit code use the documented path or a recorded Exception? |
| litespec/ext/audit#declare-audit-selection-beside-the-command | guidance | Does each Command carry the declaration attribute or a recorded Exception? |
| litespec/ext/audit#use-a-fixed-category-vocabulary | guidance | Does each category value belong to the eight-value vocabulary? |
| litespec/ext/audit#store-the-trail-beside-the-business-data | guidance | Is the trail in the business database under separated privileges or a recorded Exception? |
| litespec/ext/audit#publish-a-copy-to-the-security-platform | guidance | Does a published copy leave the local store authoritative, or is there a recorded Exception? |
