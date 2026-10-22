# Overview

## Intent

The Core pages state what every LiteSpec project shares: the system, its scope and stacks, the records that hold its intent, and the rules for agents, writing, and releases. This page gives the overview, the record tree, and the review line that joins people above it to tools below it. Read it once when starting a project, then load only the pages each task touches.

## How the Pages Fit Together

Start with [LiteSpec](system.md) for the system the other pages detail, then [Supported Scope](scope.md) for the size, shape, and stacks a project selects. [Product Intent](product.md), [Project Model](model.md), [Domain Records](domain.md), and [Access Records](access.md) state what a project writes down, and [Agent Operating Protocol](agent.md) states how agents work from those records. [Authoring Standard](authoring.md) and [Maintaining the Standards](maintaining.md) state how pages themselves are written and kept, [Technology Stacks](stacks.md) states what a stack selection applies, [Engineering Principles](principles.md) settles choices no narrower page covers, and [Product Release](release.md) states what a release ships.

## The Record Tree

The records form one tree from product intent down to scenarios, with supporting records beside it:

```text
PRODUCT  what is built, for whom, what it never does

+-- constraint      outside rule; binds everything below
+-- goal            measurable outcome the product serves        (trace)
+-- problem         a pain today                                 (trace)
|     feature       what is offered or refused against it        (trace: solves, serves)
+-- research        evidence; informs, never decides             (trace)
+-- decision        settles a choice; replaced, never edited     (decides)

+-- REQUIREMENT     functional | quality | business             (feature, basedOn)
      |
      +-- journey               ordered use cases toward one goal (fulfills)
      +-- rule                  invariant | precondition | calculation | cross-aggregate
      +-- USE CASE              command | query | reaction
            +-- result          success | refusal with a code
                  +-- scenario  given, when, then; examples table      <- the review line

WHERE IT LIVES        module > aggregate (states, transitions, data) > its rules, events, use cases
WHO MAY DO IT         actor > role at a scope > permission < use case needs
HOW IT IS REACHED     entry point, external system
WHAT WORDS MEAN       glossary
HOW IT RUNS           limit, runbook
PROJECT UPKEEP        deviation, known gap

COMPUTED BY THE BUILDER
  implemented, verified, reachable, effective status
```

The [Project Model](model.md) states the records, links, authority, and authoring order behind this tree.

## The Review Line

People write and approve what sits above the line, while agents fulfill and tools check what sits below it:

| Above the line: people write or approve | Below the line: agents fulfill, tools check |
|:--|:--|
| Product, goals, problems, features | Code in every layer |
| Constraints, research, decisions | Tests and their tags |
| Requirements and journeys | Identifiers, codes and field shapes |
| Rules, stated as sentences | How each rule is enforced |
| Aggregates as states, transitions and classified data | Classes, records, repositories, persistence |
| Use cases with their results, and scenarios in Given, When, Then | Handlers, endpoints, generated clients |
| Actors, roles, permissions, external systems | Authorization code and policies |
| Deviations and known gaps | Applying every stack provision |

Scenarios are the leaf. They are the last records a person reads, and the first a test proves.

Review of the specification is enough only when all six conditions hold:

- **Complete.** No behavior exists in code that no record names.
- **Proven.** Every scenario is proven by a passing test through the product's public boundary.
- **Determined below the line.** Stack pages leave no implementation choice that a person must review.
- **Readable.** People review a rendered specification (the project book), never JSON front matter.
- **Reviewable as change.** A change shows what intent it adds, changes or removes, not only which files moved.
- **Measured.** Every quality requirement carries a measure that a check confirms.

## System and Scope

- [LiteSpec](system.md): what LiteSpec coordinates and the parts it combines.
- [Supported Scope](scope.md): the one size, one shape, and stacks each project selects.
- [Technology Stacks](stacks.md): what selecting a stack applies, and what each stack folder holds.
- [Engineering Principles](principles.md): the rules of thumb for choices no narrower rule covers.

## Intent and the Model

- [Product Intent](product.md): where a consumer states its business intent and in what form.
- [Project Model](model.md): the record types, their links, and what the builder computes.
- [Domain Records](domain.md): the bounded context, the glossary, and the modules, aggregates, rules, events, use cases, results, and scenarios inside it.
- [Access Records](access.md): the actors, roles, permissions, entry points, and external systems that govern who may do what and how it is reached.

## Agents, Authoring, and Releases

- [Agent Operating Protocol](agent.md): how agents select context, resolve standards, and report completion.
- [Authoring Standard](authoring.md): page styles, provision contracts, identifiers, and prose style; what `litespec validate` checks.
- [Maintaining the Standards](maintaining.md): the maintainer manual for provision lifecycle, renames, citations, and releases.
- [Product Release](release.md): what a release joins to its evidence, and what a maintainer operates.
