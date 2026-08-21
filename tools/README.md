# Standards Tools

## Intent

The repository ships dependency-free Node validators for standards authors and consumer repositories.

## Validate Standards

Run the standards repository validator from its root:

```bash
node tools/validate-standards.mjs
```

An optional argument selects another repository root:

```bash
node tools/validate-standards.mjs /path/to/standards
```

The validator checks:

- Page contracts and section order.
- Atomic Standards and Convention blocks.
- Provision IDs, summaries, and evidence rows.
- Controlled prose limits and ASCII text.
- Internal links, anchors, and manifest paths.
- Extension declarations and profile composition.
- The two tracked schema consumers.
- The declared provision identity registry.
- The generated provision index.
- Current standards material.

Exit code `0` means pass. Code `1` means validation failed. Code `2` means the input or command usage is invalid.

Some rules report a defect the repository is still burning down. Those rules print as warnings and do not fail the build:

```bash
node tools/validate-standards.mjs --warnings
```

`WARNING_DIAGNOSTIC_CODES` in the validator lists them. It is currently empty, because every rule is an error.

Run its fixture suite after changing authoring rules or validator behavior:

```bash
node tools/validate-standards.cases.mjs
```

## Generate the Provision Index

`docs/reference/provisions.md` resolves every provision ID to its heading and owning page. It is derived, so regenerate it after any provision change:

```bash
node tools/generate-provisions.mjs
```

Pass `--check` to compare without writing. The command exits `1` when the page and the active standards disagree, and the repository validator reports the same defect as `INDEX_PROVISIONS_STALE`.

```bash
node tools/generate-provisions.mjs --check
```

`tools/provision-index.mjs` builds the page content. The generator and the validator both call it, so the checked-in page and its gate cannot disagree.

## Validate a Consumer

Run the consumer validator from a repository containing `standards.project.json`:

```bash
node standards/tools/validate-consumer.mjs
```

The validator checks Specification Metadata, identifiers, file relationships, extension scope, links, and acceptance trace uniqueness.

An optional argument selects another consumer root.

Run its fixture suite after changing a consumer rule, a specification kind, or a tracked template:

```bash
node tools/validate-consumer.cases.mjs
```

The suite builds a throwaway consumer from the tracked templates, so a template that drifts from the metadata schema fails the baseline case.

## Validate Controlled UI

Run the UI validator from an opted-in React web consumer:

```bash
node standards/tools/validate-ui.mjs
```

The validator checks UI configuration, vocabulary, page contracts, source locks, CSS boundaries, and visual-system ownership.

Run its fixture suite after changing a UI rule, schema, template, or validator:

```bash
node tools/validate-ui.cases.mjs
```

Reference validators do not run application builds, browser tests, deployment checks, or operating evidence gates.
