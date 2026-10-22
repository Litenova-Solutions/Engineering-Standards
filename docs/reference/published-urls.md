# Published URLs

## Intent

An agent (software that reads task context, changes files, and runs checks) wires itself to LiteSpec through URLs on `https://litespec.dev`, not through a local copy of the repository. This page lists every URL the site serves: its pattern, a real example for the current release, and what it returns, so an agent or a reader resolves any reference with a fetch.

## Reference

The site is generated from the standard at the repository root, so the site and the release it is built from state the same contract. The release in this contract is `2.0.0`, taken from the `version` field of `litespec.manifest.json`, and every release path below starts with that version. [Work with agents](../learn/working-with-agents.md) explains how an agent uses these URLs on a task.

### Page URLs

| Pattern | Example | Returns |
|:---|:---|:---|
| `https://litespec.dev/2.0.0/<path>/` | `https://litespec.dev/2.0.0/backend/domain/` | The page as HTML |
| `https://litespec.dev/2.0.0/<path>.md` | `https://litespec.dev/2.0.0/backend/domain.md` | The page as plain Markdown |

`<path>` is the page path under `docs/` without the extension, such as `backend/domain`. A folder index is served at its folder, so `docs/learn/README.md` is served at `https://litespec.dev/2.0.0/learn/`. Raw Markdown answers with `Content-Type: text/markdown`. Relative links between pages are rewritten to absolute raw URLs, so an agent that fetches one page follows its links without a browser. Fenced code blocks keep every byte.

### Release Indexes

| Pattern | Example | Returns |
|:---|:---|:---|
| `https://litespec.dev/llms.txt` | `https://litespec.dev/llms.txt` | The root index for agents |
| `https://litespec.dev/2.0.0/llms.txt` | `https://litespec.dev/2.0.0/llms.txt` | Every page of the release |
| `https://litespec.dev/2.0.0/llms-full.txt` | `https://litespec.dev/2.0.0/llms-full.txt` | The whole release as one file |

Each index answers with `Content-Type: text/plain`. The root index explains how to use the site, lists every selection index and every layer bundle, and ends with the repository `AGENTS.md` as the agent protocol block. The release index groups every page by area with its raw Markdown URL and a one-line description. The full text concatenates every page except the UI pattern pages in index order: each page opens with a comment naming its raw source URL, and pages are separated by a line holding `---`.

### Selection Indexes

| Pattern | Example | Returns |
|:---|:---|:---|
| `https://litespec.dev/2.0.0/select/` | `https://litespec.dev/2.0.0/select/` | The selection page as HTML |
| `https://litespec.dev/2.0.0/select/<key>/llms.txt` | `https://litespec.dev/2.0.0/select/server.dotnet.react/llms.txt` | The pages one selection applies |

A selection key joins the shape and the stacks with dots: `server.dotnet.react` names a server project using the `dotnet` backend stack and the `react` frontend stack. A server selection names one backend stack and zero or one frontend stack. A client-only selection names no backend stack and one frontend stack, such as `client-only.react`. Extensions never enter the key; they are separate lines in the `AGENTS.md` block.

A selection index answers with `Content-Type: text/plain`. It groups the pages the selection applies by layer, with each page linking its raw Markdown. It then lists the extensions the selection may add, the UI pattern groups when the selection holds a frontend stack, and a note that says to fetch only the pages a task touches.

The selection page produces the `AGENTS.md` block an owner pastes into the working context. With size `small`, shape `server`, and stacks `dotnet` and `react`, it reads:

```text
## LiteSpec
This project follows LiteSpec 2.0.0: size small, shape server, stacks dotnet and react, extensions none.
Before a task, read https://litespec.dev/2.0.0/select/server.dotnet.react/llms.txt and fetch only the pages the task touches.
Selected extensions: none
UI work: the pattern pages listed in that index.
```

The page derives the matching project record and the `litespec init` command beside it. With the `dotnet-react` preset and size `small`, the command is `litespec init --preset dotnet-react --size small`. [Work with agents](../learn/working-with-agents.md) shows the same block in use.

### Layer Bundles

| Pattern | Example | Returns |
|:---|:---|:---|
| `https://litespec.dev/2.0.0/layers/<key>.md` | `https://litespec.dev/2.0.0/layers/backend/dotnet.md` | The layer as plain Markdown |

A layer is one folder's pages, concatenated in the same format as the full text. A layer answers with `Content-Type: text/markdown`. The keys are:

- `core` for the always-applied areas.
- `backend` and `frontend` for the principles.
- One shared folder, such as `frontend/web`.
- One stack folder, such as `backend/dotnet`, `frontend/web/react`, `frontend/web/svelte`, or `frontend/blazor`.
- One UI pattern group, such as `patterns/record-detail`.
- One extension, such as `ext/audit`.

The layers a selection applies, without extensions and pattern groups and in reading order, decide the groups of its selection index.

### Schema Files

| Pattern | Example | Returns |
|:---|:---|:---|
| `https://litespec.dev/2.0.0/schemas/<file>` | `https://litespec.dev/2.0.0/schemas/record.schema.json` | The schema as JSON |

The seven files are the ones the [Schemas](schemas.md) page lists. Each answers with `Content-Type: application/json`. Each schema `$id` equals its published URL.

### Latest Redirect

| Pattern | Example | Result |
|:---|:---|:---|
| `https://litespec.dev/latest` | `https://litespec.dev/latest` | Redirect to `https://litespec.dev/2.0.0/` |
| `https://litespec.dev/latest/*` | `https://litespec.dev/latest/backend/domain/` | Redirect to the same path under `2.0.0` |

Both redirects answer `302`. The build writes them to `_redirects` in the output root, which the hosting platform reads.

## Notes

Every plain-text URL exists so an agent resolves it with a fetch, without a browser. Start from the selection index that matches the project shape and stacks, paste the `AGENTS.md` block the selection page produces, and fetch only the pages a task touches. To read the whole release in fewer requests, fetch the layer bundle whose section the task spans: each section heading links the bundle that carries the same text.
