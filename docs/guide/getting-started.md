# Get Started

## Purpose

Create a consumer repository with one selected profile, current specifications, and evidence for an implemented product outcome.

## Prerequisites

- Pin the selected standards release before copying profile-specific configuration.
- Read the [platform profile](../profile/nextjs.md), the [agent protocol](../core/agent.md), and the [authoring standard](../core/authoring.md).
- Read the [extension catalog](../ext/README.md) to learn which capabilities stay inactive at the start.

## Procedure

Each step links the standard that governs it. Read that page before running the step.

### Pin

1. Add this repository as a submodule or another pinned dependency, following [workspace structure](../workspace/structure.md).
2. Copy `standards.project.json` and `project-agents.md` from the [template index](../../templates/consumer/README.md), then fill every placeholder and set `reviewedStandardsVersion` to the pinned release.

### Configure

3. Create toolchain, package, and build configuration from the manifest pins, following [configuration](../workspace/config.md).
4. Add only the packages the manifest already pins, following [dependencies](../workspace/dependencies.md).

### Structure

5. Create the API solution, the four application projects, AppHost, ServiceDefaults, and the baseline test projects, following [architecture](../backend/architecture.md) and [backend testing](../backend/testing.md).
6. Apply the file, type, and folder names in [naming](../workspace/naming.md).

### Specify

7. Create product, domain, glossary, module, use-case, and flow records from the templates, following the [engineering system](../core/system.md).
8. Select an extension only when its activation criteria already hold, following [scope](../core/scope.md).

### Implement

9. Model the domain with [domain](../backend/domain.md), using [model a domain](model-domain.md) as the worked procedure.
10. Coordinate use cases with [application](../backend/application.md) and store them with [Marten persistence](../backend/persistence.md).
11. Expose operations with [HTTP API](../backend/api.md) and secure them with [security](../quality/security.md).
12. Declare each React frontend and install its pinned UI baseline, following [frontend structure](../frontend/structure.md) and [controlled UI governance](../frontend/ui.md).
13. Create UI vocabulary and page sidecars for each non-trivial visible route, following [controlled UI governance](../frontend/ui.md).
14. Deliver one complete slice with source, tests, contracts, and operating evidence, following the [release standard](../core/release.md).

### Operate

15. Add deployment, backup, restore, rollback, limits, and runbooks before production use, following [operations](../quality/operations.md).
16. Configure the pipeline gates in [continuous integration](../quality/ci.md).

## Verification

- Run `node standards/tools/validate-consumer.mjs` from the consumer root.
- Run `node standards/tools/validate-ui.mjs` for every opted-in React web frontend.
- Confirm the selected profile and extension records match current product requirements.
- Confirm each verified slice has source, automated evidence, generated contracts, and operating records.
