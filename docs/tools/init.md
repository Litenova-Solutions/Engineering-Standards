# Initialize Consumer

## Name

`litespec init` starts a consumer repository from a preset, a ready-made selection of shape, stacks, and frontends.

## Synopsis

```bash
litespec init --preset <name> --size <small|large> [--root <path>] [--name <project>] [--help]
```

## Description

This command writes `litespec.project.json` into the consumer root. It reads the consumer template and the named preset from the LiteSpec checkout, overlays the preset's shape, stacks, and frontends, then writes the project size, name, and `reviewedLiteSpecVersion`. It refuses to overwrite an existing project file.

Three presets ship with the release:

| Preset | Shape | Stacks | Frontend |
|:---|:---|:---|:---|
| `dotnet-react` | `server` | `dotnet`, `react` | `web` at `apps/web` on `react` |
| `dotnet-svelte` | `server` | `dotnet`, `svelte` | `web` at `apps/web` on `svelte` |
| `blazor-client` | `client-only` | `blazor` | `app` at `apps/app` on `blazor` |

Run this command once in an empty folder, then run `litespec consumer` to validate the new project.

## Arguments

None. Everything passes through options.

## Options

| Option | Default | Effect |
|:---|:---|:---|
| `--preset <name>` | required | Selects the preset: `blazor-client`, `dotnet-react`, or `dotnet-svelte`. |
| `--size <size>` | required | Sets the project size: `small` or `large`. |
| `--root <path>` | the working directory | Selects the consumer repository to write into. |
| `--name <project>` | the root folder's name | Sets the project name. |
| `--help` | off | Prints the synopsis, the options, and the exit codes, then exits zero. |

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | The project file was written. |
| `1` | The checkout holds no readable template, preset or version. |
| `2` | The project file exists, the preset or size is invalid, or an option is unknown. |

## Examples

Start a small React consumer in a new folder:

```bash
litespec init --preset dotnet-react --size small --root ./shop
```

Start a large Blazor client and name the project:

```bash
litespec init --preset blazor-client --size large --name shop
```

## Underneath

This command merges `templates/consumer/litespec.project.json` with `templates/presets/<name>.json` from the LiteSpec checkout and writes the result. Nothing beneath it is separately runnable. Validate the written file with `litespec consumer`.
