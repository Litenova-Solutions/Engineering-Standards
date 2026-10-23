# Audit Trail

## Intent

An audit trail proves who attempted what inside data one party owns while another party acts in it, including attempts the system refused. This page states what the trail stores for each attempt, which attempts it covers, where the producer runs, how the store resists tampering, and how a reviewer reads the trail. A team whose system acts in another party's data selects this extension and keeps one trail that proves accountability instead of reconstructing the answer from logs and domain events (facts the system recorded as completed).

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `audit` when a person or a machine acts inside data that another party owns and a later reviewer has to establish who is accountable. A regulatory obligation, a customer contract, payment scope, and platform-side support access each meet this condition.

[Audit obligations](../reference/audit-obligations.md) maps each provision on this page to the external obligation it satisfies.

## Baseline Relationship

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

### Record the Audit Adoption Decision

**Statement:** An audit adoption decision MUST record its `owner`, `status`, `decider`, `decideBy`, audited categories, threshold, access model, integrity method, and records entry.

**Rationale:** Which actions to audit, how long to keep them, and how to protect them are policy choices, so the project declares them once in the adoption decision. A reviewer reads the declared policy before reading the implementation, and no record is approved while the decision is still draft. Without that order, each reviewer reconstructs the policy from the code and two reviewers reconstruct different policies.

### Declare Audit Selection on Every Command

**Statement:** Every command use case MUST declare its audit position in its `audit` field, or declare an exemption with its justification.

**Rationale:** An audit selection that lives only in code is invisible: a reader cannot tell an unaudited command from an audited one whose call is missing. The `audit` field states the reason of `required`, `optional`, or `none` with its target, or the exemption with its justification, so each omission becomes a visible statement. Commands are audited by default with reason `none`. `litespec/core/behavior#state-the-audit-position-of-every-command` states the field, and review reads the selection instead of hunting for missing calls.

**Example:** A storefront browse command declares an exemption because a public catalog read is not a sensitive action.

### Audit Async Work at Request Time

**Statement:** Work that runs after its request MUST write its audit record at request time.

**Rationale:** The actor, the origin, and the grant exist when the request arrives; the later run carries worker identity under system auth, which says nothing about who asked. Writing the record at request time ties the attempt to the caller who made it. A record written when the background run starts would attribute every scheduled and deferred act to the worker instead of the requester.

### Cover the Required Audit Categories

**Statement:** An audit selection MUST include authentication, authorization denial, grant change, monetary action, tenant configuration, personal-data read, bulk export, and background-process change.

**Rationale:** Each listed category answers a question a security review, a customer, or a supervisory authority asks after an incident: who signed in, who was refused, who changed a grant, who moved money, and the rest. A trail that omits a category has no answer when that question arrives. The list fixes the floor so no project discovers the gap during its first review.

### Exclude Indiscriminate Auditing

**Statement:** A project MUST NOT audit every Command without a recorded selection.

**Rationale:** A trail that records every Command buries the sensitive action inside routine traffic, and the reviewer who has to read it stops reading. Volume then defeats the review the trail exists to support. A recorded selection keeps the trail small enough to read.

### Emit Audit Records at the Mediation Boundary

**Statement:** An audit producer MUST run in the mediation pipeline stages that dispatch the Command.

**Rationale:** Only the pipeline stages that dispatch the Command observe the whole attempt, including attempts the handler never reaches. An audit call inside the handler misses every attempt that throws before it and every refusal the pipeline makes. The pipeline is therefore the one place that records all three outcomes.

**Example:** A pre-handler opens the audit scope, a post-handler closes it as `succeeded`, and an error handler closes it as `denied` or `failed`.

### Restrict Handler Contribution to Determined Values

**Statement:** A handler MUST contribute only the audit values that the handler alone determines.

**Rationale:** The declaration, the actor, and the request context already fix most fields before the handler runs. Only the handler knows the values it alone determines, such as a generated target identity or a composed reason. Letting the handler write the rest invites a second copy of each field that drifts from the first.

