# Generate Provisions

## Name

`node tools/generate-provisions.mjs` writes the provision index that resolves every identifier to its page.

## Synopsis

```bash
node tools/generate-provisions.mjs [repositoryRoot] [--check]
```

## Description

`docs/reference/provisions.md` is derived from the active standards. This command rebuilds it, so a citation reaches its heading in one step.

Run it after adding, renaming, or removing a provision. A hand edit is overwritten on the next run.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `repositoryRoot` | no | Selects the standards repository to read. The default is the repository holding this command. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--check` | off | Compares the page with the active standards and writes nothing. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The page was written, or `--check` found it current. |
| `1` | `--check` found the page stale. |

## Examples

Rebuild the page after a provision change:

```bash
node tools/generate-provisions.mjs
```

Compare without writing, which is what continuous integration runs:

```bash
node tools/generate-provisions.mjs --check
```

## Underneath

`tools/provisions.mjs` builds the page content, and both this command and the repository validator call it. It is a module rather than a command, so nothing beneath this command is separately runnable.
