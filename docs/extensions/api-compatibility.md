# API Compatibility

## Intent

OpenAPI freshness proves that committed artifacts match source code. It does not prove that an independently deployed consumer can continue to use the API. This extension adds compatibility review for APIs with consumers outside the same release.

## Activation

Enable `api-compatibility` for public APIs, partner clients, mobile clients, or independently deployed consumers. Internal APIs consumed only by the same release retain the baseline freshness check.

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Diff each release OpenAPI document against the previous release baseline.
- Treat removed, renamed, narrowed, or retyped contract elements as breaking.
- Keep `operationId` values stable across compatible changes.
- Version breaking changes and record affected consumers.
- Deprecate before removal with a documented sunset date.

## Standards

### Classify contract changes (EXT.API.COMPATIBILITY.001)

Removing an endpoint or field, renaming a field, narrowing an accepted value, changing a response type, or changing a documented status code is breaking. Adding an optional field, endpoint, or query parameter is compatible when existing clients keep their behavior.

When classification is unclear, treat the change as breaking and require consumer review.

### Diff against a release baseline (EXT.API.DIFF.001)

Store the OpenAPI document from each release as a baseline artifact. CI MUST compare the current document with the previous supported baseline and fail on breaking changes unless the change uses a new API version or an approved decision names consumer acceptance.

### Keep operation IDs stable (EXT.API.OPERATION.001)

Every operation exposed to an independent consumer MUST have a deliberate `operationId`. A compatible change MUST retain that value. A new version MAY use a new operation ID when the operation contract changes.

### Version breaking changes (EXT.API.VERSION.001)

Use a new route or documented media-type version for a breaking contract. Keep the old version available for the declared support window. The versioning decision names the migration owner, consumer deadline, and removal condition.

### Deprecate before removal (EXT.API.DEPRECATION.001)

Public operations scheduled for removal MUST expose a documented deprecation signal, such as `Deprecation` and `Sunset` headers, and appear in release notes. The use-case or API decision records the sunset date and replacement operation.

## Conventions

Keep baseline OpenAPI artifacts under the generated contract owner, such as `packages/api-types/`. Use the same diff tool in local verification and CI. Keep Problem Details error codes stable across versions.

## Dependencies

The extension adds no required package. Use an approved OpenAPI diff tool and pin it through the manifest when it is introduced.

## Verification

- Diff the current OpenAPI document against the previous supported baseline.
- Test stable operation IDs and documented Problem Details shapes.
- Verify breaking changes use a version or an approved consumer decision.
- Verify deprecation headers, release notes, support windows, and sunset behavior.