**Example:** A create handler contributes the identity it generated. It contributes no actor, action code, or timestamp.

### Exclude Derived Audit Trails

**Statement:** An audit trail MUST NOT be derived from domain events, database triggers, or change data capture.

**Rationale:** Domain events, triggers, and change data capture describe committed state change. They carry no refused attempt, no use-case identity, and no request origin, which are the fields a reviewer reads. A trail derived from them answers what changed and never who attempted it.

### Record the Required Audit Fields

**Statement:** An audit record MUST contain actor, action, target, outcome, business time, record time, and tenant, fixed where the tenancy extension is absent.

**Rationale:** Actor, action, target, outcome, the two times, and the tenant together answer who attempted what, against whose data, with what result, and when. Business time states when the action happened and record time states when the evidence was written, so a delayed write stays visible as a delay. A record missing any of them leaves the accountability question half answered.

### State the Action as Use-Case Identity

**Statement:** An audit `action` MUST use the identity of the use case that the actor invoked.

**Rationale:** A reviewer who reads an action value opens the specification of that use case to learn the intended behavior. A separate action vocabulary needs a mapping to those specifications, and the mapping drifts as both sides change. Reusing the use-case identity keeps record and specification joined with no mapping to maintain.

**Example:** `catalog.add-product` names both the use case and the audited action.

### Record the Refusal Code on an Unsuccessful Attempt

**Statement:** An audit record with a `denied` or `failed` outcome MUST carry the refusal `code` that the attempt produced.

**Rationale:** A refused permission and an exhausted precondition need different responses, but both look like failure without a code. The refusal `code` tells the reviewer which one the attempt produced. It also lets trend queries count one kind of refusal across the whole trail.

### Version the Audit Record Shape

**Statement:** An audit record MUST carry an explicit schema version.

**Rationale:** A retained record outlives several shapes of the application that wrote it. An explicit version lets a later reader parse each record in the shape it was written in. Without it, every shape change forces a rewrite of retained evidence.

### Use a Closed Actor Set

**Statement:** An audit actor MUST be one of `person`, `company`, `provider`, `system`, or `guest`.

**Rationale:** An absent actor collapses three answers into one: a scheduled process acted, a device acted, or no one recorded the actor, and only the third is a defect. The five kinds separate them: a device maps to the person whose account authorized it, with the device as the client description, and a named process maps to `system`. A free-text actor would let each writer spell the same actor differently and break every actor filter.

**Example:** A warehouse handheld records the person actor whose account authorized it. The origin record names the device.

### Record Delegated Administrative Access

**Statement:** An action that an actor takes under an administrative or support grant MUST record that the grant was used.

**Rationale:** Support staff act inside customer data under a grant, and without a marker their actions read exactly like customer actions. The marker makes a no-silent-access commitment demonstrable: every supplier-side action says so on its own record. A reviewer who cannot separate the two cannot verify the commitment.

### Record Every Attempt Outcome

**Statement:** An audit record MUST carry an outcome of `succeeded`, `denied`, or `failed`.

**Rationale:** A trail of successes is a change history, not evidence. The refused attempt carries the security signal, and the failed attempt carries the operating signal. Three outcomes keep both signals in the same trail as the successes they qualify.

**Example:** `succeeded` names a committed change, `denied` names a refused authorization, and `failed` names a permitted attempt that did not complete.

### Record Refused Authorization

**Statement:** An authorization decision that refuses an audited action MUST produce an audit record.

**Rationale:** Repeated refusal is the first indicator of a compromised or probing account, and no other record holds it: nothing changed, so nothing else was written. Each refusal therefore writes its own record. A trail without refusals shows an attacker who never failed.

### Record Failed Audited Attempts

**Statement:** An audited action that the actor was permitted to take and that did not complete MUST produce an audit record.

