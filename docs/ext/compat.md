# API Compatibility

## Intent

OpenAPI freshness proves that committed artifacts match source code. It does not prove that independently deployed consumers can continue using the API.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `compat` for public APIs, partner clients, mobile clients, or independently deployed consumers. Same-release internal APIs retain `litespec/backend/api#treat-openapi-as-a-generated-contract`. A project in its pre-production stage defers these rules through the stage extension.

## Baseline relationship

This extension replaces no baseline provision.

This extension switches on no optional record type.

## Standards

### Classify independent-consumer changes

**Requirement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Classification determines whether consumers need a new contract version, review, or no action.

### Classify breaking contract changes

**Requirement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** Existing consumers can depend on every removed, renamed, narrowed, or retyped contract element.

### Classify compatible additions

**Requirement:** An API change reviewer MUST classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** Optional additions do not require existing callers to send or interpret new values.

### Review exhaustive consumer changes

**Requirement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated exhaustive clients can reject a newly valid enum value or discriminator case.

### Preserve stable error codes

**Requirement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** A consumer can branch on a stable code even when the HTTP status remains unchanged.

### Resolve uncertain classifications safely

**Requirement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A conservative outcome protects consumers when a structural diff cannot prove compatibility.

### Retain release baselines

**Requirement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** A retained document gives later changes an immutable comparison target.

### Diff release contracts

**Requirement:** The project MUST compare the current OpenAPI document with the selected supported baseline, both locally and in continuous integration.

**Rationale:** The same diff detects structural compatibility changes locally and during continuous integration.

### Reject unapproved breaking diffs

**Requirement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** The failure makes a compatibility decision explicit before release.

### Assign operation IDs

**Requirement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`, except an endpoint whose shape a specification outside the project fixes.

**Rationale:** Generated clients and tools use the identifier as an operation-level contract name.

**Example:** An OAuth redirect endpoint, an OIDC discovery document, a provider webhook receiver, and a well-known resource each carry a shape the other party defines.

### Retain compatible operation IDs

**Requirement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A changed identifier can break generated client names and operation references.

### Assign versioned operation IDs

**Requirement:** A new API version MUST assign a new operation ID when its operation contract changes.

**Rationale:** A new version can own a contract name without mutating the retained version.

### Version breaking contracts

**Requirement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** A version boundary lets existing and changed contracts coexist.

### Retain supported versions

**Requirement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** Independently deployed consumers need the published support interval to adopt a changed contract.

### Record version retirement

**Requirement:** A versioning decision MUST name the owner of each affected consumer, the deadline, and the removal condition, with the decision approved before any removal.

**Rationale:** Named ownership makes a future removal reviewable rather than implicit.

### Signal planned public removal

**Requirement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** `Deprecation` and `Sunset` headers are examples of observable deprecation signals.

### Publish deprecation context

**Requirement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** The changelog gives consumers one release-note location for planned removal.

### Record deprecation conditions

**Requirement:** A deprecation decision MUST record the sunset date and replacement operation, with nothing removed while the decision is draft.

**Rationale:** Consumers need a fixed end date and a named supported alternative.

### Treat errors as contracts

**Requirement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Consumers can branch on error structures as well as successful response structures.

### Gate new error outcomes

**Requirement:** An API owner MUST add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** Safe fallback behavior avoids consumer failure on a previously unseen outcome.

### Exercise generated consumers

**Requirement:** An API owner MUST test each first-party generated client against the changed OpenAPI document, with each client compiling and exercising its changed operations.

**Rationale:** Generated clients expose exhaustive handling and schema differences that a structural diff can miss.

## Conventions

### Store current OpenAPI source

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The path gives source generation and contract review one predictable location.

### Keep baseline references immutable

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Immutable baseline references prevent a diff from comparing against a mutable artifact.

### Use one diff tool

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** One classifier avoids differences between local and continuous integration outcomes.

### Keep Problem Details codes stable

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** A stable code supports consumer error handling over time.

## Dependencies

The extension adds no required package. An introduced OpenAPI diff tool needs a manifest pin.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/compat#classify-independent-consumer-changes | guidance | Does review classify each independent-consumer contract change? |
| litespec/ext/compat#classify-breaking-contract-changes | guidance | Does review mark each removed, renamed, narrowed, retyped, or authentication change as breaking? |
| litespec/ext/compat#classify-compatible-additions | guidance | Does review record why each optional addition preserves existing behavior? |
| litespec/ext/compat#review-exhaustive-consumer-changes | guidance | Do added enum values and discriminator cases receive consumer review? |
| litespec/ext/compat#preserve-stable-error-codes | guidance | Is each removed or reassigned stable code classified as breaking? |
| litespec/ext/compat#resolve-uncertain-classifications-safely | guidance | Is each unclear change treated as breaking with consumer review? |
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
| litespec/ext/compat#publish-deprecation-context | guidance | Does the consumer changelog name each operation scheduled for removal? |
| litespec/ext/compat#record-deprecation-conditions | guidance | Does the deprecation decision record the sunset date, replacement, and ownership? |
| litespec/ext/compat#treat-errors-as-contracts | guidance | Do type, code, field codes, and statuses receive versioned review? |
| litespec/ext/compat#gate-new-error-outcomes | guidance | Do existing consumers safely handle each added unknown code? |
| litespec/ext/compat#exercise-generated-consumers | guidance | Does each first-party client compile and exercise the changed contract? |
| litespec/ext/compat#store-current-openapi-source | guidance | Is the generated OpenAPI at the documented path or a recorded Exception? |
| litespec/ext/compat#keep-baseline-references-immutable | guidance | Are baseline references immutable, or is there a recorded Exception? |
| litespec/ext/compat#use-one-diff-tool | guidance | Do the local run and continuous integration invoke the same diff tool? |
| litespec/ext/compat#keep-problem-details-codes-stable | guidance | Do Problem Details codes stay stable across compatible versions? |
