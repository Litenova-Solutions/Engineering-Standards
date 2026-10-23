# Scaffold Record

## Name

`litespec new` scaffolds a record page and reserves its identifier.

## Synopsis

```bash
litespec new <type> <id> [--root <path>] [--help]
```

## Description

This command creates one record page from the template for its type, with the opening specification metadata block already filled. It reserves the identifier before any prose exists, so two authors working in parallel never mint the same identifier twice. The second author learns the clash at creation and picks another name.

`<type>` is the record type or page style, such as `reaction`, `use-case`, or `decision`. `<id>` is the `home.name` part of the identifier, such as `sales.notify-buyer`; the command composes the full identifier as `<type>/<id>`. The page is written at the home its type owns: a reaction under `modules/<module>/reactions/`, a job under `modules/<module>/jobs/`, a notification under `modules/<module>/notifications/`, a decision under the decisions folder. A use-case page starts under `reads/` beside its module; move the file beside its aggregate once the use case names one. The command refuses an identifier a record already carries.

Run it before writing any new record, as `litespec/core/authoring#scaffold-pages-and-reserve-identifiers` states. Validate the new page before committing it.

## Arguments

| Argument | Meaning |
|:---|:---|
| `<type>` | The record type or page style to scaffold. |
| `<id>` | The `home.name` part of the identifier to reserve. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the working directory | Selects the consumer repository to write into. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The page was written and the identifier reserved. |
| `1` | The release holds no readable template for the type. |
| `2` | The identifier is taken, the type is unknown, or an option is unknown. |

## Examples

Scaffold a reaction and reserve its identifier:

```bash
litespec new reaction sales.notify-buyer
```

Scaffold a use case in the orders module:

```bash
litespec new use-case orders.cancel-order
```

## Underneath

This command reads `templates/consumer/<type>.md` from the release the tool carries and writes the page with its metadata block. Nothing beneath this command is separately runnable. Validate the written page before committing it.