**Rationale:** A permitted attempt that throws is neither a success nor a refusal, and without a record it vanishes entirely. Writing it separates an operating defect from an access problem: failures cluster around broken behavior, denials cluster around missing permission. Support reads that split before it reads the logs.

### Record the Request Origin

**Statement:** An audit record produced from an inbound request MUST carry the request origin address, the client description, and the request identifier.

**Rationale:** Two records naming one account state nothing about location. The same account acting from two countries within one minute states that the account is compromised, but only when each record carries origin, client, and request identifier. The request identifier further joins the record to the exact request in the diagnostic log.

### Record the Operation Trace Identity

**Statement:** An audit record MUST carry the trace identifier of the operation that produced it.

**Rationale:** The audit record states what was attempted, and the diagnostic log states what the software did while attempting it. The trace identifier joins the two, so an investigation moves from evidence to detail in one step. Without it, the investigation stops at the audit record and reconstructs the rest by time.

### Exclude Secrets and Payment Data

**Statement:** An audit record MUST NOT contain a credential, token, session identifier, encryption key, or payment instrument value.

**Rationale:** The trail is retained, widely readable, and append-only, which is the worst combination for a secret: retention extends the exposure and append-only removes the repair. A credential or payment value written once stays readable for the whole retention period. Secrets and payment values therefore travel in the systems built to hold them, never in the trail.

### Exclude Personal Data Beyond Actor Identity

**Statement:** An audit record MUST NOT contain personal data other than the pseudonymous identifier of the actor and the target.

**Rationale:** A record holding a name, an address, or a message body turns retention into an erasure conflict: the law asks for deletion and the trail asks for keeping. Pseudonymous identifiers keep the record meaningful while the mapping lives, and erasable once the mapping goes. The record then survives erasure instead of fighting it.

A pseudonymous identifier is still personal data where the party holding it can reverse it. That is the position [the EDPB states](https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-012020-processing-personal-data-context-art-6-1). The identifier is therefore safe inside the tenant that owns the mapping. It is a disclosure when it leaves that tenant.

**Example:** An audit export crossing a tenant boundary replaces each identifier with one derived for that export. The receiving party then cannot join the records back to a subject.

### Exclude State Snapshots

**Statement:** An audit record MUST NOT contain a copy of the state before or after the audited change.

**Rationale:** The domain event stream already holds each change under its own retention. Copying before and after state into the trail duplicates that storage and widens every record with data the reviewer did not ask for. The trail adds the actor and the reason, which nothing else holds, and leaves the change itself to the stream.

### Commit a Success Record with Its Business Change

**Statement:** An audit record with a `succeeded` outcome MUST commit in the same database transaction as the change it describes.

**Rationale:** One transaction makes the action and its evidence inseparable: the change commits with its record or neither commits. Separate writes admit both an unrecorded action and a record of a rolled-back action. Either one leaves the trail disagreeing with the data it describes.

### Write an Unsuccessful Record Outside the Failed Transaction

**Statement:** An audit record with a `denied` or `failed` outcome MUST be written on a connection that the failing transaction does not roll back.

**Rationale:** A denied or failed attempt ends with its transaction rolling back, which would take a record written inside it. The record therefore travels on a connection the rollback does not touch. The evidence of a refusal outlives the refusal itself.

### Stage the Audit Write Before the Business Commit

**Statement:** An audit producer that stages a success record MUST run before the pipeline stage that commits the business transaction.

**Rationale:** A success record staged after the commit reaches a transaction that is already closed, so the write has nowhere to land. The producer therefore runs before the pipeline stage that commits. Pipeline priority states that order explicitly instead of leaving it to registration order.

### Publish Unsuccessful Write Failures

**Statement:** An audit deployment MUST publish the write failure count of its unsuccessful-outcome path.

**Rationale:** The separate connection for unsuccessful records accepts a rare lost record when the process dies between the refusal and the write. Continuous loss is a defect, not bad luck, and only a published count separates the two. The deployment publishes that count so monitoring tells rarity from breakage.

