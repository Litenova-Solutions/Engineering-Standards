# Product Records

## Name

`node standards/tools/product-records.mjs` writes each History section, reports product-rule coverage, and refuses the gaps a trace baseline does not accept.

## Synopsis

```bash
node standards/tools/product-records.mjs [consumerRoot] [--write] [--coverage] [--check] [--baseline <file>] [--format=json]
```

## Description

A product topic page states its past as a list of the decisions that set it. That list is derived from the `affects` field of each decision record, so this command writes it and nobody types it.

With no option, the command reports each topic page whose History section differs from the decisions that name it. With `--write`, it rewrites those sections in place. With `--coverage`, it lists every product rule with the pages outside `docs/product/` that cite it. A rule nothing cites is intent the system does not carry yet. With `--check`, it refuses instead of listing. An uncarried rule and a rule-less aggregate each fail unless the trace baseline names them, and a stale entry fails too.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the current directory, which holds `standards.project.json`. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--write` | off | Rewrites each stale History section in place. |
| `--coverage` | off | Lists each product rule with its citing pages, and counts the rules nothing cites. |
| `--check` | off | Fails on an unlisted gap or a stale baseline entry, in both trace directions. |
| `--baseline <file>` | none | Reads the trace baseline from this consumer-root-relative file for `--check`. |
| `--format=json` | off | Writes one JSON object with the stale pages and the coverage list. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | No History section is stale, `--write` rewrote them, and `--check` found nothing. |
| `1` | At least one History section is stale and `--write` was not given, or `--check` found a gap. |
| `2` | The arguments are wrong or `standards.project.json` is missing. |

## Examples

Write every History section after adding or retiring a decision:

```bash
node standards/tools/product-records.mjs --write
```

Refuse the trace gaps the baseline does not accept:

```bash
node standards/tools/product-records.mjs --check --baseline docs/product-trace-baseline.json
```

The baseline names the accepted gaps by rule id and aggregate id, each with a reason. A reason opens with one fixed prefix: Company practice, Refusal, Planned, Carried not yet cited, Missing, Engineering only, or Not yet cited.

```json
{
  "rules": { "product/pricing.launch-discount": { "reason": "Planned: the launch discount ships with the spring release." } },
  "aggregates": { "aggregate/order": { "reason": "Engineering only: the order aggregate carries no buyer promise." } }
}
```

List the product rules and the specifications that cite them:

```bash
node standards/tools/product-records.mjs --coverage
```

## Underneath

`tools/product.mjs` reads the product topic pages and the decision records. The consumer validator reads through the same module, so the section this command writes is the section the validator accepts.
