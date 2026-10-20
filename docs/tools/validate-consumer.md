# Validate Consumer

## Name

`node litespec/tools/validate-consumer.mjs` holds a consumer repository to the release it pinned.

## Synopsis

```bash
node litespec/tools/validate-consumer.mjs [consumerRoot] [--prose] [--format=json] [--help]
```

## Description

This command reads `litespec.project.json` and every Markdown page under the declared documentation root. It checks the project record against the project schema and the reviewed release against the manifest. It checks the stacks and extensions the project names, every page's frontmatter against the record schema, and each page's required sections. It checks the language record with the prose measures and the rejected words, and the controlled UI through the UI validator.

Prose checks skip fenced generated regions, which only the model builder writes. The builder owns identifier resolution, coverage, traces, and the computed links between records, code, screens, and tests.

Run it from the consumer root after changing a page, a project path, or a language record. The default output names the worst prose files and their dominant measure.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the working directory. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--prose` | off | Lists the measure violations behind each page count, which is what burning a page down needs. |
| `--format=json` | off | Writes one JSON object on standard output, with the problems as an array. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Configuration, frontmatter, language, and prose are valid. |
| `1` | At least one check reported a defect. |
| `2` | The root holds no `litespec.project.json`, an option is unknown, or an input file is unreadable. |

## Examples

Validate the consumer from its root:

```bash
node litespec/tools/validate-consumer.mjs
```

List the prose measures behind a page count:

```bash
node litespec/tools/validate-consumer.mjs --prose
```

## Underneath

`tools/prose.mjs` reads the language record and the prose measures, and `tools/schema.mjs` reads every record against its schema. The command spawns `tools/validate-ui.mjs` with `--format=json` and merges its structured findings.
