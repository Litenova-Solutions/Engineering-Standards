# Book

## Name

`litespec book` generates the project book: a static website built from a consumer's `model.json` that presents the project model as linked pages for founders and reviewers.

## Synopsis

```bash
litespec book --model <model.json> --out <folder> [--findings <file>]
```

## Description

The book generator reads the `model.json` file that `litespec model build` wrote and writes a self-contained static site from it. The site holds one page per record, one index per record type, one lens per actor, a review page, a glossary, and a search page. A lens is the site's view of one actor: the journeys that actor takes, the roles it holds, and the permissions with the use cases they open. Every count on every page is computed from `model.json` when the site is generated; no count is typed by hand.

The home page shows the product record, the record counts by type, the use case status totals, and the entry links per layer. A record page opens with an authority strip: the record's place in the precedence order, its status, owner, decider, and decide-by date. A use case page adds the computed `implemented` and `verified` state, then lists the use case's results and its cases with each case's proof state. Below the strip come the record's fields, its links in both directions, and the computed `implements`, `calls`, and `proves` links with their code, route, and test names.

The review page lists every known gap with owner and end date, expired gaps first. It also lists every draft record that awaits a decider, ordered by decide-by date, and every finding. A toggle in the header switches review mode on; when it is on, each record page shows the review notes that touch it: its draft state, its known gaps, and its findings. The review page always shows everything, with or without the toggle. The site needs no server: open the output folder's `index.html` in a browser.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--model <model.json>` | none | Reads this model file. Required. |
| `--out <folder>` | none | Writes the static site to this folder, creating it. Required. |
| `--findings <file>` | none | Shows these findings on the review page instead of the ones in `model.json`. |
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

The command copies its stylesheet and script into the output folder beside the pages it writes. It writes `search.json`, an index of record titles and identifiers, and embeds that same index in the search page, so search works when the site is opened as files. Nothing beneath this command is separately runnable.
