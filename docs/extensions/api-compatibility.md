# API Compatibility

## Intent

OpenAPI freshness proves that committed artifacts match source code. It does not prove that independently deployed consumers can continue using the API.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `api-compatibility` for public APIs, partner clients, mobile clients, or independently deployed consumers. Same-release internal APIs retain the baseline freshness check.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Classify every independent-consumer contract change. (EXT.API.COMPATIBILITY.001)
- Treat removals and narrowed contracts as breaking. (EXT.API.COMPATIBILITY.002)
- Diff current OpenAPI against a retained baseline. (EXT.API.DIFF.002)
- Keep operation IDs during compatible changes. (EXT.API.OPERATION.002)
- Version and support breaking contracts. (EXT.API.VERSION.001, EXT.API.VERSION.002)
- Deprecate public removals before sunset. (EXT.API.DEPRECATION.001, EXT.API.DEPRECATION.002)
- Preserve error-contract compatibility. (EXT.API.ERRORS.001, EXT.API.ERRORS.002)

## Standards

### Classify independent-consumer changes (EXT.API.COMPATIBILITY.001)

**Requirement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Classification determines whether consumers need a new contract version, review, or no action.

### Classify breaking contract changes (EXT.API.COMPATIBILITY.002)

**Requirement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** Existing consumers can depend on every removed, renamed, narrowed, or retyped contract element.

### Classify compatible additions (EXT.API.COMPATIBILITY.003)

**Requirement:** An API change reviewer MAY classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** Optional additions do not require existing callers to send or interpret new values.

### Review exhaustive consumer changes (EXT.API.COMPATIBILITY.004)

**Requirement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated exhaustive clients can reject a newly valid enum value or discriminator case.

### Preserve stable error codes (EXT.API.COMPATIBILITY.005)

**Requirement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** A consumer can branch on a stable code even when the HTTP status remains unchanged.

### Resolve uncertain classifications safely (EXT.API.COMPATIBILITY.006)

**Requirement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A conservative outcome protects consumers when a structural diff cannot prove compatibility.

### Retain release baselines (EXT.API.DIFF.001)

**Requirement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** A retained document gives later changes an immutable comparison target.

### Diff release contracts (EXT.API.DIFF.002)

**Requirement:** Continuous integration MUST compare the current OpenAPI document with the selected supported baseline.

**Rationale:** The same diff detects structural compatibility changes locally and during continuous integration.

### Reject unapproved breaking diffs (EXT.API.DIFF.003)

**Requirement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** The failure makes a compatibility decision explicit before release.

### Assign operation IDs (EXT.API.OPERATION.001)

