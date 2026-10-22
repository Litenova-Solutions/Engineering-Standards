# API Compatibility

## Intent

API compatibility keeps consumers that release on their own schedule, such as public, partner, and mobile clients, working when the API changes. This page states how a project classifies each contract change, versions breaking ones, keeps supported versions alive, and retires them with notice. A team with such consumers applies it, so its consumers keep working across releases instead of breaking on deploy day.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `compat` for public APIs, partner clients, mobile clients, or independently deployed consumers. APIs whose consumers always release together with them stay under `litespec/backend/api#treat-openapi-as-a-generated-contract`. A project whose first deployment holds no customer data yet defers these rules through the stage extension.

## Baseline relationship

This extension replaces no baseline provision.

This extension switches on no optional record type.

## Standards

### Classify independent-consumer changes

**Statement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Every contract change reaches consumers the project does not deploy. Classifying each one decides whether consumers need a new version, a review, or nothing at all. An unclassified change ships the decision to consumers as a surprise.

### Classify breaking contract changes

**Statement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** A consumer can depend on any element of the contract: a field it reads, a status it branches on, an authentication scheme it implements. Removing, renaming, narrowing, or retyping any of them breaks the consumer that depended on it. Calling each such change breaking routes it to versioning instead of silent release.

### Classify compatible additions

**Statement:** An API change reviewer MUST classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** An optional field, endpoint, or query parameter asks nothing of existing callers: they send and interpret the same values as before. Classifying these as compatible keeps routine growth cheap. Treating them as breaking would version the API for changes nobody must adopt.

### Review exhaustive consumer changes

**Statement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated clients often switch exhaustively over enum values and discriminator cases. A new value that the server now sends reaches a client with no branch for it, which rejects a valid response. Consumer review checks that each client handles the new case before it ships.

### Preserve stable error codes

**Statement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** Consumers branch on stable Problem Details codes the way they branch on statuses. Removing or reassigning a code breaks that branch while the status stays green. Treating the code as breaking keeps error handling stable across versions.

### Resolve uncertain classifications safely

**Statement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A structural diff cannot prove every change compatible: some changes need a person to judge their effect on consumers. Classifying the unclear ones as breaking routes them to consumer review instead of release. The cost of a needless review is smaller than the cost of a broken consumer.

### Retain release baselines

**Statement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** Each release stores its OpenAPI document as an immutable baseline. Later changes diff against it instead of against memory or a mutable file. Without a retained baseline, the project cannot prove what changed between two releases.

### Diff release contracts

**Statement:** The project MUST compare the current OpenAPI document with the selected supported baseline, both locally and in continuous integration.

**Rationale:** The diff against the supported baseline runs both locally and in continuous integration. The local run catches a breaking change while it is cheap to rework. The CI run catches it when the local run was skipped.

### Reject unapproved breaking diffs

**Statement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** A breaking diff that fails CI stops until a new API version or an approved consumer decision authorizes it. The failure forces the compatibility decision before release, while versioning is still possible. A warning nobody must answer authorizes nothing.

### Assign operation IDs

