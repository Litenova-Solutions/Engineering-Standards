# Stacks

## Intent

LiteSpec has two layers. The specification on this page's Composition applies to every consumer, whatever its languages. A stack binding applies when a consumer selects it: one backend stack, and one stack per frontend ([Supported scope](../core/scope.md)). Each stack page states what selecting it adds: its pages, its pins, and its checks. These rules govern every stack selection.

## Agent Summary {#agent-summary}

- Selecting a stack applies every page that stack lists. (litespec/rule/profile-stacks.apply-the-complete-stack)
- Versions resolve from the manifest. (litespec/rule/profile-stacks.use-manifest-version-pins)
- A replacement names every provision ID it replaces. (litespec/rule/profile-stacks.declare-replacements)

## Standards

### Apply the complete stack (litespec/rule/profile-stacks.apply-the-complete-stack)

**Requirement:** A consumer selecting a stack MUST apply every page that stack lists in the manifest.

**Rationale:** A consumer cannot claim a stack while silently omitting an applicable page, because the stack is the unit of conformance.

### Use manifest version pins (litespec/rule/profile-stacks.use-manifest-version-pins)

**Requirement:** A consumer MUST resolve every SDK, framework, and package version from `litespec.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements (litespec/rule/profile-stacks.declare-replacements)

**Requirement:** An extension or consumer override MUST name every baseline provision ID it replaces.

**Rationale:** Unrelated stack provisions then stay active, so a replacement cannot silently widen its own scope.

## Composition

Every consumer applies these pages, whatever its stacks.

### Stack

- [Stacks](stacks.md)

### Core

- [LiteSpec](../core/system.md)
- [The Project Model](../core/model.md)
- [Engineering Principles](../core/principles.md)
- [Supported Scope](../core/scope.md)
- [Product Intent](../core/product.md)
- [Agent Operating Protocol](../core/agent.md)
- [Authoring Standard](../core/authoring.md)
- [Maintaining the Standards](../core/maintaining.md)
- [Release Standard](../core/release.md)

### Workspace

- [Workspace Structure](../workspace/structure.md)
- [Naming and Code Style](../workspace/naming.md)
- [Dependencies](../workspace/dependencies.md)
- [Configuration](../workspace/config.md)

### Backend

- [Backend Architecture](../backend/architecture.md)
- [Domain Layer](../backend/domain.md)
- [Application Layer](../backend/application.md)
- [Persistence](../backend/persistence.md)
- [HTTP API](../backend/api.md)
- [Backend Testing](../backend/testing.md)
- [Record Identifiers](../backend/identifiers.md)

### Quality and operations

- [Security](../quality/security.md)
- [Operations](../quality/operations.md)
- [Continuous Integration](../quality/ci.md)

## Conventions

### Keep the stack visible (litespec/rule/profile-stacks.keep-the-stack-visible)

**Default:** Name each selected stack in `litespec.project.json` and the solution, applications, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/profile-stacks.apply-the-complete-stack | guidance | Does the consumer apply every page its stacks list? |
| litespec/rule/profile-stacks.use-manifest-version-pins | guidance | Does each resolved version match its manifest pin? |
| litespec/rule/profile-stacks.declare-replacements | guidance | Does each replacement name every provision ID it replaces? |
| litespec/rule/profile-stacks.keep-the-stack-visible | guidance | Do `litespec.project.json` and the root `AGENTS.md` name the selection? |
