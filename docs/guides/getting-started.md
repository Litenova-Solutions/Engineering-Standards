# Get Started

## Purpose

Create a consumer repository with one selected profile, current specifications, and evidence for an implemented product outcome.

## Prerequisites

- Pin the selected standards release before copying profile-specific configuration.
- Read the profile, agent protocol, authoring standard, and applicable extension criteria.

## Procedure

1. Add the standards repository as a submodule or another pinned repository dependency.
2. Copy `standards.project.json` and `project-agents.md`, then fill every project placeholder.
3. Create toolchain, package, and build configuration from manifest version pins.
4. Create the API solution, four application projects, AppHost, ServiceDefaults, and baseline test projects.
5. Create product, domain, glossary, module, use-case, and flow records from the templates.
6. Select extensions only after their activation criteria have current evidence.
7. Configure PostgreSQL, Marten, LiteBus, diagnostics, HTTP boundaries, and deterministic OpenAPI generation.
8. Declare every React frontend and install its manifest-pinned UI baseline.
9. Create UI vocabulary and page sidecars for each non-trivial visible route.
10. Implement one complete slice with source, tests, contracts, and operating evidence.
11. Add deployment, backup, restore, rollback, limits, and runbooks before production use.
12. Run profile, extension, schema, and consumer validation before claiming a verified slice.

## Verification

- Run `node standards/tools/validate-consumer.mjs` from the consumer root.
- Run `node standards/tools/validate-ui.mjs` for every opted-in React web frontend.
- Confirm the selected profile and extension records match current product requirements.
- Confirm each verified slice has source, automated evidence, generated contracts, and operating records.
