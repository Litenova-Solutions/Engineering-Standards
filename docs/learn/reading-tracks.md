# Reading Tracks

## Intent

A specification is a tree, and no reader reads the whole tree at once. This page states the order to read in: why before how, one journey from goal to proof, one module from aggregates to proof, and the structural words every record uses. Reviewers and builders read it after [Records and the Project Model](records-and-the-model.md), before they open their first record.

## Why Before How

Read Intent before Behavior. Start at the product: the brief, the goals, the problems, the features, the constraints, the decisions, and the requirements. Then read Behavior: the modules, the aggregates with their states, transitions, data classes, and rules, the use cases with their results and scenarios, and the reactions, jobs, notifications, and settings around them. Each record names what sits above it, which is why it exists, and what sits below it, which is how it is fulfilled.

A reviewer who reads Behavior first meets behavior with no reason. A reviewer who reads Intent first meets each use case as the answer to a requirement, and each requirement as the answer to a problem or goal.

## One Journey End to End

Follow one journey from its goal to its proof. Product readers take this track through the book chapter, which renders the journey without field names or JSON. Read in this order:

1. The goal the journey serves, and the requirements that fulfill it, with their statements and each `except` with its fallback inline.
2. The journey page: its goal, its `finishedWhen`, its steps as product sentences, and what each step's `ifItGoesWrong` says the person experiences.
3. Each step's serving use cases: one line of goal each, with the Then clauses of their scenarios as context.
4. The consequences box as context: new refusals in product words, data kept and for how long, and money effects.
5. The open questions on the journey and its requirements, grouped in their ballots.
6. The proof: the tests the model links to each scenario, and whether each reads verified.

For example, follow the journey that carries an expense from submission to reimbursement: its steps run through use cases such as Submit expense, each result names how its step ends, and each scenario is proven by a passing test. When every scenario on the journey is proven, the journey holds.

## One Module End to End

Follow one module from its aggregates to its proof. Developers take this track through the Behavior records and the behavior diff. Read in this order:

1. The module page and its known limits.
2. Each aggregate: its kind, its states with their meanings, its transitions, its data classes with their erasure positions, and its classified data.
3. The rules that govern the aggregates, and the domain and integration events they raise and translate.
4. Each use case with its access, consistency, effects, results, and scenarios.
5. The reactions, jobs, notifications, and settings that surround the use cases, and the retention row that schedules each data class.
6. The proof: the tests the model links to each scenario.

For example, the spending module holds the expense aggregate with its states and transitions, the rules that govern it, and use cases such as Submit expense. When every scenario in the module is proven, the module holds.

## Structural Words

Every record uses the same structural words: the record types, the links between them, and the statuses with the fixed sets. The [model page](../core/model.md) states each one; this table states what each word tells a reader.

### Records

| Word | What It Tells the Reader |
|:---|:---|
| product | What is built, for whom, and what it never does. |
| goal | A measurable outcome the product serves. |
| problem | A pain people meet today. |
| feature | What is offered, or refused, against a problem. |
| constraint | An outside rule that binds everything below it. |
| research | Evidence that informs, never decides. |
| decision | A settled choice, replaced never edited. |
| requirement | One functional, quality, or business obligation, with its exceptions and fallback. |
| journey | Ordered product sentences toward one goal, each with an id. |
| term | One glossary word with its meaning, layer, and aliases. |
| module | One part of the domain. |
| aggregate | One business object with its kind, states, transitions, data classes, and data. |
| rule | One invariant, precondition, calculation, cross-aggregate, atomicity, reservation, commercial-data, or default sentence. |
| event | One statement that something completed. |
| integration event | One fact published to or accepted from outside. |
| use case | One command or query. |
| result | One way a use case ends: success, or refusal with a code. |
| scenario | One example in given, when, then that proves a result. |
| reaction | When an event fires, issue a use case or send a notification. |
| job | Scheduled, one-off, or operator work that issues use cases. |
| notification | One person-facing message with its audience, channel, and consent. |
| setting | One tunable with its default, range, setter, and bound behavior. |
| actor | One person, organization, or system that acts. |
| role | One set of permissions held at a scope. |
| permission | One allowed action. |
| entry point | One way readers reach the product. |
| external system | One outside system the product talks to, with its operations and erasure. |
| retention schedule | When each data class is erased and what enforces it. |
| runbook | What to do when a trigger fires. |
| deviation | One departure from a provision, with a review date. |
| known gap | One accepted problem, with an owner and an end date. |

### Links

| Word | What It Tells the Reader |
|:---|:---|
| solves | The feature answers this problem. |
| serves | The feature serves this goal; the use case, reaction, or job serves this journey step or goal. |
| fulfills | This record answers the requirement it names. |
| basedOn | The evidence or record this one builds on. |
| decides | The decision settles this record. |
| replaces | The decision overturns this earlier decision. |
| governs | The rule binds this use case or aggregate. |
| access | The auth kinds, grant, and tenant scope this use case declares. |
| reachedThrough | Readers reach the use case through this entry point. |
| raises | The use case emits this event. |
| issues | This reaction, job, or effect runs this use case. |
| sends | This reaction or effect sends this notification. |
| publishes | This effect emits this integration event. |
| calls | This effect calls this external-system operation. |
| on | The event this reaction answers. |
| holds | The actor carries this role at a scope. |
| allows | The role grants this permission. |

### Statuses and Sets

| Word | What It Tells the Reader |
|:---|:---|
| draft | The record waits for its decider. |
| approved | The Intent or governance record holds. |
| reviewed | The Behavior record holds. |
| retired | A newer record replaced it. |
| implemented | The builder found code for it. |
| verified | Passing tests prove it. |
| stale | Its proof predates its latest semantic change. |
| reachable | A transition leads into the state. |
| command, query | The two use case kinds: change, ask. |
| invariant, precondition, calculation, cross-aggregate, atomicity, reservation, commercial-data, default | The eight rule kinds. |
| functional, quality, business | The three requirement kinds: behavior, measure, terms and dates. |
| success, refusal | The two result outcomes: it worked, or it ended with a code. |
| scheduled, one-off, operator | The three job kinds. |
| inline, after-commit, async | The three effect timings. |
| atomic, per-record, compensated, best-effort | The four consistency modes. |
| planned, shipped, later, refused | The four feature states. |

## Which Track to Take

A product owner or reviewer takes the journey track: one goal at a time, from promises to proof, reading chapters and ballots. A developer or agent takes the module track: one module at a time, from aggregates to proof, reading Behavior records and the behavior diff. Both tracks read why before how, and both end at Proof, where passing tests show the promises hold.

## Next

[How the Tools Fit Together](the-tooling.md) explains when each tool runs on the records these tracks walk through.
