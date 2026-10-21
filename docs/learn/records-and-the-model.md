# Records and the Project Model

## Intent

Every LiteSpec project writes its intent (what to build, and why) as small records: requirements, use cases, decisions, and the other fixed types the [Project Model](../core/model.md) lists. This page explains what those records are, where they live, who approves them, and what the model builder (the command that joins records to code, screens, and tests) works out from them. Team members and agents read it before they write their first record, so each piece of intent lands in the right type and home from the start.

## Small records of intent

A record is the smallest piece of intent one person can own and approve: one requirement, one rule, one use case, one decision. Each record is a short Markdown page, or an entry on a page, with an opening JSON block that holds its facts. People read the page, and tools read the block.

Keeping intent in small records instead of long documents gives three results:

- Each piece has one owner and one status, so the team always knows who decides and whether the piece is settled.
- Records point at each other by ID, so a reader follows a use case to the requirement it serves and the decision behind it.
- Tools check records, so a missing result or a broken link fails a build instead of surprising a reader.

## Record types and their homes

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

A small project keeps the rows the [model page](../core/model.md) marks small. A large project also keeps problems, features, journeys, and cases, which tie the product story to proven examples. Constraints, research, limits, and runbooks switch on separately: limits and runbooks join when the product first goes into production.

Each type has one home in the repository. The product brief lives at `docs/product/brief.md`, a module's business records and use cases live under `docs/domain/modules/<module>/`, and exceptions live under `docs/exceptions/`. The [model page](../core/model.md) lists every home, and the `templates/consumer/` folder of the LiteSpec release holds a starting file for each type.

## Links between records

Records join through fields on the record that points. In the Expenses example, access runs through three records: the actor holds a role, the role allows permissions, and the use case needs one of them:

```json
"holds": [{ "role": "role/employee", "scope": "self" }],
"allows": ["permission/submit-expense", "permission/list-expenses"],
"needs": ["permission/submit-expense"]
```

Read it as a chain: `actor/employee` holds `role/employee`, the role allows `permission/submit-expense` among others, and `use-case/spending.submit-expense` needs that permission. Access flows from actor to role to permission to use case, exactly as the [model page](../core/model.md) states.

## Ownership and approval

Every record has an owner and a status:

- **Draft** means the record waits for its decider. A draft names the decider and the date the decision is due.
- **Approved** means the record holds. A decision that changes an approved record replaces it.
- **Retired** means a newer record replaced it.

Intent flows one way, from constraint down to use case: constraint outranks product, product outranks requirement, requirement outranks rule, and rule outranks use case. When code and an approved record disagree, the owner of the higher record owns the defect.

An agent builds from approved records. Where a record is still a draft, the agent reports the open question to its decider instead of choosing an answer.

## Computed links

You never write two facts by hand: whether a use case is implemented and whether it is verified. The model builder computes both.

`litespec model build` reads the records, the backend code, the frontend routes, the acceptance tests, and the test results, and writes `.model/model.json`. For each use case it finds:

- The command handler that **implements** it, from the folder and type names the standard requires.
- The screens that **call** it, from the frontend's generated API client.
- The tests that **prove** each result, from the acceptance scenarios and the latest test run.

A use case is implemented when its handler exists, and verified when a passing test proves its results. The builder recomputes these links on every run, so they cannot go stale the way a hand-kept traceability table does.

The diagram below shows the main record types around one use case, the links the records hold, and the three links the builder computes.

![The use case sits in the center: rules govern it, journeys step through it, it names results, cases, events, and entry points, and the builder computes implements from handlers, calls from screens, and proves from tests.](../assets/diagrams/learn-record-graph.svg)

## Uses of the model

- **Checks.** `litespec model check` reports each gap as a finding: a use case without a handler, a refusal the code never raises, a link to a missing record, or a known gap past its end date.
- **Answers.** `litespec model query <id>` prints one record with every link into and out of it. Agents use it to load exactly the context a task needs.
- **Generated sections.** `litespec model render` fills the marked regions of your pages, such as a list of a module's use cases, so they always match the model.
- **The project book.** `litespec book` turns the model into a browsable site of your own project: one page per record, an index per type, a lens per actor, and search.

## Next steps

[Work with agents](working-with-agents.md) explains how an agent uses the standard and your records together.
