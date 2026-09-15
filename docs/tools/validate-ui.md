# Validate Controlled UI

## Name

`node standards/tools/validate-ui.mjs` holds an opted-in React web consumer to the controlled UI contract.

## Synopsis

```bash
node standards/tools/validate-ui.mjs [consumerRoot]
```

## Description

This command reads the UI configuration each frontend declares, then checks vocabulary records, page contracts, source locks, CSS boundaries, and visual-system ownership.

A consumer with no React web UI configuration passes, and the output names every frontend the run skipped together with the platform each one declared.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the working directory. |

## Options

None.

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
