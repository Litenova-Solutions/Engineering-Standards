# API Compatibility

## Intent

API compatibility keeps consumers that release on their own schedule working when the API or its published events change, including public, partner, and mobile clients. This page states how a project classifies each contract and event change, versions breaking ones, keeps supported versions alive, and retires them with notice. A team with such consumers applies it, so its consumers keep working across releases instead of breaking on deploy day.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `compat` for public APIs, partner clients, mobile clients, independently deployed consumers, or consumers of its published events. APIs whose consumers always release together with them stay under `litespec/backend/api#treat-openapi-as-a-generated-contract`. A project whose first deployment holds no customer data yet defers these rules through the stage extension.

## Baseline Relationship

This extension replaces no baseline provision.

The core `event` stays inside the product; this extension owns each event consumed outside it, as the [domain page](../core/behavior.md) states.

This extension switches on no optional record type.

## Standards

### Classify Independent-Consumer Changes

**Statement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Every contract change reaches consumers the project does not deploy. Classifying each one decides whether consumers need a new version, a review, or nothing at all. An unclassified change ships the decision to consumers as a surprise.

### Classify Breaking Contract Changes

**Statement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** A consumer can depend on any element of the contract: a field it reads, a status it branches on, an authentication scheme it implements. Removing, renaming, narrowing, or retyping any of them breaks the consumer that depended on it. Calling each such change breaking routes it to versioning instead of silent release.

### Classify Compatible Additions

**Statement:** An API change reviewer MUST classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** An optional field, endpoint, or query parameter asks nothing of existing callers: they send and interpret the same values as before. Classifying these as compatible keeps routine growth cheap. Treating them as breaking would version the API for changes nobody has to adopt.

### Review Exhaustive Consumer Changes

**Statement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated clients often switch exhaustively over enum values and discriminator cases. A new value that the server now sends reaches a client with no branch for it, which rejects a valid response. Consumer review checks that each client handles the new case before it ships.

### Preserve Stable Error Codes

**Statement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** Consumers branch on stable Problem Details codes the way they branch on statuses. Removing or reassigning a code breaks that branch while the status stays green. Treating the code as breaking keeps error handling stable across versions.

### Resolve Uncertain Classifications Safely

**Statement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A structural diff cannot prove every change compatible: some changes need a person to judge their effect on consumers. Classifying the unclear ones as breaking routes them to consumer review instead of release. The cost of a needless review is smaller than the cost of a broken consumer.

### Retain Release Baselines

**Statement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** Each release stores its OpenAPI document as an immutable baseline. Later changes diff against it instead of against memory or a mutable file. Without a retained baseline, the project cannot prove what changed between two releases.

### Diff Release Contracts

**Statement:** The project MUST compare the current OpenAPI document with the selected supported baseline, both locally and in continuous integration.

**Rationale:** The diff against the supported baseline runs both locally and in continuous integration. The local run catches a breaking change while it is cheap to rework. The CI run catches it when the local run was skipped.

### Reject Unapproved Breaking Diffs

**Statement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** A breaking diff that fails CI stops until a new API version or an approved consumer decision authorizes it. The failure forces the compatibility decision before release, while versioning is still possible. A warning nobody has to answer authorizes nothing.

### Assign Operation IDs

