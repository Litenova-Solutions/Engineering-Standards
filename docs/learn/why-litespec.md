# Why LiteSpec Exists

## Intent

This page explains the problem LiteSpec solves and the approach it takes. Read it if you're deciding whether LiteSpec fits your team.

## The problem

AI agents now write a large share of the code in many teams. They're fast and capable, but each one starts from what it can see: the request, the files it opens, and its own habits. Give the same request to two agents, or to one agent on two days, and you can get two different designs. Both compile. Both pass their own tests. Together they leave a codebase that no longer has one shape.

The same thing happens between people, more slowly. Over months, the reasons behind a design leave with the people who made it. A rule lives only in a handler. A requirement lives only in a chat thread. Documentation describes what the system did a year ago.

These gaps cause a few problems that repeat:

- Intent gets lost between the request and the code. Nobody can say which requirement a piece of code exists for.
- An agent fills a gap by inventing a rule, because nothing told it the rule was undecided.
- Familiar patterns get renamed until a new developer no longer recognizes them.
- A feature is built in one layer while its storage, its API, its tests or its operating impact are missing.
- Documentation claims behavior that the code and its tests don't show.

## The approach

LiteSpec makes the written record durable and the person or agent doing the work replaceable. A different developer, model or tool can pick up the same records and reach the same boundaries.

It does that with three things:

- **A standard.** A versioned set of rules for building one bounded-context business application: how the backend is layered, how the domain is modeled, how APIs, frontends, tests, security, operations and releases work. Each rule has a stable ID, so a person, an agent or a tool can cite exactly one rule.
- **Records.** Your project writes down its intent as small pages of fixed types: the product, its requirements, its modules, business records, rules, use cases and their results, and the decisions behind them. Each record has an owner and a status.
- **A model builder.** A command-line tool reads your records, your code, your screens and your test results, and works out how they connect: which handler implements which use case, which screen calls it, which test proves it. It reports what's missing.

The standard tells everyone how to build. The records say what to build. The model shows whether the two match.

## What LiteSpec isn't

- **It isn't a framework or a library.** You build with your own stack. LiteSpec states how, and checks the result.
- **It isn't a process.** It has no ceremonies, roles or sprints. It names who owns a decision, and who that is stays up to you.
- **It isn't for every system.** It covers one bounded-context business application: one domain, one API and one database, with one or more frontends. A platform of many services, a game or an embedded system is outside its scope.

## Why one scope

LiteSpec is narrow on purpose. A standard that tries to cover every architecture has to stay vague, and a vague rule gives an agent nothing to follow. By fixing the shape of the application, LiteSpec can state concrete rules: five backend projects, one way to model a lifecycle, one way to report a refused command. An agent following them makes the same choices a careful senior developer would.

The name says the same thing. *Lite* means a project adopts one bounded context, one size and the stacks it selects, and nothing more. *Spec* means written, approved records and rules define the work.

## Next

[How LiteSpec works](how-litespec-works.md) follows these parts through one real use case.
