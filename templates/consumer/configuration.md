---
{
  "kind": "configuration",
  "id": "__CONFIGURATION_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __CONFIGURATION_TITLE__

## Intent

State which settings this page owns and which surface reads them.

Every setting a reader can change appears here with its default. A setting introduced inside a procedure is findable only by the reader who already knows that procedure.

## Settings

| Setting | Default | Scope | Effect |
|:---|:---|:---|:---|
| `__SETTING__` | `__DEFAULT__` | `__SCOPE__` | State what the setting changes. |

## Precedence

State which source wins when two of them set one value. List the sources from strongest to weakest.

1. The command-line option.
2. The environment variable.
3. The project file.
4. The stated default.

## Notes

Record anything a reader needs beside the table, such as a setting that takes effect only after a restart.
