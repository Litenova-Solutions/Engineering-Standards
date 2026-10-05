# Validate Controlled UI

## Name

`node standards/tools/validate-ui.mjs` holds an opted-in React web consumer to the controlled UI contract.

## Synopsis

```bash
node standards/tools/validate-ui.mjs [consumerRoot]
```

## Description

This command reads the shared UI package the consumer declares in `paths.uiPackage`. It checks the registry configuration against the manifest baseline, the source lock and its digests, the design contract, and the token stylesheet. It then checks each controlled frontend: its density profile, its stylesheet entry, the imports its source reaches, and its inline styles.

A controlled frontend is one declaring `platform: react-web`. The package travels with the workspace rather than with an application, so one package is read once however many frontends compose it. A frontend declaring another platform is named in the output as skipped, so a skipped scope is visible rather than reported as conformance.

The source scan reads the shared package once, then each controlled frontend once. It rejects an arbitrary Tailwind value, a raw palette value, an important modifier, and an inline style. In an application it also rejects a direct primitive library import, an internal package path, and a direct table library import.

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
| `0` | The UI contract holds, or no controlled React web frontend is present. |
| `1` | At least one check reported a defect. |
| `2` | The root holds no `standards.project.json`. |

## Examples

Validate the consumer from its root:

```bash
node standards/tools/validate-ui.mjs
```

## Underneath

None.
