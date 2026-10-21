# Draw Patterns

## Name

`litespec patterns` draws, prints and checks the wireframes on the UI pattern pages.

## Synopsis

```bash
litespec patterns preview <target> [--out <file>]
litespec patterns svg <pattern-id> <option-id> [--phone]
litespec patterns check [<target>]
```

## Description

A pattern page in `docs/frontend/patterns/` offers several options for one recurring interface question, and each option carries its wireframe as text. An agent reads the text. A person chooses from the pictures this command draws.

`preview` writes one offline HTML page for a group or a single pattern. Every option is drawn at desktop width, 1200 pixels, and at phone width, 390 pixels, beside its rationale and cost. The default option is outlined, and selecting a picture opens it at full size. The page loads nothing from the network.

`svg` prints one option's sketch on standard output, for a site or a document that embeds it. `--phone` draws the phone width, from the option's own phone block when it has one.

`check` parses every pattern page, or the target's page, and reports each broken wireframe and each gap in the page contract with its page line. `litespec validate` runs the same check.

## Arguments

| Argument | Meaning |
|:---|:---|
| `<target>` | A group such as `record-detail`, a pattern ID such as `litespec/frontend/patterns/record-detail#record-header`, or the path of a pattern page. |
| `<pattern-id>` | A pattern ID. |
| `<option-id>` | One option ID of that pattern. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--out <file>` | `litespec/patterns/<group>.html` in the system temp folder | Selects the file `preview` writes. |
| `--phone` | off | Draws the phone width in `svg`. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The page was written, the sketch was printed, or the check found no problem. |
| `1` | A page or a wireframe has a problem. `preview` still writes the page and lists the problems. |
| `2` | The subcommand, a target, a pattern or an option is unknown. |

## Examples

Draw every record detail pattern:

```bash
litespec patterns preview record-detail
```

Print the default record header at phone width:

```bash
litespec patterns svg litespec/frontend/patterns/record-detail#record-header title-state-breadcrumb-one-primary-action --phone
```

## Underneath

The command parses each fenced `wireframe` block with the language defined in [UI pattern decisions](../frontend/patterns.md) and lays it out with a dependency-free box layout. The command estimates text width from the character count, so the sketch needs no font. Nothing beneath it is separately runnable.
