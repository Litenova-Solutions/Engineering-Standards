# Records and the Project Model

## Intent

This page explains what a LiteSpec project writes down, where it keeps it, and what the model builder works out from it. The exact record types, fields, and links are on the [model page](../core/model.md).

## Why records

A record is the smallest piece of intent someone can own and approve: one requirement, one rule, one use case, one decision. Each is a short Markdown page, or an entry on a page, with a JSON header that holds its facts. People read the page. Tools read the header.

Keeping intent in small records, rather than in long documents, does three things:

- Each piece has one owner and one status, so you always know who decides and whether it's settled.
- Records point at each other by ID, so a reader can follow a use case to the requirement it serves and the decision behind it.
- Tools can check them, so a missing result or a broken link fails a build instead of surprising a reader.

## What a project records

The record types follow the questions a team asks, from why down to how:

| Question | Record types |
|:---|:---|
| Why does this product exist, and within which outside rules? | product, constraint, research, decision, requirement |
| What does it offer, and for which pain? | problem, feature |
| Who acts, and what may they do? | actor, role, permission |
| How do people get to it? | journey, entry point |
| How does the business work? | module, business record, rule, use case, result, case, event |
| How is it run? | limit, runbook |
| How is it built and spoken about? | standard, exception, known gap, term |

A small project keeps the core of this list. A large project adds problems, features, journeys, and cases, which tie the product story to proven examples. Limits and runbooks join when the product first goes into production.

Records live in fixed places in your repository, such as `docs/product/brief.md` for the product, `docs/domain/modules/<module>/` for a module's business records and use cases, and `docs/exceptions/` for exceptions. The [model page](../core/model.md) lists every home. The `templates/consumer/` folder of the LiteSpec release holds a starting file for each type.

In the library example, access runs through three records. The actor holds a role, the role allows permissions, and the use case needs one of them:

```json
"holds": [{ "role": "role/reader", "scope": "self" }],
"allows": ["permission/borrow-copy", "permission/read-loans", "permission/place-hold"],
"needs": ["permission/borrow-copy"]
```

Read it as a chain: `actor/reader` holds `role/reader`, the role allows `permission/borrow-copy` among others, and `use-case/lending.borrow-copy` needs that permission. Access flows from actor to role to permission to use case, exactly as the model page states.

## Who decides

Every record has an owner and a status:

- **Draft** means the record waits for its decider, who is named with a decide-by date.
- **Approved** means it holds. An approved record isn't edited: a decision that changes it replaces it.
- **Retired** means a newer record replaced it.

Intent flows one way, from constraint to product to requirement to rule to use case. When code and an approved record disagree, the code has a defect. Whoever owns the record owns the defect.

An agent builds from approved records. Where a record is still a draft, the agent reports the open question to its decider rather than choosing an answer.

## What the model works out

You never write two things by hand: whether a use case is **implemented** and whether it's **verified**. The model builder computes both.

`litespec model build` reads your records, the backend code, the frontend routes, the acceptance tests, and the test results, and writes `.model/model.json`. It finds, for example:

- The command handler that **implements** each use case, from the folder and type names the standard requires
- The screens that **call** each use case, from the frontend's generated API client
- The tests that **prove** each result, from the acceptance scenarios and the latest test run

A use case is implemented when its handler exists, and verified when a passing test proves its results. Because the builder recomputes these links every time, they can't go stale the way a hand-kept traceability table does.

The diagram below shows the main record types around one use case, the links the records hold, and the three links the builder computes.

![The use case sits in the center: rules govern it, journeys step through it, it names results, cases, events, and entry points, and the builder computes implements from handlers, calls from screens, and proves from tests.](../assets/diagrams/learn-record-graph.svg)

## What the model gives you

- **Checks.** `litespec model check` reports each gap as a finding, such as a use case without a handler, a refusal the code never raises, a link to a missing record, or a known gap past its end date.
- **Answers.** `litespec model query <id>` prints one record with every link into and out of it. Agents use it to load exactly the context a task needs.
- **Generated sections.** `litespec model render` fills marked regions of your pages, such as a list of a module's use cases, so they always match the model.
- **The project book.** `litespec book` turns the model into a browsable site of your own project: one page per record, an index per type, a view per actor, and search.

## Next

[Work with agents](working-with-agents.md) explains how an agent uses the standard and your records together.
