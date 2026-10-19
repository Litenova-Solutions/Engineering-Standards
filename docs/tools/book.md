# Book

## Name

`node tools/book/book.mjs` generates the project book, a static website that reads a consumer's `model.json`, so a founder or reviewer reads the whole project model as linked pages.

## Synopsis

```bash
node tools/book/book.mjs --model <model.json> --out <folder> [--findings <file>]
```

## Description

The book generator reads the `model.json` the model builder wrote and writes a self-contained static site: one page per record, one index per record type, one lens per actor, a review page, a glossary, and a search page. Every count on every page is computed from `model.json` at generation time; none is typed.

The home page shows the product record, the record counts by type, the use-case status totals, and the entry links per layer. A record page shows the authority strip with the record's place in the precedence order, its status, owner, decider and decide-by date, and for a use case its computed `implemented` and `verified` state; then its fields, its links in both directions, and the computed `implements`, `calls` and `proves` links with the code path, the route path and the test name. A use-case page lists its Results and its Cases with each Case's proof state. A lens shows the journeys its actor takes, the roles it holds at which scope, the permissions those allow, and the use cases those permissions open. The review page lists every Known gap with owner and end date, expired ones first, every draft record awaiting a decider by decide-by date, and every finding. The site needs no server: open the output folder's `index.html` in a browser.

Review mode is a toggle in the header. When it is on, every record page shows the review notes that touch it: its own draft state, the Known gaps about it, and the findings about it. The review page always shows everything.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--model <model.json>` | — | Reads this model file. Required. |
| `--out <folder>` | — | Writes the static site to this folder, creating it. Required. |
| `--findings <file>` | — | Reads the JSON output of the model check (`check --format json`) for the review page. When absent, the review page lists findings from `model.json` itself when it carries them, and otherwise says none were supplied. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The site was written. |
| `1` | The model file is missing or unreadable, the findings file is missing or unreadable, or the output folder cannot be written. |
| `2` | The arguments are wrong. |

## Examples

Generate the book for a consumer whose model is built:

```bash
node tools/book/book.mjs --model ../consumer/.model/model.json --out ../consumer/.book
```

Generate it with the check findings on the review page:

```bash
dotnet run --project tools/model/Litenova.Model -- check --root ../consumer --format json > /tmp/findings.json
node tools/book/book.mjs --model ../consumer/.model/model.json --out ../consumer/.book --findings /tmp/findings.json
```

## Underneath

The generator is plain Node with no dependencies and no build step. It copies `assets/book.css` and `assets/book.js` into the output beside the pages it writes, writes `search.json`, the title and id index the search page filters, and embeds that same index in the search page so search works when the site opens as files. Nothing beneath it is separately runnable. The fixtures under `tools/book/fixtures/` carry a small hand-written model and findings file in the exact shapes the generator reads.
