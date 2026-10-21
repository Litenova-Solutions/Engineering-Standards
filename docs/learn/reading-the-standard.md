# Read the Standard

## Intent

This page explains how the standard is organized, so you can find the rules that apply to your project and read a rule the way it's meant.

## A project's selection

You don't adopt all of LiteSpec. Your project makes four choices in its `litespec.project.json`, and those choices decide which pages apply:

| Choice | Options | What it changes |
|:---|:---|:---|
| Size | `small` or `large` | Which record types you keep. A large project adds problems, features, journeys, cases and an Acceptance test project. |
| Shape | `server` or `client-only` | Whether the project has its own backend. A client-only project has no API and applies only the backend principles about modeling the domain. |
| Stacks | One backend stack for a server project, and one stack per frontend | Which technology pages apply: today `dotnet` for the backend, and `react`, `svelte` or `blazor` for a frontend. |
| Extensions | Any of the listed extensions, or none | Extra capabilities with their own rules, such as audit, multitenancy, an outbox or realtime updates. |

`litespec init --preset dotnet-react --size small` writes a first project file with a common selection. The [selection page](https://litespec.dev/2.0.0/select/) on the site does the same in a form and shows which pages apply.

## How the pages are arranged

The folder a page sits in decides who applies it:

```text
docs/
  core/  workspace/  quality/   every project
  backend/                      every project with a backend
    dotnet/                     projects that select the dotnet stack
  frontend/                     every project with a frontend
    patterns/                   UI patterns, for every frontend
    web/                        React and Svelte frontends
      react/  svelte/           each web stack
    blazor/                     Blazor frontends
  ext/                          only the extensions a project selects
```

Selecting a stack applies its folder and every folder above it. A React project applies `frontend/`, `frontend/web/` and `frontend/web/react/`. The upper pages state the principle, such as "pages compose shared components only". The lower pages state how one stack does it, such as which React component library and which test runner.

The other folders explain rather than govern: `learn/` (these pages), `tutorial/`, `guide/`, `reference/` and `tools/`, which describes each command.

## Reading a page

A standards page has the same sections every time:

- **Intent** says what the page covers.
- **Concepts**, when present, explain the ideas the rules use.
- **Standards** are the rules you must follow.
- **Conventions** are defaults you may replace with your own.
- **Verification** says, for each rule, how it's checked.

Each rule is a heading, and the heading is also its ID. Here is one from the [domain page](../backend/domain.md):

```markdown
### Keep Domain independent of outer layers

**Requirement:** The Domain code MUST reference only the language standard library and project-owned Domain types.

**Rationale:** No persistence, web, mediator, logging, configuration, injection, serialization, or provider package enters Domain. Infrastructure registers a persisted discriminator rather than Domain carrying a serialization attribute.
```

Its ID is `litespec/backend/domain#keep-domain-independent-of-outer-layers`: the page path, then the heading. The **Requirement** is the rule itself, one sentence with one capitalized word that sets its strength, as in internet standards: `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT` or `MAY`. Everything under **Rationale** and **Example** explains it and adds no obligation.

In the Verification table, each rule is marked `checkable`, with the command that checks it, or `guidance`, with the question a reviewer asks. That tells you whether a tool or a person catches a slip.

## When a rule doesn't fit

The standard expects departures and gives each one a home:

- **An Exception record** replaces one Standard for your project, with its reason, an owner and a date to review it. An agent follows your exception over the standard.
- **A replaced Convention** is a default you change by stating your own in your project's documentation.
- **A Known gap** records a problem you accept for now, with an owner and an end date, so a check doesn't fail on it forever.
- **An extension** can replace a baseline rule when you select it. The EF Core extension, for example, replaces the default persistence rules with its own.

When guidance overlaps, the most specific source wins: your exception, then a selected extension, then the deeper page, then the shallower one.

## UI patterns

The pages in `frontend/patterns/` work differently. Each one covers a group of recurring interface questions, such as how a record's page header is laid out or how a list filters. Every pattern offers several options, each drawn as a wireframe, and names a default. Your project keeps a catalog of the option it chose for each pattern. The site draws every option, and `litespec patterns preview` draws them locally, so you can choose by looking.

## Next

[Records and the project model](records-and-the-model.md) explains what your project writes down.
