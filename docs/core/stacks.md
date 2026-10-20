# Stacks

## Intent

A stack is one technology's binding of the specification, held in one folder: a backend stack under `backend/`, a frontend stack under `frontend/`. Selecting a stack applies its folder and every folder above it, so a stack never restates an inherited principle ([Supported scope](scope.md)). Each stack folder holds a `stack.md` that states what the stack adds: its rules, its pins, and its checks. These rules govern every stack selection.

## Agent Summary {#agent-summary}

- Selecting a stack applies its folder and every folder above it. (litespec/core/stacks#apply-the-complete-stack)
- Versions resolve from the manifest. (litespec/core/stacks#use-manifest-version-pins)
- A replacement names every provision ID it replaces. (litespec/core/stacks#declare-replacements)

## Standards

### Apply the complete stack

**Requirement:** A consumer selecting a stack MUST apply every page in the stack's folder and in each folder above it.

**Rationale:** A consumer cannot claim a stack while silently omitting an applicable page, because the stack is the unit of conformance. A deeper page replaces only the provisions it names.

### Use manifest version pins

**Requirement:** A consumer MUST resolve every SDK, framework, and package version from `litespec.manifest.json`.

**Rationale:** A version copied from prose, an example, a package search, or agent memory drifts from the pin that the manifest owns.

### Declare replacements

**Requirement:** An extension or consumer override MUST name every baseline provision ID it replaces.

**Rationale:** Unrelated stack provisions then stay active, so a replacement cannot silently widen its own scope.

## Conventions

### Keep the stack visible

**Default:** Name each selected stack in `litespec.project.json` and the solution, applications, and commands in the root `AGENTS.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An agent then resolves the project placeholders without inferring them from the directory tree.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/stacks#apply-the-complete-stack | guidance | Does the consumer apply every page in its stack folders and the folders above them? |
| litespec/core/stacks#use-manifest-version-pins | guidance | Does each resolved version match its manifest pin? |
| litespec/core/stacks#declare-replacements | guidance | Does each replacement name every provision ID it replaces? |
| litespec/core/stacks#keep-the-stack-visible | guidance | Do `litespec.project.json` and the root `AGENTS.md` name the selection? |
