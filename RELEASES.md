# Release Notes

Formal `CHANGELOG.md` starts at **v2.0.0**. Until then, this file tracks v1 prerelease and release notes for submodule adopters.

---

## Unreleased (main)

Working baseline before first GitHub Release. Consumers MUST pin commit SHA until a tag exists.

### Review remediation (2026-05-28)

- Resolved Domain value object vs validator exception boundary (`DomainException` in Domain, `CommandValidationException` in Application validators).
- Clarified Worker vs WebApi background job hosting.
- Made `standards.manifest.json` the sole normative version source; reduced version prose in `AGENTS.md`.
- Added object-level authorization standard (`docs/conventions/backend/20-object-authorization.md`).
- Added security controls matrix, API compatibility / OpenAPI diff standard, enforcement matrix.
- Removed default `LangVersion=preview`; added SDK feature-band update policy.
- Fixed `IQueryMediator` usage in resource authorization example.
- Clarified GitHub Actions SHA pinning (third-party vs GitHub-owned).
- Added agent conflict protocol, pre-edit checkpoint, and `agentLoadPlans` in manifest.
- Tiered testing and Aspire guidance; stable `errorCode` / `traceId` in Problem Details.

---

## v1.0.0-rc.1 (planned)

First semver tag for submodule adoption. Publish from reviewed commit SHA with:

- All items under **Unreleased** above
- GitHub Release artifact with OpenAPI baseline guidance
- Validated templates and bootstrap smoke test green in CI

---

## v1.0.0 (planned)

First stable pinned release after rc soak period. No breaking MUST rule changes from rc unless documented in Release notes.
