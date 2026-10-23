# Rename Record

## Name

`litespec rename` renames a record identifier and rewrites every link.

## Synopsis

```bash
litespec rename <old> <new> [--root <path>] [--help]
```

## Description

This command renames one record identifier across the consumer repository. It moves the page to the path the new identifier owns, updates the opening specification metadata block, and rewrites every citation of the old identifier, so no link points at the old name after the rename. The repository stays resolvable at every commit.

Both arguments are full record identifiers, such as `use-case/sales.close-sale`. The command refuses a new identifier a record already carries and an old identifier no record carries.

Run it for every identifier rename, as `litespec/core/authoring#rewrite-every-link-on-a-rename` states. Never rename by moving the file by hand.

## Arguments

| Argument | Meaning |
|:---|:---|
| `<old>` | The full identifier the record carries today. |
| `<new>` | The full identifier the record takes. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the working directory | Selects the consumer repository to change. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The identifier was renamed and every link rewritten. |
| `1` | The run failed after the checks passed. |
| `2` | The old identifier names no record, the new identifier is taken, or an option is unknown. |

## Examples

Rename a use case and rewrite every citation together:

```bash
litespec rename use-case/sales.close-sale use-case/sales.complete-sale
```

## Underneath

Nothing beneath this command is separately runnable.
