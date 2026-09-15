# Validate Standards

## Name

`node tools/validate-standards.mjs` holds the standards repository to its own authoring contract.

## Synopsis

```bash
node tools/validate-standards.mjs [repositoryRoot] [--warnings]
```

## Description

This command is the repository gate for every page, template, and identifier under `docs/`. It reads page contracts and section order, atomic Standards and Convention blocks, provision identity, and controlled prose. It also reads internal links, manifest paths, extension declarations, and the generated provision index.

Run it after changing any page, any template, or any authoring rule.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `repositoryRoot` | no | Selects the standards repository to read. The default is the working directory. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--warnings` | off | Lists every occurrence of a rule the repository is still burning down. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Every authoring check passed. |
| `1` | At least one check reported a defect. |
| `2` | More than one root was passed, or the root is not a directory. |

## Examples

Validate the repository from its root:

```bash
node tools/validate-standards.mjs
```

Validate another checkout and list every warning occurrence:

```bash
node tools/validate-standards.mjs /path/to/standards --warnings
```

## Underneath

The provision-index comparison is separately runnable, and reports the same defect this command reports as `PROVISIONS_STALE`:

```bash
node tools/generate-provisions.mjs --check
```

The remaining checks have no separate entry point. `tools/prose.mjs` and `tools/provisions.mjs` are modules that this command imports, so they run only as part of it.
