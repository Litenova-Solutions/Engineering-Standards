# Validate Controlled UI

## Name

`node standards/tools/validate-ui.mjs` holds an opted-in React web consumer to the controlled UI contract.

## Synopsis

```bash
node standards/tools/validate-ui.mjs [consumerRoot]
```

## Description

This command reads the UI configuration each frontend declares. It then checks vocabulary records, design contracts, source locks, CSS boundaries, and visual-system ownership.

A consumer with no React web UI configuration passes, and the output names every frontend the run skipped together with the platform each one declared.

The source scan reads the application source once per frontend. It rejects an arbitrary Tailwind value, a raw palette value, an important modifier, and an authored CSS file outside the global entry. It also rejects an undeclared inline style and a direct primitive vendor import outside the primitive boundary.

The command reads no page file. The route code is the page contract, and the route suite proves each route in a browser.

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
