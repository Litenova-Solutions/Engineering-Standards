# Records and the Project Model

## Intent

Every LiteSpec project writes its intent (what to build, and why) as small records: requirements, use cases, decisions, and the other fixed types the [Project Model](../core/model.md) lists. This page explains what those records are, where they live, who approves them, and what the model builder (the command that joins records to code, screens, and tests) works out from them. Team members and agents read it before they write their first record, so each piece of intent lands in the right type and home from the start.

## Small Records of Intent

A record is the smallest piece of intent one person can own and approve: one requirement, one rule, one use case, one decision. Each record is a short Markdown page, or an entry on a page, with an opening JSON block that holds its facts. People read the page, and tools read the block.

Keeping intent in small records instead of long documents gives three results:

- Each piece has one owner and one status, so the team always knows who decides and whether the piece is settled.
- Records point at each other by ID, so a reader follows a use case to the requirement it serves and the decision behind it.
- Tools check records, so a missing result or a broken link fails a build instead of surprising a reader.

## Record Types and Their Homes

The record types follow the questions a team asks, from why down to how:

| Question | Record types |
|:---|:---|
| Why does this product exist, and within which outside rules? | product, goal, constraint, research, decision, requirement |
| What does it offer, and for which pain? | problem, feature |
| Who acts, and what may they do? | actor, role, permission |
| How is it reached, and what outside systems does it meet? | journey, entry point, external system |
| How does the business work? | module, aggregate, rule, event, use case, result, scenario |
| How is it run? | limit, runbook |
| How is it built and spoken about? | deviation, known gap, term |

A small project keeps the rows the [model page](../core/model.md) marks small. A large project also keeps problems, features, journeys, and scenarios, which tie the product story to proven examples. Constraints, research, limits, and runbooks switch on separately: limits and runbooks join when the product first goes into production.

Each type has one home in the repository. The product brief lives at `docs/product/brief.md`, a module's aggregates and use cases live under `docs/domain/modules/<module>/`, and deviations live under `docs/deviations/`. The [model page](../core/model.md) lists every home, and the `templates/consumer/` folder of the LiteSpec release holds a starting file for each type.

## Links Between Records

Records join through fields on the record that points. In the Claimwick example, access runs through three records: the actor holds a role, the role allows permissions, and the use case needs one of them:

```json
"holds": [{ "role": "role/employee", "scope": "self" }],
"allows": ["permission/submit-expense", "permission/list-expenses"],
"needs": ["permission/submit-expense"]
```

Read it as a chain: `actor/employee` holds `role/employee`, the role allows `permission/submit-expense` among others, and `use-case/spending.submit-expense` needs that permission. Access flows from actor to role to permission to use case, exactly as the [model page](../core/model.md) states.

## Ownership and Approval

Every record has an owner and a status:

- **Draft** means the record waits for its decider. A draft names the decider and the date the decision is due.
- **Approved** means the record holds. A decision that changes an approved record replaces it.
- **Retired** means a newer record replaced it.

Intent flows one way, from constraint down to scenario: constraint outranks product, product outranks requirement, requirement outranks rule, rule outranks use case, use case outranks result, and result outranks scenario. When code and an approved record disagree, the owner of the higher record owns the defect.

An agent builds from approved records. Where a record is still a draft, the agent reports the open question to its decider instead of choosing an answer.

## The Review Line

Every record sits either above or below one fixed line. People write or approve what sits above it; agents fulfill and tools check what sits below it.

| Above the Line: People Write or Approve | Below the Line: Agents Fulfill, Tools Check |
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

1. **Complete.** No behavior exists in code that no record names.
2. **Proven.** Every scenario is proven by a passing test through the product's public boundary.
3. **Determined below the line.** Stack pages leave no implementation choice that a person must review.
4. **Readable.** People review a rendered specification (the project book), never JSON front matter.
5. **Reviewable as change.** A change shows what intent it adds, changes or removes, not only which files moved.
6. **Measured.** Every quality requirement carries a measure that a check confirms.

## Computed Links

You never write two facts by hand: whether a use case is implemented and whether it is verified. The model builder computes both.

`litespec model build` reads the records, the backend code, the frontend routes, the tests, and the test results, and writes `.model/model.json`. For each use case it finds:

- The handler, reaction, or job that **implements** it, from the names the standard requires.
- The screens that **call** it, from the frontend's generated API client.
- The tests that **prove** each scenario, from the tests that claim them and the latest test run.

A use case is implemented when its handler, reaction, or job exists, and verified when a passing test proves every scenario. The builder recomputes these links on every run, so they cannot go stale the way a hand-kept traceability table does.

The diagram below shows the main record types around one use case, the links the records hold, and the three links the builder computes.

![The use case sits in the center: rules govern it, journeys step through it, it names results, scenarios, events, and entry points, and the builder computes implements from handlers, calls from screens, and proves from tests.](../assets/diagrams/learn-record-graph.svg)

## Uses of the Model

- **Checks.** `litespec model check` reports each gap as a finding: a use case with no handler, reaction, or job, a refusal the code never raises, a link to a missing record, or a known gap past its end date.
- **Answers.** `litespec model query <id>` prints one record with every link into and out of it. Agents use it to load exactly the context a task needs.
- **Generated sections.** `litespec model render` fills the marked regions of your pages, such as a list of a module's use cases, so they always match the model.
- **The project book.** `litespec book` turns the model into a browsable site of your own project: one page per record, an index per type, a lens per actor, and search.

## Next Steps

[Reading Tracks](reading-tracks.md) states which records to read in which order: why before how, one journey end to end, and one module end to end.
