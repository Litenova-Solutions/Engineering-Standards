# Validate Consumer

## Name

`node standards/tools/validate-consumer.mjs` holds a consumer repository to the release it pinned.

## Synopsis

```bash
node standards/tools/validate-consumer.mjs [consumerRoot] [--prose]
```

## Description

This command reads `standards.project.json` and every Markdown file under the declared documentation root. It checks Specification Metadata against the metadata schema, identifier grammar, file relationships, extension scope, link resolution, acceptance trace uniqueness, recorded vocabulary, and controlled prose.

Run it from the consumer root after changing a specification, a project path, or a language record.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the working directory. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--prose` | off | Lists the measure violations behind each page count, which is what burning a page down needs. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Metadata is valid, links resolve, and cross-file references are consistent. |
| `1` | At least one check reported a defect. |
| `2` | The root holds no `standards.project.json`. |

## Examples

Validate the consumer from its root:

```bash
node standards/tools/validate-consumer.mjs
```

List the prose measures behind a baselined page:

```bash
node standards/tools/validate-consumer.mjs --prose
```

## Underneath

None.
