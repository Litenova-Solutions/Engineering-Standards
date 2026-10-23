# Domain Model

## Intent

The domain states how the product works: the words it uses, the areas it divides into, the things it keeps consistent, the rules that hold, and the behavior it defines with its endings and examples. This page states the domain record types, the fields and links each one carries, and how each record maps to its design pattern in technology-free words. Developers and agents write these records in the domain layer's words; reviewers read them in the book down to the scenario line.

## Concepts

### Domain Record Types

Each type answers one question about how the product works. Every record carries the common fields, and every identifier follows the grammar, that the [model page](model.md) defines. Entries inherit `owner` and `status` from their page, as the [model page](model.md) states.

| Type | Stored as | Fields | Links |
|:---|:---|:---|:---|
| `term` | entry in `docs/glossary.json` | `term`, `meaning`, `labels`, `rejected`, `broader`, `narrower`, `values` | none |
| `module` | page, `docs/domain/modules/<module>/README.md` | `summary` | `dependsOn` |
| `aggregate` | page, `docs/domain/modules/<module>/<aggregate>/README.md` | `summary`, `states`, `transitions`, `data` | containment by identifier; rule and event entries |
| `rule` | entry on its aggregate page; cross-aggregate rules on a rule page | `kind`, `statement` | `governs`, `refusal`, `fulfills`, `basedOn` |
| `event` | entry on its aggregate page | `meaning`, `carries` | none |
| `use case` | page beside its aggregate | `kind`, `anonymous`, `input`, `output`, `trigger` on a reaction | `needs`, `reachedThrough`, `raises`, `fulfills` |
| `result` | entry on its use case page | `outcome`, `code` on a refusal, `meaning` | containment by identifier |
| `scenario` | entry on its use case page | `given`, `when`, `then`, `examples` | `result` |

Where the domain lives follows one order: module, then aggregate with its states, transitions, and data, then its rules, events, and use cases. The [model page](model.md) states the authoring order, the authority order, and how the builder verifies each record.

### The Bounded Context

The product speaks one business language inside one deployment boundary, as the [scope page](scope.md) states. Modules organize that language into areas; they never become languages or deployments of their own. Words follow the layer's author: plain words in the product layer, and the established design words of domain-driven design, CQRS, and BDD here.

### The Glossary

The glossary is the project's ubiquitous language: the one word or phrase the project uses for each concept, with its meaning. Each term is an entry in `docs/glossary.json` with its `term`, `meaning`, `labels`, `rejected`, `broader`, `narrower`, and `values` fields, and no links. Any record names the terms it uses in `terms`, as the [model page](model.md) states. The [authoring page](authoring.md) states how the checks apply rejections and mannered terms.

### Modules and Aggregates

A module is one business area: a page at `docs/domain/modules/<module>/README.md` carrying a `summary` and the `dependsOn` links to the modules it relies on. An aggregate is one thing the product keeps consistent and changes in one step, through its root: a page at `docs/domain/modules/<module>/<aggregate>/README.md` beside its module page. The aggregate identifier carries both names, so containment follows the identifier and needs no link field.

### States Transitions and Data

Each aggregate declares its lifecycle as `states` entries with a `name` and a `meaning`, so every state a reviewer reads carries what it means. Its Transitions table lists every allowed change with the use case that moves it, naming the state it leaves and the state it enters. Its Data table lists the fields the aggregate keeps, each with a `name`, a `meaning`, and a classification of `public`, `internal`, `personal`, or `sensitive`. The [model page](model.md) states how the builder computes reachability and coverage from these tables.

### Rules and Events

A rule states what holds, with its `kind` and its `statement`. An invariant holds after every change; a precondition guards the behavior before it runs; a calculation derives a value; a cross-aggregate rule spans aggregates and lives on a rule page at `docs/domain/rules/<name>.md`, while each other rule lives as an entry on its aggregate page. A rule names what it constrains in `governs`, the refusal its breach produces in `refusal`, the requirements it carries in `fulfills`, and the constraints and research behind it in `basedOn`. The [product page](product.md) states requirements.

An event is an immutable statement that a business fact completed, named in the past tense, with its `meaning` and the facts it `carries`. Each event is raised through the root of its aggregate, and each event stays inside the product: published events belong to the [API compatibility extension](../ext/compat.md).

### Use Cases Results and Scenarios

