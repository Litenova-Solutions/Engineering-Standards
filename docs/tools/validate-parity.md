# Validate Use-Case Parity

## Name

`node standards/tools/validate-parity.mjs` compares Application operation folders with use-case specifications.

## Synopsis

```bash
node standards/tools/validate-parity.mjs [consumerRoot] [--report] [--format=json] [--help]
```

## Description

This command reads both directions of the comparison. It reports a handler that no specification covers, and an implemented specification that no handler covers. A `planned` specification with no handler is correct and is not reported.

A consumer whose project declares no `paths.apiSolution` skips the check and passes. The `parity` block of `standards.project.json` names the Application project and carries the two ignore lists.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `consumerRoot` | no | Selects the consumer repository to read. The default is the working directory. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--report` | off | Prints the same findings and exits zero, for a consumer burning down a backlog. |
| `--format=json` | off | Writes one JSON object on standard output, with the findings as an array. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Both directions agree, the check was skipped, or `--report` was passed. |
| `1` | At least one operation or specification has no counterpart. |
| `2` | The usage is invalid, or a declared parity path does not resolve. |

## Examples

Fail the run on a gap, which is the default:

```bash
node standards/tools/validate-parity.mjs
```

List the gap without failing:

```bash
node standards/tools/validate-parity.mjs /path/to/consumer --report
```

Read the findings from another program:

```bash
node standards/tools/validate-parity.mjs --format=json
```

## Underneath

None.