**Statement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`, except an endpoint whose shape a specification outside the project fixes.

**Rationale:** Generated clients turn each `operationId` into a method name, and tools use it to reference the operation. A deliberate identifier keeps those names stable and meaningful. An endpoint whose shape an outside specification fixes is exempt, because the project does not own that contract.

**Example:** An OAuth redirect endpoint, an OIDC discovery document, a provider webhook receiver, and a well-known resource each carry a shape the other party defines.

### Retain Compatible Operation IDs

**Statement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A compatible change promises existing consumers keep working. Renaming the `operationId` breaks that promise for every generated client and every stored operation reference. The identifier stays until a new version takes over.

### Assign Versioned Operation IDs

**Statement:** A new API version MUST assign a new operation ID when its operation contract changes.

**Rationale:** The new version needs its own contract names so the retained version keeps its own. A new `operationId` for each changed operation separates the two. Sharing one identifier across versions would let the new contract rename the old one.

### Version Breaking Contracts

**Statement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** Breaking changes need a boundary: a new route or a documented media-type version. Both contracts then serve at once, and each consumer moves on its own schedule. Without the boundary, one contract serves two incompatible expectations.

### Retain Supported Versions

**Statement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** A consumer the project does not deploy moves on its own release cadence. The declared support window states how long the previous version stays available for that move. Removing it early strands consumers that kept to the published plan.

### Record Version Retirement

**Statement:** A versioning decision MUST name the owner of each affected consumer, the deadline, and the removal condition, with the decision approved before any removal.

**Rationale:** A removal touches consumers the project does not control, so the decision names each affected consumer's owner, the deadline, and the removal condition. Approval happens before any removal, while the plan can still change. An unrecorded retirement removes first and notifies whoever complains.

### Signal Planned Public Removal

**Statement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** Consumers discover a planned removal only when the API tells them. A documented deprecation signal, such as `Deprecation` and `Sunset` headers, announces the removal on the operation itself. A removal with no signal arrives as an outage to every consumer that missed the release notes.

### Publish Deprecation Context

**Statement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** Headers announce the removal on the operation, but consumers plan from release notes. The consumer `CHANGELOG.md` names each operation scheduled for removal in the one place consumers already read. A deprecation missing from the changelog reaches only the consumers that inspect headers.

### Record Deprecation Conditions

**Statement:** A deprecation decision MUST record the sunset date and replacement operation, with nothing removed while the decision is draft.

**Rationale:** A deprecation decision records the sunset date and the replacement operation, so each consumer knows when to move and where to go. Nothing is removed while the decision is still draft. A removal without a recorded replacement strands the consumer that depended on the old operation.

### Treat Errors as Contracts

**Statement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Error handling is consumer code: it branches on Problem Details type, code, field-error codes, and documented statuses. Versioning those elements with the contract keeps error handling working across releases. An error shape that changes outside versioning breaks the consumer's failure path, which is the path least tested.

### Gate New Error Outcomes

**Statement:** An API owner MUST add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** A new error outcome reaches consumers written before it existed. Adding it only when existing consumers handle an unknown code safely keeps old clients working against the new contract. An outcome old clients cannot parse turns their error path into a crash.

### Exercise Generated Consumers

**Statement:** An API owner MUST test each first-party generated client against the changed OpenAPI document, with each client compiling and exercising its changed operations.

**Rationale:** A structural diff compares documents; it never compiles a client. Testing each first-party generated client against the changed document compiles it and exercises its changed operations. The client's compiler and its exhaustive switches catch the breaks the diff cannot see.

### Declare Published Events

**Statement:** An event consumed outside the product MUST be declared as a published event with a versioned schema.

**Rationale:** A consumer outside the product reads the event without reading the product's code, so the declaration states what the consumer may rely on: the published name, the versioned schema, and the owning team. An undeclared event reaches outside consumers as an implementation detail that changes without notice.

### Classify Published Event Changes

**Statement:** An API change reviewer MUST classify each published-event change as breaking, compatible, or needing consumer review under `litespec/ext/compat#classify-breaking-contract-changes`, `litespec/ext/compat#classify-compatible-additions`, and `litespec/ext/compat#review-exhaustive-consumer-changes`.

**Rationale:** A published event is a contract with consumers the project does not deploy, so its changes need the same verdicts as HTTP contract changes. Reusing the contract classification keeps one meaning of breaking, compatible, and needs-review across both surfaces. A separate event verdict would let one change read as compatible for events and breaking for HTTP.

### Version Breaking Published Events

**Statement:** An API owner MUST carry a breaking published-event change in a new event version beside the retained version.

**Rationale:** Outside consumers move on their own release cadence, so the breaking change ships beside the retained version instead of replacing it. Each consumer moves to the new version on its own schedule. Without the retained version, one event serves two incompatible expectations.

### Retire Published Events with Notice

**Statement:** An API owner MUST retire a published event version only after its declared support window with a deprecation notice to its consumers.

**Rationale:** A retired version strands every consumer still reading it, so the declared support window states how long the version stays available and the notice tells consumers when to move. Retiring early or silently turns a planned removal into an outage for the consumers that kept to the published plan.

## Conventions

### Store Current OpenAPI Source

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer records a contract-source convention naming where its current OpenAPI artifact lives.

**Rationale:** Source generation and contract review both need the current OpenAPI artifact. One predictable path keeps generation, review, and the diff reading the same file. A second copy drifts from the first.

### Keep Baseline References Immutable

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer records a baseline convention naming where its immutable baselines live.

**Rationale:** A diff proves nothing when its comparison target can move. Baselines beside their contract owner or under an immutable release reference stay fixed. A mutable baseline lets a breaking change hide by moving the target.

### Use One Diff Tool

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer records a diff-tool convention naming the OpenAPI diff tool its local run and continuous integration share.

**Rationale:** The local run and CI have to agree on what breaking means. One diff tool in both places gives one classification for each change. Two tools disagree on edge cases and teach developers to distrust the check.

### Keep Problem Details Codes Stable

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer records an error-code convention naming how its Problem Details codes evolve.

**Rationale:** Consumer error handling branches on these codes for years. Keeping them stable across compatible versions lets that handling survive routine releases. A renamed code forces every consumer to update its failure path for no behavior gain.

