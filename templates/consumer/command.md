---
{
  "kind": "command",
  "id": "__COMMAND_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __COMMAND_TITLE__

## Name

`__COMMAND__` starts one named operation and reports its result.

## Synopsis

```bash
__COMMAND__ [arguments] [options]
```

## Description

State why the command exists and the moment a reader reaches for it.

Name the tutorial or how-to page a reader arrives from.

## Arguments

| Argument | Required | Effect |
|:---|:---|:---|
| `__ARGUMENT__` | yes | State what the argument selects. |

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--__OPTION__` | `__DEFAULT__` | State what the option changes. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The command completed its work. |
| `1` | The command ran and reported a failure. |
| `2` | The arguments or options are invalid. |

## Examples

```bash
__COMMAND__
```

## Underneath

State what the command runs on the reader's behalf, and how to run those steps directly. Name anything the direct steps do not reproduce.

Write `None.` when nothing beneath this command is separately runnable.
