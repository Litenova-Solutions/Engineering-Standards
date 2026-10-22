# Reading Tracks

## Intent

A specification is a tree, and no reader reads the whole tree at once. This page states the order to read in: why before how, one journey from goal to proof, one module from aggregates to proof, and the structural words every record uses. Reviewers and builders read it after [Records and the Project Model](records-and-the-model.md), before they open their first record.

## Why Before How

Read intent before mechanism. Start at the product: the brief, the goals, the problems, the features, the constraints, the decisions, and the requirements. Then read the domain: the modules, the aggregates with their states, transitions, and data, the rules, the use cases with their results, and the scenarios. Each record names what sits above it, which is why it exists, and what sits below it, which is how it is fulfilled.

A reviewer who reads the domain first meets behavior with no reason. A reviewer who reads intent first meets each use case as the answer to a requirement, and each requirement as the answer to a problem or goal.

## One Journey End to End

Follow one journey from its goal to its proof. Read in this order:

1. The goal the journey serves, and the requirements that fulfill it.
2. The journey page: its actor, its steps, and what each step produces.
3. Each step's use case: its goal, what happens, its results, and its scenarios.
4. The proof: the tests the model links to each scenario.

For example, follow the journey that carries an expense from submission to reimbursement: its steps run through use cases such as Submit expense, each result names how its step ends, and each scenario is proven by a passing test. When every scenario on the journey is proven, the journey holds.

## One Module End to End

Follow one module from its aggregates to its proof. Read in this order:

1. The module page and its known limits.
2. Each aggregate: its states with their meanings, its transitions, and its classified data.
3. The rules that govern the aggregates, and the events they raise.
4. Each use case with its results and scenarios.
5. The proof: the tests the model links to each scenario.

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
| requirement | One functional, quality, or business obligation. |
| journey | Ordered use cases toward one goal. |
| term | One glossary word with its meaning. |
| module | One part of the domain. |
| aggregate | One business object with its states, transitions, and data. |
| rule | One invariant, precondition, calculation, or cross-aggregate sentence. |
| event | One statement that something completed. |
| use case | One command, query, or reaction. |
| result | One way a use case ends: success, or refusal with a code. |
| scenario | One example in given, when, then that proves a result. |
| actor | One person, organization, or system that acts. |
| role | One set of permissions held at a scope. |
| permission | One allowed action. |
| entry point | One way readers reach the product. |
| external system | One outside system the product talks to. |
| limit | One bound the product runs inside. |
| runbook | What to do when a trigger fires. |
| deviation | One departure from a provision, with a review date. |
| known gap | One accepted problem, with an owner and an end date. |

### Links

| Word | What It Tells the Reader |
|:---|:---|
| solves | The feature answers this problem. |
| serves | The feature serves this goal. |
| fulfills | This record answers the goal, requirement, or use case it names. |
| basedOn | The evidence or record this one builds on. |
| decides | The decision settles this record. |
| replaces | The decision overturns this earlier decision. |
| governs | The rule binds this use case. |
| needs | The use case requires this permission. |
| reachedThrough | Readers reach the use case through this entry point. |
| raises | The use case emits this event. |
| holds | The actor carries this role at a scope. |
| allows | The role grants this permission. |

### Statuses and Sets

| Word | What It Tells the Reader |
|:---|:---|
| draft | The record waits for its decider. |
| approved | The record holds. |
| retired | A newer record replaced it. |
| implemented | The builder found code for it. |
| verified | Passing tests prove it. |
| reachable | A transition leads into the state. |
| command, query, reaction | The three use case kinds: change, ask, react. |
| invariant, precondition, calculation, cross-aggregate | The four rule kinds: always true, checked before, computed, across aggregates. |
| functional, quality, business | The three requirement kinds: behavior, measure, terms and dates. |
| success, refusal | The two result outcomes: it worked, or it ended with a code. |
| planned, shipped, later, refused | The four feature states. |

## Which Track to Take

A product owner or reviewer takes the journey track: one goal at a time, from intent to proof. A developer or agent takes the module track: one module at a time, from aggregates to proof. Both tracks read why before how, and both end at scenarios, the leaf of the review line.

## Next

[How the Tools Fit Together](the-tooling.md) explains when each tool runs on the records these tracks walk through.
