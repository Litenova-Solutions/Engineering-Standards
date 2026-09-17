# Validate Controlled UI

## Name

`node standards/tools/validate-ui.mjs` holds an opted-in React web consumer to the controlled UI contract.

## Synopsis

```bash
node standards/tools/validate-ui.mjs [consumerRoot]
```

## Description

This command reads the UI configuration each frontend declares. It then checks vocabulary records, design contracts, composition recipes, page contracts, acceptance records, source locks, CSS boundaries, and visual-system ownership.

A consumer with no React web UI configuration passes, and the output names every frontend the run skipped together with the platform each one declared.

The run also reports how many composition recipes the catalog holds, which of them no page names, and which one page names. A recipe with one consumer is reported rather than refused, because `FRONTEND.UI.CONVENTION.003` states a default a consumer can replace.

Three checks read the application source rather than the specification tree. The frozen-plan check resolves each route from the tree under `app`. It follows the imports that route makes inside its own frontend. It reports every `data-region` value the sidecar does not name. The acceptance check reads the record in the `evidence` directory beside that route. The state check resolves each declared state to a component the vocabulary maps it to.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the working directory. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--format=json` | off | Writes one JSON object on standard output, with the problems as an array. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The UI contract holds, or no React web UI configuration is present. |
| `1` | At least one check reported a defect. |
| `2` | The root holds no `standards.project.json`. |

## Examples

Validate the consumer from its root:

```bash
node standards/tools/validate-ui.mjs
```

## Underneath

None.
