# Validate Consumer

## Name

`litespec consumer` holds a consumer repository to the release it pinned.

## Synopsis

```bash
litespec consumer [--root <path>] [--format json] [--help]
```

## Description

This command reads `litespec.project.json` and every Markdown page under the declared documentation root. It checks the project record against the project schema and the reviewed release against the manifest. It checks the stacks and extensions the project names, every page's frontmatter against the record schema, and each page's required sections. It checks the language record and every page and declared surface against its rejected words and mannered terms, and the controlled UI through the UI validator.

The language checks skip fenced generated regions, which only the model builder writes. The builder owns identifier resolution, coverage, traces, and the computed links between records, code, screens, and tests.

Run it from the consumer root after changing a page, a project path, or a language record.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the working directory | Selects the consumer repository to read. |
| `--format json` | off | Writes one JSON object on standard output, with the problems as an array. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Configuration, frontmatter and language are valid. |
| `1` | At least one check reported a defect. |
| `2` | The root holds no `litespec.project.json`, an option is unknown, or an input file is unreadable. |

## Examples

Validate the consumer from its root:

```bash
litespec consumer
```

Write the result as JSON for another tool:

```bash
litespec consumer --format json
```

## Underneath

This command runs the controlled UI check in-process and merges its findings. Run that check alone as `litespec ui`. The language and schema checks run only as part of this command.