A use case is one independently testable goal: a page beside its aggregate at `docs/domain/modules/<module>/<aggregate>/<use-case>.md`, with one `kind`. A command changes the product; a query reads without changing and declares its `output`; a reaction answers events or a moment in time and names its `trigger`: the events it answers, or the schedule or deadline in words. Each use case carries its `input`, names the permissions it needs in `needs`, the entry points that reach it in `reachedThrough`, the events it raises in `raises`, and the requirements it carries in `fulfills`; a use case open to all sets `anonymous`. The [access page](access.md) states actors, roles, permissions, and entry points.

Each use case ends in named results: entries with an `outcome` of `success` or `refusal`, a `code` on a refusal, and a `meaning`. A refusal code is a stable identifier such as `spending.receipt-missing`, shared by every layer that reports it. Each scenario proves one ending: an entry with `given`, `when`, `then`, an optional `examples` table, and the `result` it ends in. Scenarios are the leaf of the review: the last records a person reads, and the first a test proves, as the [model page](model.md) states.

### Spec to Design Mapping

The specification names only what carries business meaning. Child entities and value objects are design choices inside an aggregate: they appear in code and the glossary, never as records. Each record maps to one design pattern; the stack pages state the code form of each pattern, and the [model page](model.md) states how the builder links records to code by naming convention.

| Spec record | Design pattern |
|:---|:---|
| module | one module in the bounded context |
| aggregate | one aggregate, changed through its root |
| aggregate `states` | the lifecycle of the aggregate |
| (none) | child entity, changed only through the root |
| (none) | value object, compared by value |
| rule, invariant | an invariant checked on every change |
| rule, precondition | a guard the behavior passes before it runs |
| rule, calculation | a pure computation on the aggregate or its values |
| rule, cross-aggregate | a stored constraint, or a reaction reaching eventual consistency |
| event | a domain event raised through the root |
| use case, command or query | one handler behind the use case |
| use case, reaction | a policy answering events or time |
| result | one ending per result, each refusal with its code |
| scenario | an executable example proving the scenario |

## Standards

### Define Every Domain Term in the Glossary

**Statement:** Each term a domain record names MUST have a glossary entry stating its meaning.

**Rationale:** Records and code share one language only when each word is defined once: a term used without an entry means whatever each reader guesses. The entry fixes the meaning, the rejected synonyms, and the wider and narrower terms, so reviewers and checks read the same word the same way.

**Example:** The term `receipt` carries the meaning "proof of payment accepted for an expense" in `docs/glossary.json`, so every record naming a receipt means that proof.

### State Every Module Dependency

**Statement:** Each module MUST name every module it depends on in `dependsOn`.

**Rationale:** A module relies on the language and behavior of others, and each reliance shapes change: editing a module ripples into everything depending on it. Naming every reliance in `dependsOn` shows that ripple as data instead of leaving it for readers to reconstruct from prose.

### Model Each Aggregate Lifecycle with States

**Statement:** Each aggregate MUST declare its lifecycle as `states` entries with a name and a meaning.

**Rationale:** A bare state name tells a reviewer nothing: `rejected` without its meaning hides what rejection costs and allows. A name with a meaning makes each lifecycle step reviewable on the page, and gives the Transitions table states worth connecting.

**Example:** The expense aggregate declares `submitted`, `approved`, `rejected`, and `reimbursed`, each with one sentence saying what the expense awaits or has received.

### Connect Every State Through Transitions

**Statement:** Each aggregate MUST list every allowed state change with its use case in its Transitions table.

**Rationale:** States without transitions are a list of names with no path between them: a reviewer sees where an aggregate rests but never how it moves. Listing every allowed change with the use case that moves it shows the whole lifecycle as debated rows, and leaves no state reachable only by a path no record names.

### Classify Every Aggregate Data Field

**Statement:** Each aggregate MUST list its data fields with their meaning and classification in its Data table.

**Rationale:** Data without a classification is handled by guess: personal facts sit beside public ones with nothing marking which is which. A meaning with a classification of public, internal, personal, or sensitive tells every later reader how each field is handled, and shows which fields the erasure and export behavior covers. A project that erases and exports in one module states which aggregates that behavior covers with a rule that governs both the aggregate and the erasure or export use case.

### State Each Rule with Its Kind

**Statement:** Each rule MUST state its kind and its statement.

**Rationale:** The kind decides how the rule is proved: an invariant on every change, a precondition before the behavior, a calculation through its examples, a cross-aggregate rule where aggregates meet. A rule without a kind leaves each reader to prove it a different way, and the checks no place to confirm it.

