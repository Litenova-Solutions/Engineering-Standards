# Book

## Name

`litespec book` generates the project book, a static website that reads a consumer's `model.json`, so a founder or reviewer reads the project model as linked pages.

## Synopsis

```bash
litespec book --model <model.json> --out <folder> [--findings <file>]
```

## Description

The book generator reads the `model.json` the model builder wrote and writes a self-contained static site. The site holds one page per record, one index per record type, one lens per actor, a review page, a glossary, and a search page. Every count on every page is computed from `model.json` at generation time; none is typed.

The home page shows the product record, the record counts by type, the use-case status totals, and the entry links per layer. A record page shows the authority strip with the record's place in the precedence order, its status, owner, decider and decide-by date. For a use case it adds the computed `implemented` and `verified` state. Then come its fields, its links in both directions, and the computed `implements`, `calls` and `proves` links with their code, route and test names. A use-case page lists its Results and its Cases with each Case's proof state.

A lens shows the journeys its actor takes, the roles it holds at each scope, and the permissions with the use cases they open. The review page lists every Known gap with owner and end date, expired ones first. It also lists every draft record awaiting a decider by decide-by date, and every finding. The site needs no server: open the output folder's `index.html` in a browser.

Review mode is a toggle in the header. When it is on, every record page shows the review notes that touch it. Those notes name its own draft state, the Known gaps about it, and the findings about it. The review page always shows everything.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--model <model.json>` | none | Reads this model file. Required. |
| `--out <folder>` | none | Writes the static site to this folder, creating it. Required. |
| `--findings <file>` | none | Reads the model-check JSON for the review page, else findings from `model.json`, else none. |
| `--help` | off | Prints the usage text and exits 0. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The site was written. |
| `1` | The model or findings file is missing or unreadable, or the output folder cannot be written. |
| `2` | The arguments are wrong. |

## Examples

Generate the book for a consumer whose model is built:

```bash
litespec book --model ../consumer/.model/model.json --out ../consumer/.book
```

Generate it with the check findings on the review page:

```bash
litespec model check --root ../consumer --format json > /tmp/findings.json
litespec book --model ../consumer/.model/model.json --out ../consumer/.book --findings /tmp/findings.json
```

## Underneath

It copies its stylesheet and script into the output beside the pages it writes. It writes `search.json`, the title and id index the search page filters. It embeds that same index in the search page so search works when the site opens as files. Nothing beneath it is separately runnable. The book fixtures under `apps/cli/tests/LiteSpec.Cli.Tests/` hold the model and findings for the large library fixture with one use case left unimplemented.