### Scope Every Record to Its Tenant

**Statement:** An audit record describing an action inside tenant-owned data MUST carry the identity of that tenant.

**Rationale:** The tenant is the filter for every read of the trail: each customer reads its own records and no one else's. A record without a tenant identity serves an internal reviewer and no customer. Scoping every record at write time keeps that filter exact.

### Enforce Append-Only Through Storage Privilege

**Statement:** An audit store MUST refuse update and delete through the privileges granted to the writing account.

**Rationale:** An audit store that relies on absent code paths stays append-only until someone writes the missing path. Revoked privileges refuse update and delete no matter what the code attempts. A reviewer verifies a privilege in the database instead of auditing every line for a missing write.

**Example:** The application account holds `INSERT` and `SELECT` on the audit table. It holds neither `UPDATE` nor `DELETE`.

### Provide Tamper Evidence

**Statement:** An audit store MUST chain each record to its predecessor with a SHA-256 hash over a canonical serialization of both.

**Rationale:** The hash chain detects an edit and a removal, because a changed or missing record breaks every value after it. Detection is the obligation: it lets a reviewer prove the trail is intact. Prevention at a higher cost is not required.

The algorithm is named because two implementations that each choose their own cannot verify each other. A verifier written later cannot recompute a chain whose algorithm no one recorded. Canonical serialization is named for the same reason. A hash over a serialization that reorders fields verifies nothing.

**Example:** The chain value is `SHA-256(previousHash || canonical(record))`, where `canonical` sorts object members and uses one fixed encoding for every timestamp and number.

### Anchor the Audit Chain Outside Its Own Store

**Statement:** An audit store SHOULD publish a periodic checkpoint of its chain head to a destination that the store's own operators cannot rewrite.

**Deviation:** A store whose recorded threat model excludes its own operators publishes no checkpoint.

**Rationale:** A chain proves that records agree with each other, but anyone holding the store can recompute the whole chain and keep it agreeing. A checkpoint held somewhere the operators cannot rewrite fixes the chain as it stood at that moment. A later recomputation disagrees with the checkpoint, which exposes it.

**Example:** The checkpoint is the chain head and its record count, published at a stated interval. A separate append-only destination, a timestamping authority, and a transparency log each qualify.

### Verify the Integrity Chain on a Schedule

**Statement:** An audit deployment MUST verify its integrity chain on a recurring schedule and raise an alert on a break.

**Rationale:** Tamper evidence nobody checks proves nothing: a break sits in the store until someone looks. Scheduled verification turns the chain into a standing claim the deployment re-proves on each run. The alert carries the break to an operator instead of waiting for the next review.

### Add a Correcting Record

**Statement:** A correction to the trail MUST be a new record that references the earlier one.

**Rationale:** An edited history carries no evidential value, because the reviewer cannot tell a correction from a cover-up. A new record that references the earlier one keeps both visible: the mistake and its fix. The trail then shows its own repairs instead of hiding them.

### Retain Each Category for Its Declared Period

**Statement:** An audit deployment MUST delete a record after the retention period declared for its category.

**Rationale:** Each category declares its retention in the adoption decision, and the deployment deletes records when that period ends. Deletion on schedule keeps retention defensible: kept data has a declared reason and nothing kept lacks one. An indefinite period is the hardest retention to defend and the easiest to correct at design time.

### Remove the Identity Mapping on Erasure

**Statement:** An erasure request MUST remove the mapping from actor identifier to person and retain every audit record.

**Rationale:** Erasure asks that the person stop being identifiable, while accountability asks that the record stay. Removing the mapping from identifier to person satisfies both: the record keeps its evidential value and no longer points at anyone. This works only because the record holds no other personal data.

### Give the Trail a Read Path

**Statement:** An audited system MUST provide a trail read as a use case with its access grant, filtered by tenant, actor, action, target, and outcome.