**Example:** `rule/expense.receipt-required-above-threshold` is a precondition stating "an expense above the policy threshold needs a receipt", checked before Submit expense runs.

### Keep the Negation Word in the Rule Name

**Statement:** A rule whose statement says `not`, `no`, `never`, or `cannot` MUST keep that word in its name.

**Rationale:** A name that drops the negation reads as its own opposite: a rule named `cancel-after-shipment` whose statement says "never" approves what it forbids. Keeping the word keeps the name a true sentence a reviewer trusts without opening the statement.

**Example:** The rule reads `rule/order.cancel-never-after-shipment`.

### Keep Cross-Aggregate Rules on a Rule Page

**Statement:** A rule spanning aggregates MUST live as an entry on a rule page.

**Rationale:** An aggregate page holds what one aggregate guarantees; a rule spanning aggregates guarantees what no single aggregate owns. Giving such rules their own page keeps each aggregate page a true account of its aggregate, and gathers the shared rules where a reviewer judges them together.

### Name the Refusal a Broken Rule Produces

**Statement:** Each rule whose breach refuses a use case MUST name the refusal in `refusal`.

**Rationale:** A guarded rule without a named refusal leaves the ending unnamed: callers branch on a refusal the records never predicted. Naming the refusal ties the rule to the result the use case declares, so the breach and the ending stay one fact.

### State Each Event with Meaning and Carries

**Statement:** Each event MUST state its meaning and the facts it carries.

**Rationale:** An event without a meaning is a name every reaction interprets alone; facts without a carries list are reconstructed from code at each reaction. Stating both on the entry lets each reaction trust what happened and what arrived with it.

### Raise Every Event Through Its Aggregate Root

**Statement:** Each event MUST be raised through its aggregate root.

**Rationale:** The root is the one type through which outside behavior changes the aggregate, so it sees every change worth announcing. Raising each event there keeps the fact and its announcement in one step, and leaves no event announced for a change the aggregate never made.

### Give Each Use Case One Kind

**Statement:** Each use case MUST declare one kind: command, query, or reaction.

**Rationale:** The kind decides what the use case is allowed to touch: a command changes, a query reads, a reaction answers. A use case with no kind, or two, leaves each reader to allow it everything, and the checks no shape to confirm.

### Trigger Every Reaction

**Statement:** Each reaction MUST name its trigger: the events it answers, or the schedule or deadline in words.

**Rationale:** A reaction without a trigger never runs or runs whenever its author remembered: reviewers see behavior with no moment attached. Naming the events, or the schedule or deadline in plain words, states when the behavior answers.

### Declare Every Query Output

**Statement:** Each query MUST declare its output.

**Rationale:** A query without a declared output returns whatever its author fetched: readers and screens guess the shape from code. Declaring the output states what readers receive, so the shape is reviewable before anything implements it.

### End Every Use Case in Named Results

**Statement:** Each use case MUST declare its success result and every refusal with its code.

**Rationale:** Callers branch on named endings: success, or one refusal with its stable code. A use case with no named success leaves readers guessing what good looks like, and a refusal without a code leaves each layer reporting the same breach another way.

**Example:** The submit use case declares `submitted` and `receipt-missing` with the code `spending.receipt-missing`.

### Name the Result Each Scenario Ends In

**Statement:** Each scenario MUST name the result it ends in.

**Rationale:** A scenario that names no result illustrates behavior without asserting an ending: it reads well and proves nothing. Naming the result ties each example to the ending it walks toward, so every test knows what to assert.

### Write Every Scenario in Given When Then

**Statement:** Each scenario MUST state its `given`, `when`, and `then`.

**Rationale:** The three steps separate the situation from the action and the action from the assertion: collapsing them blurs what was true, what moved, and what the test checks. Stating all three keeps each example readable by a person and provable by a test.

**Example:**

```json
{
  "type": "scenario",
  "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
  "title": "Submitting with a receipt succeeds",
  "given": "An employee paid for a train ticket and kept the receipt.",
  "when": "The employee submits the expense with the receipt.",
  "then": "The expense is submitted.",
  "result": "result/submit-expense.submitted"
}
```

### Tabulate Every Calculation with Examples

**Statement:** Each calculation rule MUST be proven by a scenario carrying an examples table.

**Rationale:** A calculation stated only as a sentence hides its edges: reviewers agree on the words while each pictures other numbers. An examples table shows the debated rows, and the scenario proving the rule pins them as checked facts.

### Keep Design Choices Out of the Records

**Statement:** Child entities and value objects MUST appear only in code and the glossary, never as records.

