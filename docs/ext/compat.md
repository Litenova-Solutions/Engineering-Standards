# API Compatibility

## Intent

OpenAPI freshness proves that committed artifacts match source code. It does not prove that independently deployed consumers can continue using the API.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `compat` for public APIs, partner clients, mobile clients, or independently deployed consumers. Same-release internal APIs retain the baseline freshness check.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Classify every independent-consumer contract change. (standards/rule/ext-compat.classify-independent-consumer-changes)
- Treat removals and narrowed contracts as breaking. (standards/rule/ext-compat.classify-breaking-contract-changes)
- Diff current OpenAPI against a retained baseline. (standards/rule/ext-compat.diff-release-contracts)
- Keep operation IDs during compatible changes. (standards/rule/ext-compat.retain-compatible-operation-ids)
- Version and support breaking contracts. (standards/rule/ext-compat.version-breaking-contracts, standards/rule/ext-compat.retain-supported-versions)
- Deprecate public removals before sunset. (standards/rule/ext-compat.signal-planned-public-removal, standards/rule/ext-compat.publish-deprecation-context)
- Preserve error-contract compatibility. (standards/rule/ext-compat.treat-errors-as-contracts, standards/rule/ext-compat.gate-new-error-outcomes)

## Standards

### Classify independent-consumer changes (standards/rule/ext-compat.classify-independent-consumer-changes)

**Requirement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Classification determines whether consumers need a new contract version, review, or no action.

### Classify breaking contract changes (standards/rule/ext-compat.classify-breaking-contract-changes)

**Requirement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** Existing consumers can depend on every removed, renamed, narrowed, or retyped contract element.

### Classify compatible additions (standards/rule/ext-compat.classify-compatible-additions)

**Requirement:** An API change reviewer MAY classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** Optional additions do not require existing callers to send or interpret new values.

### Review exhaustive consumer changes (standards/rule/ext-compat.review-exhaustive-consumer-changes)

**Requirement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated exhaustive clients can reject a newly valid enum value or discriminator case.

### Preserve stable error codes (standards/rule/ext-compat.preserve-stable-error-codes)

**Requirement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** A consumer can branch on a stable code even when the HTTP status remains unchanged.

### Resolve uncertain classifications safely (standards/rule/ext-compat.resolve-uncertain-classifications-safely)

**Requirement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A conservative outcome protects consumers when a structural diff cannot prove compatibility.

### Retain release baselines (standards/rule/ext-compat.retain-release-baselines)

**Requirement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** A retained document gives later changes an immutable comparison target.

### Diff release contracts (standards/rule/ext-compat.diff-release-contracts)

**Requirement:** Continuous integration MUST compare the current OpenAPI document with the selected supported baseline.

**Rationale:** The same diff detects structural compatibility changes locally and during continuous integration.

### Reject unapproved breaking diffs (standards/rule/ext-compat.reject-unapproved-breaking-diffs)

**Requirement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** The failure makes a compatibility decision explicit before release.

### Assign operation IDs (standards/rule/ext-compat.assign-operation-ids)

