# Versioning and Releases

---

## Semver Semantics

| Bump | Meaning |
|:---|:---|
| `MAJOR` | Breaking change to MUST rules, manifest schema, or template contracts |
| `MINOR` | Additive conventions, new templates, new agent load plans |
| `PATCH` | Clarifications, examples, typo fixes |

---

## Pre-v1 Consumption

Until `v1.0.0` or `v1.0.0-rc.1` is published on GitHub Releases:

- Pin an exact **commit SHA** in the submodule.
- Record `git rev-parse HEAD` in the consumer adoption PR.
- Do not track `main` in production repositories.

---

## Release Checklist (Maintainers)

1. Run `node scripts/validate-standards.mjs`.
2. Record `git rev-parse HEAD` in the release notes.
3. Tag `v1.0.0-rc.1` or `v1.0.0`.
4. Publish GitHub Release with summary and breaking changes.
5. Update `RELEASES.md`.
6. Notify consumer repos to bump submodule tag or SHA.

---

## Post-v1 Upgrade (Consumers)

1. Read GitHub Release notes for the target tag.
2. Bump submodule: `cd standards && git fetch && git checkout vX.Y.Z`.
3. Diff template changes under `docs/templates/` and apply manually.
4. Run consumer CI gates.
5. Update project ADR if manifest package versions change.

See `standards.manifest.json` for machine-readable version pins.