**Requirement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`.

**Rationale:** Generated clients and tools use the identifier as an operation-level contract name.

### Retain compatible operation IDs (EXT.API.OPERATION.002)

**Requirement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A changed identifier can break generated client names and operation references.

### Assign versioned operation IDs (EXT.API.OPERATION.003)

**Requirement:** A new API version MAY assign a new operation ID when its operation contract changes.

**Rationale:** A new version can own a contract name without mutating the retained version.

### Version breaking contracts (EXT.API.VERSION.001)

**Requirement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** A version boundary lets existing and changed contracts coexist.

### Retain supported versions (EXT.API.VERSION.002)

**Requirement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** Independently deployed consumers need the published support interval to adopt a changed contract.

### Record version retirement (EXT.API.VERSION.003)

**Requirement:** A versioning decision MUST name the consumer owner, deadline, and removal condition.

**Rationale:** Named ownership makes a future removal reviewable rather than implicit.

### Signal planned public removal (EXT.API.DEPRECATION.001)

**Requirement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** `Deprecation` and `Sunset` headers are examples of observable deprecation signals.

### Publish deprecation context (EXT.API.DEPRECATION.002)

**Requirement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** The changelog gives consumers one release-note location for planned removal.

### Record deprecation conditions (EXT.API.DEPRECATION.003)

**Requirement:** A deprecation decision MUST record the sunset date and replacement operation.

**Rationale:** Consumers need a fixed end date and a named supported alternative.

### Treat errors as contracts (EXT.API.ERRORS.001)

**Requirement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Consumers can branch on error structures as well as successful response structures.

### Gate new error outcomes (EXT.API.ERRORS.002)

**Requirement:** An API owner MAY add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** Safe fallback behavior avoids consumer failure on a previously unseen outcome.

### Exercise generated consumers (EXT.API.ERRORS.003)

**Requirement:** An API owner MUST test representative generated clients against the changed OpenAPI document.

**Rationale:** Generated clients expose exhaustive handling and schema differences that a structural diff can miss.

## Conventions

### Store current OpenAPI source (EXT.API.CONVENTION.001)

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The path gives source generation and contract review one predictable location.

### Keep baseline references immutable (EXT.API.CONVENTION.002)

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Immutable baseline references prevent a diff from comparing against a mutable artifact.

### Use one diff tool (EXT.API.CONVENTION.003)

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One classifier avoids differences between local and continuous integration outcomes.

### Keep Problem Details codes stable (EXT.API.CONVENTION.004)

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A stable code supports consumer error handling over time.

## Dependencies

The extension adds no required package. An introduced OpenAPI diff tool needs a manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.API.COMPATIBILITY.001 | inspection | Pull request review classifies each independent-consumer API contract change. |
| EXT.API.COMPATIBILITY.002 | inspection | Review marks each removed, renamed, narrowed, retyped, or authentication change as breaking. |
| EXT.API.COMPATIBILITY.003 | inspection | Review records why each optional addition preserves existing consumer behavior. |
| EXT.API.COMPATIBILITY.004 | test, inspection | Generated-client tests and review cover added enum values and discriminator cases. |
| EXT.API.COMPATIBILITY.005 | static | Error-contract comparison rejects removed or reassigned stable Problem Details codes. |
| EXT.API.COMPATIBILITY.006 | inspection | Unclear compatibility classifications record breaking treatment and consumer review. |
| EXT.API.DIFF.001 | operation | Release artifacts retain the generated OpenAPI baseline for each supported version. |
| EXT.API.DIFF.002 | test | Local and continuous integration execute the selected baseline diff command. |
| EXT.API.DIFF.003 | test, inspection | Breaking-diff failure requires a version boundary or approved consumer decision. |
| EXT.API.OPERATION.001 | static | OpenAPI validation reports a deliberate `operationId` for each independent-consumer operation. |
| EXT.API.OPERATION.002 | test | Baseline comparison reports unchanged IDs for compatible operations. |
| EXT.API.OPERATION.003 | inspection | Versioned operation review records each deliberately changed operation ID. |
| EXT.API.VERSION.001 | inspection | Breaking contract review identifies its new route or media-type version. |
| EXT.API.VERSION.002 | operation | Release records show prior-version availability through the declared support window. |
| EXT.API.VERSION.003 | inspection | The versioning decision names consumer owner, deadline, and removal condition. |
| EXT.API.DEPRECATION.001 | test | Contract tests assert the documented deprecation signal for planned removal. |
| EXT.API.DEPRECATION.002 | inspection | Consumer `CHANGELOG.md` names each operation scheduled for removal. |
| EXT.API.DEPRECATION.003 | inspection | The deprecation decision records the sunset date and replacement operation. |
| EXT.API.ERRORS.001 | static, inspection | OpenAPI and error-contract review include type, code, field codes, and statuses. |
| EXT.API.ERRORS.002 | test | Existing consumer fixtures safely handle each added unknown error code. |
| EXT.API.ERRORS.003 | test | Representative generated clients compile and exercise the changed contract. |
| EXT.API.CONVENTION.001 | static | Generated OpenAPI exists at the documented source path or recorded local replacement. |
| EXT.API.CONVENTION.002 | inspection | Baseline storage review confirms immutable retained references. |
| EXT.API.CONVENTION.003 | test | Local and continuous integration invoke the same diff tool. |
| EXT.API.CONVENTION.004 | test | Contract comparison reports stable Problem Details error codes across compatible versions. |
