# Generate Provisions

## Name

`litespec provisions` writes the provision index that resolves every identifier to its page.

## Synopsis

```bash
litespec provisions [--root <path>] [--check] [--help]
```

## Description

This command rebuilds `docs/reference/provisions.md` from the active standards, so a citation reaches its heading in one step. The page carries each provision with its verification mark and its evidence.

Run it after adding, renaming, or removing a provision. The next run overwrites a hand edit, so never edit the page directly.

## Arguments

None.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the LiteSpec checkout the tool ships in | Selects the LiteSpec repository to read. |
| `--check` | off | Compares the page with the active standards and writes nothing. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The page was written, or `--check` found it current. |
| `1` | `--check` found the page stale. |
| `2` | The usage is invalid. |

## Examples

Rebuild the page after a provision change:

```bash
litespec provisions
```

Compare without writing, which is what continuous integration runs:

```bash
litespec provisions --check
```

## Underneath

`litespec validate` reads the same builder and reports a stale page as `PROVISIONS_STALE`. Nothing beneath this command is separately runnable.