**Requirement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`.

**Rationale:** Generated clients and tools use the identifier as an operation-level contract name.

An endpoint whose shape a specification outside this project fixes is out of scope for this rule. An OAuth redirect endpoint, an OIDC discovery document, a provider webhook receiver, and a well-known resource each carry a shape the other party defines. Naming them deliberately changes nothing a consumer reads, because no consumer generates a client from them.

### Retain compatible operation IDs (standards/rule/ext-compat.retain-compatible-operation-ids)

**Requirement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A changed identifier can break generated client names and operation references.

### Assign versioned operation IDs (standards/rule/ext-compat.assign-versioned-operation-ids)

**Requirement:** A new API version MAY assign a new operation ID when its operation contract changes.

**Rationale:** A new version can own a contract name without mutating the retained version.

### Version breaking contracts (standards/rule/ext-compat.version-breaking-contracts)

**Requirement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** A version boundary lets existing and changed contracts coexist.

### Retain supported versions (standards/rule/ext-compat.retain-supported-versions)

**Requirement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** Independently deployed consumers need the published support interval to adopt a changed contract.

### Record version retirement (standards/rule/ext-compat.record-version-retirement)

**Requirement:** A versioning decision MUST name the consumer owner, deadline, and removal condition.

**Rationale:** Named ownership makes a future removal reviewable rather than implicit.

### Signal planned public removal (standards/rule/ext-compat.signal-planned-public-removal)

**Requirement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** `Deprecation` and `Sunset` headers are examples of observable deprecation signals.

### Publish deprecation context (standards/rule/ext-compat.publish-deprecation-context)

**Requirement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** The changelog gives consumers one release-note location for planned removal.

### Record deprecation conditions (standards/rule/ext-compat.record-deprecation-conditions)

**Requirement:** A deprecation decision MUST record the sunset date and replacement operation.

**Rationale:** Consumers need a fixed end date and a named supported alternative.

### Treat errors as contracts (standards/rule/ext-compat.treat-errors-as-contracts)

**Requirement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Consumers can branch on error structures as well as successful response structures.

### Gate new error outcomes (standards/rule/ext-compat.gate-new-error-outcomes)

**Requirement:** An API owner MAY add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** Safe fallback behavior avoids consumer failure on a previously unseen outcome.

### Exercise generated consumers (standards/rule/ext-compat.exercise-generated-consumers)

**Requirement:** An API owner MUST test representative generated clients against the changed OpenAPI document.

**Rationale:** Generated clients expose exhaustive handling and schema differences that a structural diff can miss.

## Conventions

### Store current OpenAPI source (standards/rule/ext-compat.store-current-openapi-source)

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The path gives source generation and contract review one predictable location.

### Keep baseline references immutable (standards/rule/ext-compat.keep-baseline-references-immutable)

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Immutable baseline references prevent a diff from comparing against a mutable artifact.

### Use one diff tool (standards/rule/ext-compat.use-one-diff-tool)

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One classifier avoids differences between local and continuous integration outcomes.

### Keep Problem Details codes stable (standards/rule/ext-compat.keep-problem-details-codes-stable)

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A stable code supports consumer error handling over time.

## Dependencies

The extension adds no required package. An introduced OpenAPI diff tool needs a manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-compat.classify-independent-consumer-changes | inspection | Pull request review classifies each independent-consumer API contract change. |
| standards/rule/ext-compat.classify-breaking-contract-changes | inspection | Review marks each removed, renamed, narrowed, retyped, or authentication change as breaking. |
| standards/rule/ext-compat.classify-compatible-additions | inspection | Review records why each optional addition preserves existing consumer behavior. |
| standards/rule/ext-compat.review-exhaustive-consumer-changes | test, inspection | `ApiCompatibilityTests` and review cover added enum values and discriminator cases. |
| standards/rule/ext-compat.preserve-stable-error-codes | static | `ApiCompatibilityTests` rejects removed or reassigned stable Problem Details codes. |
| standards/rule/ext-compat.resolve-uncertain-classifications-safely | inspection | Unclear compatibility classifications record breaking treatment and consumer review. |
| standards/rule/ext-compat.retain-release-baselines | operation | Release artifacts retain the generated OpenAPI baseline for each supported version. |
| standards/rule/ext-compat.diff-release-contracts | test | `ApiDiffTests` asserts local and continuous integration execute the selected baseline diff command. |
| standards/rule/ext-compat.reject-unapproved-breaking-diffs | test, inspection | `ApiDiffTests` asserts breaking-diff failure requires a version boundary or approved consumer decision. |
| standards/rule/ext-compat.assign-operation-ids | static | OpenAPI validation reports a deliberate `operationId` for each independent-consumer operation. |
| standards/rule/ext-compat.retain-compatible-operation-ids | test | `ApiOperationTests` reports unchanged IDs for compatible operations. |
| standards/rule/ext-compat.assign-versioned-operation-ids | inspection | Versioned operation review records each deliberately changed operation ID. |
| standards/rule/ext-compat.version-breaking-contracts | inspection | Breaking contract review identifies its new route or media-type version. |
| standards/rule/ext-compat.retain-supported-versions | operation | Release records show prior-version availability through the declared support window. |
| standards/rule/ext-compat.record-version-retirement | inspection | The versioning decision names consumer owner, deadline, and removal condition. |
| standards/rule/ext-compat.signal-planned-public-removal | test | `ApiDeprecationTests` assert the documented deprecation signal for planned removal. |
| standards/rule/ext-compat.publish-deprecation-context | inspection | Consumer `CHANGELOG.md` names each operation scheduled for removal. |
| standards/rule/ext-compat.record-deprecation-conditions | inspection | The deprecation decision records the sunset date and replacement operation. |
| standards/rule/ext-compat.treat-errors-as-contracts | inspection | OpenAPI and error-contract review include type, code, field codes, and statuses. |
| standards/rule/ext-compat.gate-new-error-outcomes | test | `ApiErrorsTests` safely handle each added unknown error code. |
| standards/rule/ext-compat.exercise-generated-consumers | test | `ApiErrorsTests` asserts representative generated clients compile and exercise the changed contract. |
| standards/rule/ext-compat.store-current-openapi-source | static | `ApiTests` asserts generated OpenAPI exists at the documented source path or recorded local replacement. |
| standards/rule/ext-compat.keep-baseline-references-immutable | inspection | Baseline storage review confirms immutable retained references. |
| standards/rule/ext-compat.use-one-diff-tool | test | `ApiTests` asserts local and continuous integration invoke the same diff tool. |
| standards/rule/ext-compat.keep-problem-details-codes-stable | test | `ApiTests` reports stable Problem Details error codes across compatible versions. |
