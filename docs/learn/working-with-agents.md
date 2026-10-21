# Work with Agents

## Intent

This page explains how an AI agent uses LiteSpec in your project: how it finds the rules, what it may decide on its own, and what it brings back to you. The exact rules are on the [agent page](../core/agent.md).

## What an agent gets from LiteSpec

Without LiteSpec, an agent decides architecture, naming and testing from its training and from whatever files it happens to open. With LiteSpec, those choices are already made and written down, so the agent spends its effort on the work you asked for.

An agent gets three things:

- **Rules it can cite.** Every rule has an ID, so the agent can say exactly which rule a change follows or why it stopped.
- **Records it can trust.** Approved records say what to build. Draft records say what's still open.
- **Checks it can run.** `litespec consumer`, `litespec model check` and your CI gates tell the agent whether its change holds before you review it.

## How an agent finds the rules

There are two ways, and you can use both.

**From the pinned release.** When your project pins LiteSpec as a submodule at `litespec/`, the rules sit in the repository next to your code. Your project's `AGENTS.md` tells the agent to read them, and the agent reads only the pages a task touches.

**From the site.** An agent that can fetch URLs can read the standard from litespec.dev without a local copy. The [selection page](https://litespec.dev/2.0.0/select/) gives you a block to paste into your `AGENTS.md`:

```markdown
## LiteSpec
This project follows LiteSpec 2.0.0: size small, shape server, stacks dotnet and react, extensions none.
Before a task, read https://litespec.dev/2.0.0/select/server.dotnet.react/llms.txt and fetch only the pages the task touches.
```

That index lists every page your selection applies, with a one-line description and a raw Markdown link for each. An agent reads the index, then fetches the few pages a task needs. Every page of the site also exists as plain Markdown: add `.md` to the page's path.

## How an agent works on a task

The [agent page](../core/agent.md) states the order, and the project's `AGENTS.md` repeats it:

1. Read the project's `AGENTS.md` and `litespec.project.json`.
2. Query the model for the records the task touches, with `litespec model query <id>`.
3. Read those records, then the full standards pages they cite.
4. Look at neighboring code and follow a pattern that complies.
5. Change the records, code, tests and contracts that belong together, in one change.
6. Run the checks, and report each command, its result and anything skipped.

When two rules conflict and nothing decides between them, the agent stops and asks, quoting both rule IDs.

## What an agent decides, and what it leaves to you

An agent makes the decisions the standard has already made for it: where a type goes, how a lifecycle is modeled, how a refusal is reported, which tests to write. It doesn't decide product policy, legal questions, money or risk. When a record leaves one of those open, the agent names the question and its decider instead of answering it.

UI design works the same way. For each recurring interface question, LiteSpec offers drawn options and a default. An agent shows you the options with `litespec patterns preview`, recommends one, and builds the one you choose in your own components and style. If it sees a better option while working, it finishes on your choice and proposes the idea in its report, instead of changing your decision.

## Next

[Adopt LiteSpec](adopting-litespec.md) walks through what changes for a team that starts using it.