**Statement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`, except an endpoint whose shape a specification outside the project fixes.

**Rationale:** Generated clients turn each `operationId` into a method name, and tools use it to reference the operation. A deliberate identifier keeps those names stable and meaningful. An endpoint whose shape an outside specification fixes is exempt, because the project does not own that contract.

**Example:** An OAuth redirect endpoint, an OIDC discovery document, a provider webhook receiver, and a well-known resource each carry a shape the other party defines.

### Retain compatible operation IDs

**Statement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A compatible change promises existing consumers keep working. Renaming the `operationId` breaks that promise for every generated client and every stored operation reference. The identifier stays until a new version takes over.

### Assign versioned operation IDs

**Statement:** A new API version MUST assign a new operation ID when its operation contract changes.

**Rationale:** The new version needs its own contract names so the retained version keeps its own. A new `operationId` for each changed operation separates the two. Sharing one identifier across versions would let the new contract rename the old one.

### Version breaking contracts

**Statement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** Breaking changes need a boundary: a new route or a documented media-type version. Both contracts then serve at once, and each consumer moves on its own schedule. Without the boundary, one contract serves two incompatible expectations.

### Retain supported versions

**Statement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** A consumer the project does not deploy moves on its own release cadence. The declared support window states how long the previous version stays available for that move. Removing it early strands consumers that kept to the published plan.

### Record version retirement

**Statement:** A versioning decision MUST name the owner of each affected consumer, the deadline, and the removal condition, with the decision approved before any removal.

**Rationale:** A removal touches consumers the project does not control, so the decision names each affected consumer's owner, the deadline, and the removal condition. Approval happens before any removal, while the plan can still change. An unrecorded retirement removes first and notifies whoever complains.

### Signal planned public removal

**Statement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** Consumers discover a planned removal only when the API tells them. A documented deprecation signal, such as `Deprecation` and `Sunset` headers, announces the removal on the operation itself. A removal with no signal arrives as an outage to every consumer that missed the release notes.

### Publish deprecation context

**Statement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** Headers announce the removal on the operation, but consumers plan from release notes. The consumer `CHANGELOG.md` names each operation scheduled for removal in the one place consumers already read. A deprecation missing from the changelog reaches only the consumers that inspect headers.

### Record deprecation conditions

**Statement:** A deprecation decision MUST record the sunset date and replacement operation, with nothing removed while the decision is draft.

**Rationale:** A deprecation decision records the sunset date and the replacement operation, so each consumer knows when to move and where to go. Nothing is removed while the decision is still draft. A removal without a recorded replacement strands the consumer that depended on the old operation.

### Treat errors as contracts

**Statement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Error handling is consumer code: it branches on Problem Details type, code, field-error codes, and documented statuses. Versioning those elements with the contract keeps error handling working across releases. An error shape that changes outside versioning breaks the consumer's failure path, which is the path least tested.

### Gate new error outcomes

**Statement:** An API owner MUST add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** A new error outcome reaches consumers written before it existed. Adding it only when existing consumers handle an unknown code safely keeps old clients working against the new contract. An outcome old clients cannot parse turns their error path into a crash.

### Exercise generated consumers

**Statement:** An API owner MUST test each first-party generated client against the changed OpenAPI document, with each client compiling and exercising its changed operations.

**Rationale:** A structural diff compares documents; it never compiles a client. Testing each first-party generated client against the changed document compiles it and exercises its changed operations. The client's compiler and its exhaustive switches catch the breaks the diff cannot see.

## Conventions

### Store current OpenAPI source

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Source generation and contract review both need the current OpenAPI artifact. One predictable path keeps generation, review, and the diff reading the same file. A second copy drifts from the first.

### Keep baseline references immutable

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** A diff proves nothing when its comparison target can move. Baselines beside their contract owner or under an immutable release reference stay fixed. A mutable baseline lets a breaking change hide by moving the target.

### Use one diff tool

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The local run and CI must agree on what breaking means. One diff tool in both places gives one classification for each change. Two tools disagree on edge cases and teach developers to distrust the check.

### Keep Problem Details codes stable

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Consumer error handling branches on these codes for years. Keeping them stable across compatible versions lets that handling survive routine releases. A renamed code forces every consumer to update its failure path for no behavior gain.

## Dependencies

This extension adds no required package. A project that introduces an OpenAPI diff tool pins its version in the manifest.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/compat#classify-independent-consumer-changes | guidance | Does the reviewer classify each independent-consumer contract change? |
| litespec/ext/compat#classify-breaking-contract-changes | guidance | Does the reviewer mark each removed, renamed, narrowed, retyped, or authentication change as breaking? |
| litespec/ext/compat#classify-compatible-additions | guidance | Does the reviewer record why each optional addition preserves existing behavior? |
| litespec/ext/compat#review-exhaustive-consumer-changes | guidance | Do added enum values and discriminator cases receive consumer review? |
| litespec/ext/compat#preserve-stable-error-codes | guidance | Does the reviewer classify each removed or reassigned stable code as breaking? |
| litespec/ext/compat#resolve-uncertain-classifications-safely | guidance | Does the reviewer treat each unclear change as breaking with consumer review? |
| litespec/ext/compat#retain-release-baselines | guidance | Does each release retain its OpenAPI document as an immutable baseline? |
| litespec/ext/compat#diff-release-contracts | guidance | Do the local run and continuous integration compare against the selected baseline? |
| litespec/ext/compat#reject-unapproved-breaking-diffs | guidance | Does a breaking diff fail without a new version or an approved decision? |
| litespec/ext/compat#assign-operation-ids | guidance | Does each independent-consumer operation carry a deliberate operationId? |
| litespec/ext/compat#retain-compatible-operation-ids | guidance | Does each compatible change retain the existing operationId? |
| litespec/ext/compat#assign-versioned-operation-ids | guidance | Does a new version assign a new operation ID for each changed contract? |
| litespec/ext/compat#version-breaking-contracts | guidance | Does each breaking contract use a new route or media-type version? |
| litespec/ext/compat#retain-supported-versions | guidance | Does the previous version stay available through its support window? |
| litespec/ext/compat#record-version-retirement | guidance | Does the versioning decision name its consumer owners, deadline, removal condition, and ownership? |
| litespec/ext/compat#signal-planned-public-removal | guidance | Does each operation scheduled for removal expose its deprecation signal? |
| litespec/ext/compat#publish-deprecation-context | guidance | Does the consumer `CHANGELOG.md` name each operation scheduled for removal? |
| litespec/ext/compat#record-deprecation-conditions | guidance | Does the deprecation decision record the sunset date, replacement, and ownership? |
| litespec/ext/compat#treat-errors-as-contracts | guidance | Does the owner treat type, code, field codes, and statuses as versioned contract elements? |
| litespec/ext/compat#gate-new-error-outcomes | guidance | Do existing consumers safely handle each added unknown code? |
| litespec/ext/compat#exercise-generated-consumers | guidance | Does each first-party client compile and exercise the changed contract? |
| litespec/ext/compat#store-current-openapi-source | guidance | Is the generated OpenAPI at the documented path or a recorded Exception? |
| litespec/ext/compat#keep-baseline-references-immutable | guidance | Are baseline references immutable, or is there a recorded Exception? |
| litespec/ext/compat#use-one-diff-tool | guidance | Do the local run and continuous integration invoke the same diff tool? |
| litespec/ext/compat#keep-problem-details-codes-stable | guidance | Do Problem Details codes stay stable across compatible versions? |