**Rationale:** A trail no use case reads is storage, not a control. The read path is a use case with its own access grant: the actor holds a role at a scope, the role allows the permission, and the grant permits the read. Tenant, actor, action, target, and outcome filters keep each reader inside the records they may see.

### Audit Reads of the Trail

**Statement:** A read of the audit trail MUST itself produce an audit record.

**Rationale:** Reading the evidence is itself a sensitive action: the trail shows who did what across the whole product. A read that writes no record leaves the reviewer outside the trail. Recording each read puts the reviewer inside the same accountability as everyone else.

### Record Personal-Data Reads

**Statement:** A query returning personal data across a boundary MUST produce an audit record, defining the account boundary in the adoption decision where tenancy is absent.

**Rationale:** A read changes no state and therefore leaves no other trace, so a disclosure without a record cannot be investigated. The audit record on a cross-boundary personal-data query states who read whose data and when. Where tenancy is absent, the adoption decision defines the account boundary the rule watches.

### Record a Bulk Read Inside Its Own Boundary

**Statement:** A query returning personal data for more subjects than its declared threshold MUST produce an audit record, inside one tenant or account boundary as well.

**Rationale:** The cross-boundary rule catches a disclosure to the wrong party, but it misses an export of every record a party may read one at a time, which is the shape a copied dataset has. A query above the declared threshold therefore writes a record even inside one boundary. [Article 30 of the GDPR](https://gdpr-info.eu/art-30-gdpr/) asks what categories of data were processed and by whom, and an unrecorded bulk read answers neither.

**Example:** A project records the threshold in the adoption decision. A list endpoint whose page size can exceed it audits the read with the subject count rather than the subjects.

### Record Bulk Export

**Statement:** An export that returns a set of records to a caller MUST produce an audit record naming the requested scope.

**Rationale:** Bulk extraction is the highest-consequence read in most products: one call moves a dataset across the boundary. Naming the requested scope states what left the system. Without it, the project learns the shape of a leak from the party that received it.

### Reject an Undeclared Command

**Statement:** An automated check MUST fail when a Command declares neither an audit position nor an exemption, with a composition refusal at startup satisfying this rule.

**Rationale:** The next Command is written by someone who did not read this page. Only an automated gate catches it: the build or startup fails while the declaration is missing. A selection that depends on every author remembering is a selection with holes.

## Conventions

### Keep Audit Infrastructure in One Location

**Default:** Keep the audit record, its store, the producer, and the integrity job under `Infrastructure/Auditing/`.

**Replacement:** A consumer records an audit-layout convention naming where its audit parts live.

**Rationale:** The record, the store, the producer, and the integrity job form one evidence mechanism. One Infrastructure location keeps that mechanism reviewable as a whole instead of scattered across the codebase.

### Declare Audit Selection Beside the Command

**Default:** Declare the action, target kind, and category as an attribute on the Command type, beside the use-case `audit` field.

**Replacement:** A consumer records a selection-declaration convention naming where each Command declares its audit selection.

**Rationale:** The declaration stays with the code it describes, so a review reads both at once. The use-case page carries the audit position or exemption, and the attribute carries the action, target kind, and category the producer writes. A selection kept in a separate file drifts from the Commands it names.

### Use a Fixed Category Vocabulary

**Default:** Classify each audited action as `authentication`, `authorization-denial`, `grant-change`, `monetary-action`, `tenant-configuration`, `personal-data-read`, `bulk-export`, or `background-process-change`.

**Replacement:** A consumer records a category convention naming the audit categories it uses.

**Rationale:** The category drives retention and the review query. A free-text value defeats both, because each writer spells the same category differently.

### Store the Trail Beside the Business Data

**Default:** Store audit records in the business database, under a separate account holding `INSERT` and `SELECT` privileges.

**Replacement:** A consumer records a trail-store convention naming where its audit records live.

**Rationale:** One database provides the atomic success write the transaction rules depend on. A separate account holding only `INSERT` and `SELECT` provides the append-only guarantee.

### Publish a Copy to the Security Platform

**Default:** Publish a copy of each record to an external security platform through the outbox, and keep the local store authoritative.

**Replacement:** A consumer records a copy-delivery convention naming how audit copies leave the local store.

**Rationale:** Delivery is at-least-once, while evidence needs one durable source. The local store stays authoritative for accountability and the published copy serves detection, so a lost copy never corrupts the evidence.

## Dependencies

Packages: None.

Related extensions: `tenancy` for tenant resolution, `outbox` for copy delivery.

Guides: [Build an audit trail](../guide/audit-trail.md).

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/audit#record-the-audit-adoption-decision | guidance | Which adoption decisions lack owner, status, decider, decideBy, categories, threshold, access model, integrity method, or records entry? Look at the adoption decision behind the audited Commands. |
| litespec/ext/audit#declare-audit-selection-on-every-command | guidance | Which command use cases lack an audit position or an exemption with its justification in their `audit` field? Look at the use case pages. |
| litespec/ext/audit#audit-async-work-at-request-time | guidance | Which deferred runs write their audit record at run time instead of request time? Look at the audit rows beside the requesting calls. |
| litespec/ext/audit#cover-the-required-audit-categories | guidance | Which required categories have no selection entry? Look at the declared selection beside the eight listed categories. |
| litespec/ext/audit#exclude-indiscriminate-auditing | guidance | Which audited categories lack a recorded selection reason? Look at the declared selection. |
| litespec/ext/audit#emit-audit-records-at-the-mediation-boundary | guidance | Which audit writes run inside handlers instead of the mediation pipeline? Look at the producer stages and the handler code. |
| litespec/ext/audit#restrict-handler-contribution-to-determined-values | guidance | Which handler contributions repeat actor, action code, or timestamp? Look at the handler audit calls. |
| litespec/ext/audit#exclude-derived-audit-trails | guidance | Which trail writes derive from events, triggers, or capture? Look at the producer source. |
| litespec/ext/audit#record-the-required-audit-fields | guidance | Which records lack actor, action, target, outcome, business time, record time, or tenant? Look at the stored audit rows. |
| litespec/ext/audit#state-the-action-as-use-case-identity | guidance | Which action values name something other than the invoked use case? Look at the action column beside the use case pages. |
| litespec/ext/audit#record-the-refusal-code-on-an-unsuccessful-attempt | guidance | Which denied or failed records lack the refusal code? Look at the unsuccessful audit rows. |
| litespec/ext/audit#version-the-audit-record-shape | guidance | Which records lack an explicit schema version? Look at the stored audit rows. |
| litespec/ext/audit#use-a-closed-actor-set | guidance | Which actor values fall outside the five actor kinds? Look at the actor column, with devices and processes mapped. |
| litespec/ext/audit#record-delegated-administrative-access | guidance | Which support-grant actions lack the grant marker? Look at the records of actions under administrative grants. |
| litespec/ext/audit#record-every-attempt-outcome | guidance | Which records lack a succeeded, denied, or failed outcome? Look at the outcome column. |
| litespec/ext/audit#record-refused-authorization | guidance | Which refused authorizations produced no denied record? Look at the refusal paths beside the trail. |
| litespec/ext/audit#record-failed-audited-attempts | guidance | Which permitted attempts that threw produced no failed record? Look at the error paths beside the trail. |
| litespec/ext/audit#record-the-request-origin | guidance | Which request-produced records lack origin, client, or request identifier? Look at the inbound-request audit rows. |
| litespec/ext/audit#record-the-operation-trace-identity | guidance | Which records lack the trace identifier of their operation? Look at the stored audit rows. |
| litespec/ext/audit#exclude-secrets-and-payment-data | guidance | Which records contain a credential, token, session identifier, key, or payment value? Look at the stored audit rows. |
| litespec/ext/audit#exclude-personal-data-beyond-actor-identity | guidance | Which records contain personal data beyond pseudonymous actor and target identifiers? Look at the stored audit rows. |
| litespec/ext/audit#exclude-state-snapshots | guidance | Which records contain before or after state copies? Look at the stored audit rows. |
| litespec/ext/audit#commit-a-success-record-with-its-business-change | guidance | Which succeeded records commit outside their business transaction? Look at the success write path. |
| litespec/ext/audit#write-an-unsuccessful-record-outside-the-failed-transaction | guidance | Which denied or failed records roll back with their transaction? Look at the unsuccessful write path. |
| litespec/ext/audit#stage-the-audit-write-before-the-business-commit | guidance | Which audit stages run after the business commit stage? Look at the pipeline stage order. |
| litespec/ext/audit#publish-unsuccessful-write-failures | guidance | Which deployments publish no write failure count for the unsuccessful path? Look at the published metrics. |
| litespec/ext/audit#scope-every-record-to-its-tenant | guidance | Which records on tenant-owned data lack the tenant identity? Look at the tenant column. |
| litespec/ext/audit#enforce-append-only-through-storage-privilege | guidance | Which writing accounts hold update or delete on the audit store? Look at the granted store privileges. |
| litespec/ext/audit#provide-tamper-evidence | guidance | Which records lack the chained SHA-256 hash over the canonical serialization? Look at the stored chain values. |
| litespec/ext/audit#anchor-the-audit-chain-outside-its-own-store | guidance | Which stores publish no checkpoint outside operator reach? Look at the checkpoint destination and the threat model. |
| litespec/ext/audit#verify-the-integrity-chain-on-a-schedule | guidance | Which deployments run no scheduled chain verification with an alert? Look at the integrity job and its alerts. |
| litespec/ext/audit#add-a-correcting-record | guidance | Which corrections edit history instead of adding a referencing record? Look at the correction records. |
| litespec/ext/audit#retain-each-category-for-its-declared-period | guidance | Which records outlive the declared retention of their category? Look at the stored rows beside the adoption decision. |
| litespec/ext/audit#remove-the-identity-mapping-on-erasure | guidance | Which erasures leave the actor mapping or delete audit records? Look at the erasure handling and the retained rows. |
| litespec/ext/audit#give-the-trail-a-read-path | guidance | Which trail reads lack an access grant or a declared filter? Look at the trail read use case. |
| litespec/ext/audit#audit-reads-of-the-trail | guidance | Which completed trail reads produced no audit record? Look at the trail read path. |
| litespec/ext/audit#record-personal-data-reads | guidance | Which cross-boundary personal-data queries produced no record? Look at the query paths beside the trail. |
| litespec/ext/audit#record-a-bulk-read-inside-its-own-boundary | guidance | Which above-threshold queries produced no record with the subject count? Look at the bulk query paths. |
| litespec/ext/audit#record-bulk-export | guidance | Which exports produced no record naming the requested scope? Look at the export paths. |
| litespec/ext/audit#reject-an-undeclared-command | guidance | Which Commands build or start with no audit position or exemption? Look at the build or startup gate. |
| litespec/ext/audit#keep-audit-infrastructure-in-one-location | guidance | Which audit parts live outside the documented location or the recorded local convention? Look under `Infrastructure/Auditing/`. |
| litespec/ext/audit#declare-audit-selection-beside-the-command | guidance | Which Commands lack the declaration attribute or the recorded local convention? Look at the Command types. |
| litespec/ext/audit#use-a-fixed-category-vocabulary | guidance | Which category values fall outside the eight-value vocabulary or the recorded local convention? Look at the declared selection. |
| litespec/ext/audit#store-the-trail-beside-the-business-data | guidance | Which trails live outside the business database or the recorded local convention? Look at the audit store and its privileges. |
| litespec/ext/audit#publish-a-copy-to-the-security-platform | guidance | Which published copies leave the local store non-authoritative, or bypass the recorded local convention? Look at the delivery path. |
