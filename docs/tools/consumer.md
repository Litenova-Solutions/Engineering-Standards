# Validate Consumer

## Name

`litespec consumer` checks a consumer repository against the LiteSpec release it pinned.

## Synopsis

```bash
litespec consumer [--root <path>] [--format json] [--help]
```

## Description

This command reads `litespec.project.json` at the consumer root and every Markdown page under the documentation root that record declares. It checks the project record against the project schema, and the adopted release in `reviewedLiteSpecVersion` against the manifest. It checks the stacks and extensions the project names. It checks each page's specification metadata block against the record schema, and each page's required sections. It checks the glossary, every page, and every declared surface against rejected words and mannered terms. It checks the controlled UI by running the UI validator.

The glossary checks skip fenced generated regions, which only the model builder writes. The builder owns identifier resolution, coverage, traces, and the computed links between records, code, screens, and tests.

Run this command from the consumer root after changing a page, a project path, or a glossary entry.

## Arguments

None.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--root <path>` | the working directory | Selects the consumer repository to read. |
| `--format json` | off | Writes one JSON object on standard output, with the problems as an array. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | Configuration, specification metadata, and glossary are valid. |
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

This command runs the controlled UI check in-process and merges its findings. Run that check alone as `litespec ui`. The glossary and schema checks run only as part of this command.
