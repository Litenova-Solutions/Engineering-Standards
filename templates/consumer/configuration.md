---
{
  "type": "configuration",
  "title": "<Configuration title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>"
}
---
# <Configuration title>

## Intent

State which settings this page owns and which surface reads them.

Every setting a reader can change appears here with its default.

## Settings

| Setting | Default | Scope | Effect |
|:---|:---|:---|:---|
| `<setting>` | `<default>` | `<scope>` | State what the setting changes. |

## Precedence

State which source wins when two of them set one value. List the sources from strongest to weakest.

1. The command-line option.
2. The environment variable.
3. The project file.
4. The stated default.

## Notes

Optional. Remove this section when the settings need no note.

Record anything a reader needs beside the table, such as a setting that takes effect only after a restart.
