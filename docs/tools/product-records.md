# Product Records

## Name

`node standards/tools/product-records.mjs` writes the History section of every product topic page and reports which product rules the documentation cites.

## Synopsis

```bash
node standards/tools/product-records.mjs [consumerRoot] [--write] [--coverage] [--format=json]
```

## Description

A product topic page states its past as a list of the decisions that set it. That list is derived from the `affects` field of each decision record, so this command writes it and nobody types it.

With no option, the command reports each topic page whose History section differs from the decisions that name it. With `--write`, it rewrites those sections in place. With `--coverage`, it lists every product rule with the pages outside `docs/product/` that cite it. A rule nothing cites is intent the system does not carry yet.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the current directory, which holds `standards.project.json`. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--write` | off | Rewrites each stale History section in place. |
| `--coverage` | off | Lists each product rule with its citing pages, and counts the rules nothing cites. |
| `--format=json` | off | Writes one JSON object with the stale pages and the coverage list. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | No History section is stale, or `--write` rewrote them. |
| `1` | At least one History section is stale and `--write` was not given. |
| `2` | The arguments are wrong or `standards.project.json` is missing. |

## Examples

Write every History section after adding or retiring a decision:

```bash
node standards/tools/product-records.mjs --write
```

List the product rules and the specifications that cite them:

```bash
node standards/tools/product-records.mjs --coverage
```

## Underneath

`tools/product.mjs` reads the product topic pages and the decision records. The consumer validator reads through the same module, so the section this command writes is the section the validator accepts.
