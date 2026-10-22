# Book

## Name

`litespec book` generates the project book: a static website built from a consumer's `model.json` that presents the project model as linked pages for reviewers.

## Synopsis

```bash
litespec book --model <model.json> --out <folder> [--findings <file>]
```

## Description

The book generator reads the `model.json` file that `litespec model build` wrote and writes a self-contained static site from it. The site holds one page per record, one index per record type, one lens per actor, one lens per goal, a goals index, a review page, a glossary, and a search page. A lens is the site's view of one actor or one goal: an actor lens lists the journeys that actor takes, the roles it holds, and the permissions with the use cases they open; a goal lens lists the features that serve the goal, each with its requirements and their verified state. Every count on every page is computed from `model.json` when the site is generated; no count is typed by hand.

The book renders each record's prose body, and every field has a typed renderer that writes words and tables, so raw JSON never reaches a reviewer.

An aggregate page shows its lifecycle as a generated state diagram with a From, To, Triggered By table of its transitions, and marks each state past the start that no transition reaches. Its data table names each field with its meaning and its handling in words. A use case page lists its results and scenarios as Given, When, Then sentences with their example tables and each scenario's last proof date. A goal lens shows the chain from the goal to its features to each requirement with its kind and its verified or awaiting-proof state, with the verified count beside the total.

Reviewer pages show no identifiers, codes, file paths, or check names: record links show titles, and refusals and checks read as words. A Developer toggle in the header reveals the identifiers, codes, file paths, and check names, with a Developer section on each record page. A Review toggle shows the review notes that touch each page: its draft state, its known gaps, and its findings. The review page always shows everything, with or without the toggle: every known gap with owner and end date, expired gaps first; every draft record that awaits a decider, ordered by decide-by date; every open question; and every finding.

Search covers titles with statements, meanings, and scenario text. The site needs no server: open the output folder's `index.html` in a browser.

## Arguments

None.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--model <model.json>` | none | Reads this model file. Required. |
| `--out <folder>` | none | Writes the static site to this folder, creating it. Required. |
| `--findings <file>` | none | Shows these findings on the review page instead of the ones in `model.json`. |
| `--help` | off | Prints the usage text and exits 0. |

## Exit Codes

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

The command copies its stylesheet, its script, and the vendored Mermaid script with its version file into the output folder's `assets` beside the pages it writes. It writes `search.json`, an index of record titles with statements, meanings, and scenario text, and embeds that same index in the search page, so search works when the site is opened as files. Nothing beneath this command is separately runnable.
