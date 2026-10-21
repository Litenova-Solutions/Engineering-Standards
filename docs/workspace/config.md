# Configuration

## Intent

Configuration is every value a workspace sets outside code: version pins, backend and frontend settings, environment access, secrets, and toolchain versions. This page states where each value lives, who owns it, and when a bad value fails. It applies to anyone who adds a setting, a dependency, or a tool to the workspace. One owner per value keeps builds repeatable and surfaces a missing or invalid value before a deployment starts.

## Concepts

### Settings and environment

A backend section binds to a named settings type: one class that names each field, its range, and its format, validated when the application starts. A frontend reads its environment through one validated module that separates server-only values from browser-visible ones. Tracked files carry only safe defaults and placeholders; real values live in user secrets locally and on the deployment platform when hosted.

### Pins and repeatability

A repeatable build resolves the same versions on every machine. The manifest, `litespec.manifest.json`, pins the baseline stack, one root lockfile pins the JavaScript graph, and the toolchain pins name the package manager and Node.js releases. With every version pinned in one owned place, two checkouts of the same commit build the same result.

## Standards

### Validate backend configuration at startup

**Requirement:** A backend configuration section MUST bind to a named settings type validated for required fields, ranges, and formats at startup.

**Rationale:** A missing or malformed setting fails somewhere: at startup with a named field, or at the first request that needs it with a downstream error. Binding each section to a validated settings type fails at startup, while the deployment can still stop. Reading a required setting through a raw configuration lookup defers the failure to the first request that needs it.

### Validate frontend environment access

**Requirement:** A frontend MUST read environment variables through one validated module separating server-only from browser-visible values, at `src/lib/env.ts` through the framework alias.

**Rationale:** A frontend bundle ships to the browser, so every value it reads is public. One validated module at `src/lib/env.ts` separates server-only values from browser-visible ones in a single place a reviewer can read. Browser-visible names use the framework prefix, so an unprefixed value cannot reach the bundle by accident.

### Keep secrets outside source control

**Requirement:** A tracked configuration file MUST contain only safe defaults and placeholders.

**Rationale:** A tracked file reaches every clone and stays in history after deletion. Local development uses user secrets and hosted environments use the deployment platform, so no real value needs to be tracked. Safe defaults and placeholders keep the tracked file runnable as documentation.

### Use one frontend dependency graph

**Requirement:** A TypeScript workspace MUST use one root `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`.

**Rationale:** One root manifest and one lockfile resolve one version of each package for the whole workspace. A nested lockfile lets one application resolve a different version than the workspace CI installs, so local builds and CI builds disagree about the same code. One graph keeps every install identical.

### Pin the JavaScript toolchain

**Requirement:** Root `package.json` MUST declare the manifest pnpm stack release in `packageManager` and a Node.js engine matching the manifest node stack release.

**Rationale:** Different Node.js or pnpm releases resolve, build, and lint differently. Declaring the manifest pnpm release in `packageManager` and a matching Node.js engine keeps every developer and CI on the same toolchain. CI provisions that Node.js release and invokes the declared pnpm release, so local and CI resolve identically.

### Pin the React version in the ESLint flat config

**Requirement:** When the workspace holds a React frontend, its ESLint flat config MUST set a concrete `settings.react.version` rather than leave it at `detect`.

**Rationale:** Version detection calls context APIs that the pinned ESLint release removed, so `detect` fails under the pinned toolchain. A concrete `settings.react.version` skips detection entirely and lints against the version the workspace ships.

## Conventions

### Keep environment examples beside applications

**Default:** Keep a `.env.example` beside each frontend and deployable host listing required names and safe values.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A new developer copies the example to start, and a reviewer reads it to learn which names the application needs. Beside the frontend or host it documents, next to the options module that reads those names, the example changes in the same edit as the names. Anywhere else, it goes stale without anyone noticing.

### Keep local overrides untracked

**Default:** Keep developer overrides in ignored local files or a platform secret store.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Developer overrides differ per machine by nature: ports, paths, local endpoints. Committing them turns one developer's setup into everyone's default. Ignored local files or a platform secret store keep overrides personal, and no second committed source competes with the deployment platform for the same value.

### Keep logging configuration provider-neutral

**Default:** Emit structured logs through standard logging abstractions and keep exporter configuration in hosts.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Application code writes through standard logging abstractions, and each host configures its exporter. Application code then carries no provider choice, so switching a log backend stays inside deployment settings instead of touching every call site.

### Keep documentation directories out of build-artifact ignore rules

**Default:** Exclude a documentation directory from a build-artifact ignore rule that matches it by accident.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Platform `.gitignore` templates match broad names, and a documentation directory with such a name silently stops being tracked. Excluding the documentation directory from the rule keeps records tracked, and `git check-ignore` confirms each record is visible.

**Example:**

```gitignore
[Oo]utput/
!docs/<directory>/
!docs/<directory>/*.md
```

Confirm with `git check-ignore docs/<directory>/<file>.md` that no record is ignored.

## Reference example

This informative example demonstrates `litespec/workspace/config#validate-backend-configuration-at-startup` and `litespec/workspace/config#keep-secrets-outside-source-control`.

The `EmailSettings` type binds the `Email` section and validates its endpoint and sender during startup; the application injects it as a settings type instead of reading raw configuration. The tracked file carries only placeholders, and the consumer workspace secret store supplies the credential.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/config#validate-backend-configuration-at-startup | guidance | Does each backend section bind a validated settings type that fails startup on bad values? |
| litespec/workspace/config#validate-frontend-environment-access | guidance | Does each frontend read environment values only through its validated module with server values separated? |
| litespec/workspace/config#keep-secrets-outside-source-control | guidance | Does each tracked configuration file carry only safe defaults and placeholders? |
| litespec/workspace/config#use-one-frontend-dependency-graph | guidance | Does the workspace use one root manifest and lockfile with no nested lockfile tracked? |
| litespec/workspace/config#pin-the-javascript-toolchain | guidance | Does root `package.json` declare the manifest pnpm release and a matching Node engine? |
| litespec/workspace/config#pin-the-react-version-in-the-eslint-flat-config | guidance | Does each React flat config set a concrete `settings.react.version`? |
| litespec/workspace/config#keep-environment-examples-beside-applications | guidance | Does each frontend and host directory hold an environment example with safe values? |
| litespec/workspace/config#keep-local-overrides-untracked | guidance | Are local overrides ignored with no second tracked environment-specific source? |
| litespec/workspace/config#keep-logging-configuration-provider-neutral | guidance | Does application source use only logging abstractions with exporters in hosts? |
| litespec/workspace/config#keep-documentation-directories-out-of-build-artifact-ignore-rules | guidance | Does `git check-ignore` report no match for each documentation directory? |
