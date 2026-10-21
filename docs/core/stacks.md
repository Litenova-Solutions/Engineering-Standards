# Technology Stacks

## Intent

A stack binds the specification to one technology: a backend stack lives under `backend/`, a frontend stack under `frontend/`. Selecting one applies exactly the rules, version pins, and checks that technology needs. This page states what selecting a stack applies, where its versions come from, and how a replacement names every baseline rule it replaces.

## Concepts

### What a stack folder holds

Each stack lives in one folder with a `stack.md` page: `docs/backend/dotnet/`, `docs/frontend/web/react/`, `docs/frontend/web/svelte/`, and `docs/frontend/blazor/` are the current stacks. The `stack.md` states what the stack adds: its rules, its version pins, and its checks.

Selecting a stack applies its folder and every folder above it, so a stack never restates an inherited principle. A stack folder is one with a `stack.md` page: `frontend/patterns/` has none, so it applies with `frontend/`, while `frontend/web/` applies only through its stacks. [Supported scope](scope.md) states how size, shape, and stacks combine into one selection.

### Versions and replacements

Every SDK, framework, and package version resolves from `litespec.manifest.json`, which owns the pins. A version copied from prose, an example, a package search, or agent memory drifts from that pin.

When an extension or a consumer override replaces baseline behavior, it names every baseline provision ID it replaces. Unrelated stack provisions stay active, so a replacement cannot silently widen its own scope.

## Standards

### Apply the complete stack

**Requirement:** A consumer selecting a stack MUST apply the pages in its folder, every folder above it, and their subfolders that hold no stack.

**Rationale:** The stack is the unit of conformance: a consumer cannot claim a stack while silently omitting an applicable page. Applying the folder, every folder above it, and their stackless subfolders keeps inherited principles in force without restating them. A deeper page replaces only the provisions it names, so everything it leaves unnamed keeps applying.

### Use manifest version pins

**Requirement:** A consumer MUST resolve every SDK, framework, and package version from `litespec.manifest.json`.

**Rationale:** The manifest owns every pin, so resolving versions anywhere else produces builds the standard never described. A version copied from prose, an example, a package search, or agent memory drifts from the pin with the next edit. One resolution source keeps every consumer on the same tested combination.

### Declare replacements

**Requirement:** An extension or consumer override MUST name every baseline provision ID it replaces.

**Rationale:** Naming every replaced provision ID draws the exact boundary of the change: everything unnamed stays active. Without the list, a replacement silently widens its scope with each reading, and reviewers cannot tell which baseline rules still bind the project.

## Conventions

### Keep the stack visible

**Default:** Name each selected stack in `litespec.project.json` and the solution, applications, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Naming each selected stack in `litespec.project.json` with the solution, applications, and commands in the root `AGENTS.md` lets an agent resolve the project placeholders directly. Inferring the selection from the directory tree fails whenever folders outnumber stacks or names overlap. Visible selection also tells a human reader what the project runs before opening any code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/stacks#apply-the-complete-stack | guidance | Does the consumer apply every page in its stack folders and the folders above them? |
| litespec/core/stacks#use-manifest-version-pins | guidance | Does each resolved version match its manifest pin? |
| litespec/core/stacks#declare-replacements | guidance | Does each replacement name every provision ID it replaces? |
| litespec/core/stacks#keep-the-stack-visible | guidance | Do `litespec.project.json` and the root `AGENTS.md` name the selection? |