**Rationale:** The records name what carries business meaning; the design inside an aggregate changes without changing that meaning. Recording each child and value as its own record would triple the tree while adding no decision a reviewer approves. Code and the glossary carry them, where builders and readers meet them.

**Example:** Order lines live as a child of the order aggregate, and money as a value with its glossary entry; neither is a record.

## Conventions

### Illustrate Pages with Examples from the Cast

**Default:** Each module, aggregate, and use case page carries an Example section drawn from the example cast.

**Replacement:** A project names the pages that carry an Example section in its documentation.

**Rationale:** Every other section states a rule, a state, or a mapping; none says when the behavior happens or who is under pressure while it does. An occasion drawn from the one shared cast lets a reviewer judge whether the behavior fits the world it serves, and lets readers carry the same people and figures from page to page.

### Group Cross-Aggregate Rules by Theme

**Default:** Each rule page holds the cross-aggregate rules of one theme, named in its Summary.

**Replacement:** A project names its rule-page grouping in its documentation.

**Rationale:** Cross-aggregate rules share no aggregate to gather them, so an ungrouped rule page becomes a list of unrelated checks. One theme per page, stated in its Summary, keeps each page reviewable as one decision about what holds across the domain.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/domain#define-every-domain-term-in-the-glossary | guidance | Each term the domain records name appears with its meaning in `docs/glossary.json`. |
| litespec/core/domain#state-every-module-dependency | guidance | Each module page names in `dependsOn` the modules its text and records rely on. |
| litespec/core/domain#model-each-aggregate-lifecycle-with-states | checkable | `litespec consumer` fails an aggregate page without `states` entries carrying a name and a meaning. |
| litespec/core/domain#connect-every-state-through-transitions | guidance | The Transitions table on each aggregate page pairs every allowed change with an existing state and use case. |
| litespec/core/domain#classify-every-aggregate-data-field | guidance | The Data table on each aggregate page pairs each field with a meaning and a classification. |
| litespec/core/domain#state-each-rule-with-its-kind | checkable | `litespec consumer` fails a rule entry without `kind` or `statement`. |
| litespec/core/domain#keep-the-negation-word-in-the-rule-name | checkable | `litespec model check` reports `rule-name-negation` for a rule whose statement says `not`, `no`, `never`, or `cannot` outside its name. |
| litespec/core/domain#keep-cross-aggregate-rules-on-a-rule-page | guidance | Each cross-aggregate rule sits as an entry on a rule page; other rules sit on their aggregate page. |
| litespec/core/domain#name-the-refusal-a-broken-rule-produces | guidance | Each guarded rule names its refusal in `refusal` beside the rule entry. |
| litespec/core/domain#state-each-event-with-meaning-and-carries | checkable | `litespec consumer` fails an event entry without `meaning` or `carries`. |
| litespec/core/domain#raise-every-event-through-its-aggregate-root | guidance | Each event is raised from the root of the aggregate that owns it. |
| litespec/core/domain#give-each-use-case-one-kind | checkable | `litespec consumer` fails a use-case page without `kind` or with an unknown kind. |
| litespec/core/domain#trigger-every-reaction | guidance | Each reaction page names its trigger events, schedule, or deadline. |
| litespec/core/domain#declare-every-query-output | guidance | Each query page declares the shape its readers receive in `output`. |
| litespec/core/domain#end-every-use-case-in-named-results | checkable | `litespec model check` reports `use-case-without-success` for a use case with no success result; each refusal entry on the use-case page carries its code. |
| litespec/core/domain#name-the-result-each-scenario-ends-in | checkable | `litespec consumer` fails a scenario entry without `result`, and `litespec model check` reports `scenario-result-unresolved` for a scenario ending in another use case's result. |
| litespec/core/domain#write-every-scenario-in-given-when-then | checkable | `litespec consumer` fails a scenario entry without `given`, `when`, or `then`. |
| litespec/core/domain#tabulate-every-calculation-with-examples | guidance | A scenario proving each calculation rule carries its examples table on the use-case page. |
| litespec/core/domain#keep-design-choices-out-of-the-records | guidance | No record page declares a child entity or value object as a record type. |
| litespec/core/domain#illustrate-pages-with-examples-from-the-cast | guidance | Each module, aggregate, and use case page carries an Example section from the cast, or the project documentation names the pages that do. |
| litespec/core/domain#group-cross-aggregate-rules-by-theme | guidance | Each rule page states its theme in Summary, or the project documentation names another grouping. |
