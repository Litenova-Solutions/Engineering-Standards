# Scaffold Record

## Name

`litespec new` scaffolds a record page and reserves its identifier, or appends a result or scenario entry to a use-case page.

## Synopsis

```bash
litespec new <type> <id> [--root <path>] [--help]
litespec new result <use-case-id> <name> --outcome success|refusal [--code <code>] [--root <path>]
litespec new scenario <use-case-id> <name> --result <result-id> [--root <path>]
```

## Description

This command creates one record page from the template for its type, with the opening specification metadata block already filled. It reserves the identifier before any prose exists, so two authors working in parallel never mint the same identifier twice. The second author learns the clash at creation and picks another name.

`<type>` is the record type or page style, such as `reaction`, `use-case`, or `decision`. `<id>` is the `home.name` part of the identifier, such as `sales.notify-buyer`; the command composes the full identifier as `<type>/<id>`. The page is written at the home its type owns: a reaction under `modules/<module>/reactions/`, a job under `modules/<module>/jobs/`, a notification under `modules/<module>/notifications/`, a decision under the decisions folder. A use-case page starts under `reads/` beside its module; move the file beside its aggregate once the use case names one. The command refuses an identifier a record already carries.

Run it before writing any new record, as `litespec/core/authoring#scaffold-pages-and-reserve-identifiers` states. Validate the new page before committing it.

`new result` and `new scenario` append one entry to a use-case page's frontmatter records instead of scaffolding a page. The entry lands in house order, successes first, then refusals in precedence order, then scenarios, so a new refusal follows the existing refusals and a new scenario lands last; every other byte of the page stays untouched. The entry id is `result/<use-case>.<name>` or `scenario/<use-case>.<name>` from the use case's own name. `<use-case-id>` is the use-case identifier, with or without the `use-case/` prefix. `--code` is required for a refusal and carries `<module>.<reason>`; on a success it becomes the first of `codes`. `--result` names the scenario's result, written or derived. The command refuses a duplicate id and an unknown use case.

## Arguments

| Argument | Meaning |
|:---|:---|
| `<type>` | The record type or page style to scaffold. |
| `<id>` | The `home.name` part of the identifier to reserve. |
| `<use-case-id>` | For `result` and `scenario`: the use case holding the new entry. |
| `<name>` | For `result` and `scenario`: the kebab-case name of the new entry. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the working directory | Selects the consumer repository to write into. |
| `--outcome success` or `refusal` | none | For `result`: whether the entry ends in success or refusal. |
| `--code <code>` | none | For `result`: the refusal code as `<module>.<reason>`; required for a refusal, the first of `codes` on a success. |
| `--result <result-id>` | none | For `scenario`: the written or derived result the scenario ends in. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | The page was written and the identifier reserved, or the entry was appended. |
| `1` | The release holds no readable template for the type, or the repository could not be read or written. |
| `2` | The identifier is taken, the use case is unknown, the type is unknown, or an option is invalid. |

## Examples

Scaffold a reaction and reserve its identifier:

```bash
litespec new reaction sales.notify-buyer
```

Scaffold a use case in the orders module:

```bash
litespec new use-case orders.cancel-order
```

Append a refusal result to the cancel-order page:

```bash
litespec new result use-case/orders.cancel-order already-shipped --code orders.already-shipped --outcome refusal
```

Append a success result carrying its first code:

```bash
litespec new result orders.cancel-order cancelled --code orders.cancelled --outcome success
```

Append a scenario ending in the new refusal:

```bash
litespec new scenario use-case/orders.cancel-order cancelling-a-shipped-order-is-refused --result result/cancel-order.already-shipped
```

## Underneath

This command reads `templates/consumer/<type>.md` from the release the tool carries and writes the page with its metadata block. The `result` and `scenario` paths read the use-case page instead and splice one entry into its frontmatter records. Nothing beneath this command is separately runnable. Validate the written page before committing it.
