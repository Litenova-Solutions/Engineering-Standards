# Validate Standards

## Name

`litespec validate` holds the LiteSpec repository to its own authoring contract.

## Synopsis

```bash
litespec validate [--root <path>] [--warnings] [--format json] [--help]
```

## Description

This command is the repository gate for every page, template, and identifier under `docs/`. It reads page contracts and section order, atomic Standards and Convention blocks, provision identity, pattern pages and their wireframes, verification marks, and ASCII prose. It also reads internal links, manifest paths, extension declarations, and the generated provision index.

Run it after changing any page, any template, or any authoring rule.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the LiteSpec checkout the tool ships in | Selects the LiteSpec repository to read. |
| `--warnings` | off | Lists every occurrence of a rule the repository is still burning down. |
| `--format json` | off | Writes one JSON object on standard output, with the errors and warnings as arrays. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Every authoring check passed. |
| `1` | At least one check reported a defect. |
| `2` | The usage is invalid, or an input file is unreadable. |

## Examples

Validate the repository from its root:

```bash
litespec validate
```

Validate another checkout and list every warning occurrence:

```bash
litespec validate --root ../standards --warnings
```

## Underneath

The provision-index comparison is separately runnable, and reports the same defect this command reports as `PROVISIONS_STALE`:

```bash
litespec provisions --check
```

The remaining checks have no separate entry point. They run only as part of this command.