## Dependencies

Packages: None. A project that introduces an OpenAPI diff tool pins its version in the manifest.

Related extensions: `stage` for deferring these rules before first customer data.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/compat#classify-independent-consumer-changes | guidance | Which independent-consumer contract changes lack a classification? Look at the change reviews. |
| litespec/ext/compat#classify-breaking-contract-changes | guidance | Which removed, renamed, narrowed, retyped, or authentication changes lack a breaking verdict? Look at the change reviews. |
| litespec/ext/compat#classify-compatible-additions | guidance | Which optional additions lack a record of why existing behavior stays? Look at the change reviews. |
| litespec/ext/compat#review-exhaustive-consumer-changes | guidance | Which added enum values or discriminator cases shipped without consumer review? Look at the consumer reviews. |
| litespec/ext/compat#preserve-stable-error-codes | guidance | Which removed or reassigned stable codes lack a breaking verdict? Look at the change reviews. |
| litespec/ext/compat#resolve-uncertain-classifications-safely | guidance | Which unclear changes shipped as compatible without consumer review? Look at the change reviews. |
| litespec/ext/compat#retain-release-baselines | guidance | Which releases lack a retained OpenAPI baseline? Look at the release artifacts. |
| litespec/ext/compat#diff-release-contracts | guidance | Which changes skipped the local or continuous integration diff against the baseline? Look at the local runs and the CI runs. |
| litespec/ext/compat#reject-unapproved-breaking-diffs | guidance | Which breaking diffs passed without a new version or an approved decision? Look at the CI runs. |
| litespec/ext/compat#assign-operation-ids | guidance | Which independent-consumer operations lack a deliberate operationId? Look at the OpenAPI document. |
| litespec/ext/compat#retain-compatible-operation-ids | guidance | Which compatible changes renamed the operationId? Look at the OpenAPI diff. |
| litespec/ext/compat#assign-versioned-operation-ids | guidance | Which new versions reuse the operation ID of a changed contract? Look at the versioned OpenAPI documents. |
| litespec/ext/compat#version-breaking-contracts | guidance | Which breaking contracts ship without a new route or media-type version? Look at the versioned API surface. |
| litespec/ext/compat#retain-supported-versions | guidance | Which previous versions left before their support window? Look at the deployed versions beside the declared window. |
| litespec/ext/compat#record-version-retirement | guidance | Which retirements lack consumer owners, a deadline, a removal condition, or approval before removal? Look at the versioning decisions. |
| litespec/ext/compat#signal-planned-public-removal | guidance | Which operations scheduled for removal lack a deprecation signal? Look at the public operations. |
| litespec/ext/compat#publish-deprecation-context | guidance | Which operations scheduled for removal are missing from the consumer changelog? Look at the consumer `CHANGELOG.md`. |
| litespec/ext/compat#record-deprecation-conditions | guidance | Which deprecations lack a sunset date, a replacement, or approval before removal? Look at the deprecation decisions. |
| litespec/ext/compat#treat-errors-as-contracts | guidance | Which type, code, field-code, or status changes shipped outside versioning? Look at the versioned error surface. |
| litespec/ext/compat#gate-new-error-outcomes | guidance | Which added error outcomes break existing consumers on unknown codes? Look at the consumer error handling. |
| litespec/ext/compat#exercise-generated-consumers | guidance | Which first-party clients skip compiling or exercising the changed contract? Look at the client test runs. |
| litespec/ext/compat#declare-published-events | guidance | Which outside-consumed events lack a published declaration with a versioned schema? Look at the event entries beside the outside consumers. |
| litespec/ext/compat#classify-published-event-changes | guidance | Which published-event changes lack a breaking, compatible, or needs-review verdict? Look at the event reviews. |
| litespec/ext/compat#version-breaking-published-events | guidance | Which breaking event changes ship without a new version beside the retained one? Look at the published event versions. |
| litespec/ext/compat#retire-published-events-with-notice | guidance | Which retired event versions left before their support window or without notice? Look at the retirement records beside the event consumers. |
| litespec/ext/compat#store-current-openapi-source | guidance | Which current OpenAPI artifacts live outside the documented path or the recorded local convention? Look at `apps/api/openapi/`. |
| litespec/ext/compat#keep-baseline-references-immutable | guidance | Which baselines move, or live outside the recorded local convention? Look at the baseline references. |
| litespec/ext/compat#use-one-diff-tool | guidance | Which local runs or CI runs use a different diff tool than the recorded local convention? Look at the local runs and the CI runs. |
| litespec/ext/compat#keep-problem-details-codes-stable | guidance | Which Problem Details codes changed across compatible versions, or outside the recorded local convention? Look at the versioned error surface. |
