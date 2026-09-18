# Consumer Identifiers

## Intent

This page states the shape, anchors, lifecycle, and downstream use of every identifier a domain specification names. A domain identifier names one obligation or one element in the domain model. Rule identifiers, event identifiers, exception identifiers, path identifiers, failure codes, use case identifiers, and acceptance criterion identifiers all follow one grammar. The grammar places a kind segment at the start and a topic segment at the end. The topic describes the rule or fact in natural language.

The scheme favours natural-language readability over brevity. It favours aggregate ownership over file-path anchoring. A rule can be enforced in more than one place. An event can be raised by more than one operation. An exception can be raised from more than one aggregate. One identifier survives every refactor.

## Agent Summary {#agent-summary}

- Follow the grammar `kind/anchor.topic`. (standards/rule/backend-identifiers.state-the-identifier-grammar)
- Name the element kind with one full English word. (standards/rule/backend-identifiers.name-the-kind-with-a-full-english-word)
- Anchor the identifier on its natural home. (standards/rule/backend-identifiers.anchor-the-identifier-on-its-natural-home)
- State the per-kind identifier forms. (standards/rule/backend-identifiers.state-the-per-kind-identifier-forms)
- Use a trigger form only for invariants. (standards/rule/backend-identifiers.use-a-trigger-form-only-for-invariants)
- Carry four identifying attributes. (standards/rule/backend-identifiers.attach-four-identifying-attributes-to-every-cross-boundary-element)
- Use the source-prefix form for cross-source citations. (standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form)
- Exclude digits from every identifier. (standards/rule/backend-identifiers.exclude-digits-from-every-identifier)
- Keep identifiers unique within their anchor. (standards/rule/backend-identifiers.keep-identifiers-unique-within-their-anchor)
- Tombstone retired identifiers. (standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list)

## Concepts

### Eight element kinds

The domain names eight kinds of element. Each has its own kind word and anchor.

| Kind word | What it names | Anchor | Identifier form |
|:---|:---|:---|:---|
| `invariant` | Aggregate invariant (an obligation the aggregate enforces) | Aggregate root | `<aggregate>.<topic>` |
| `validation` | Use case input validation | Use case | `<use-case>.<topic>` |
| `authorization` | Use case authorization policy | Use case | `<use-case>.<topic>` |
| `acceptance-criterion` | One observable use case result | Use case | `<use-case>.<topic>` |
| `policy` | Domain policy | Policy page | `<policy-page>.<topic>` |
| `rule` | Module-scope rule | Module | `<module>.<topic>` |
| `event` | Past-tense fact the aggregate raised | Aggregate | `<aggregate>.<past-tense>` |
| `exception` | Rejection condition an aggregate throws | Aggregate | `<aggregate>.<condition>` |
| `use-case` | One command or query operation | Module | `<module>.<use-case-name>` |
| `path` | One outcome of one use case | Module and use case | `<module>.<use-case>.<outcome>` |
| `aggregate` | The aggregate root itself | Module | `<aggregate>` |
| `failure` | The consumer-facing identifier of one exception class | Module | `<module>.<lowercase_snake>` |

A rule kind word is separate from the element kind words because rules are obligations and the others are elements. Both groups share the dot-separated topic grammar. The kind segment at the start is what makes them distinguishable.

### Identifier grammar

```text
# Rule identifiers
rule-primary  = <rule-kind>/<home>.<topic>
rule-trigger  = <rule-kind>/<aggregate>.<use-case>.<topic>

# Element identifiers
event         = event/<aggregate>.<past-tense>
exception     = exception/<aggregate>.<condition>
use-case      = use-case/<module>.<use-case-name>
path          = path/<module>.<use-case>.<outcome>
acceptance-criterion = acceptance-criterion/<module>.<use-case>.<topic>
aggregate     = aggregate/<aggregate>
failure       = failure/<module>.<lowercase_snake>
```

`<rule-kind>` is one of `invariant`, `validation`, `authorization`, `acceptance-criterion`, `policy`, `rule`. The kind word is a full English word. No abbreviations.

`<home>` is the natural anchor. For `invariant`, it is the aggregate root in singular kebab-case (`event`, `order`, `venue`). For `validation`, `authorization`, and `acceptance-criterion`, it is the use case in kebab-case (`start-event`, `cancel-order`). For `policy`, it is the policy page. For `rule`, it is the module.

`<topic>` is one or more lowercase kebab-case words naming the rule's observable behavior. The topic carries no digit.

`<aggregate>` is the singular kebab-case aggregate root name.

`<use-case>` is the kebab-case use case name.

`<module>` is the plural kebab-case module name (`events`, `orders`, `integrations`).

`<past-tense>` is one or more lowercase kebab-case words in past tense. The aggregate has already done the thing.

`<condition>` is one or more lowercase kebab-case words that name the rejected condition. It is the noun, not the verb.

`<outcome>` is one or more lowercase kebab-case words naming what the path produces. It is a noun, because the verb is the use case.

`<use-case-name>` is the kebab-case use case name. The verb implies the aggregate when the verb is aggregate-specific. The verb and object are stated when the verb is generic.

`<lowercase_snake>` is one or more words in lowercase_snake_case.

Slash separates the kind from the anchor. Dot separates the anchor from the topic, and dot separates topic words. Lowercase throughout. No digits in any segment.

### Multi-form identifiers

Every domain element carries four identifying attributes. Each attribute serves a different consumer.

| Attribute | Role | Form | Example |
|:---|:---|:---|:---|
| Identity | The unique handle for one occurrence | Opaque UUID | `01H8ZJ3K4X9Y7...` |
| Classification | The semantic name a reader cites | Full identifier | `event/event.started` |
| Causation | The use case or event that triggered this element | Identifier with module prefix | `use-case/events.start` |
| Documentation anchor | The page a reader opens to learn the rule | Repository path | `docs/domain/.../start-event.md` |

The identity is opaque because the UUID is what a database index uses. The classification is what a reader cites, what a test asserts, and what a documentation tool resolves. The causation is what links a child event to the operation that caused it. The documentation anchor is what a stable URI dereferences to in HTML.

### Cross-source citations

A citation from one source to another prefixes the source segment. The source names where the identifier lives.

```text
standards/rule/core-authoring.use-the-declared-identifier-grammar
entro/invariant/event.only-scheduled-starts
litepress/invariant/article.published-once-only
rfc/2119.must-keyword-is-uppercase
owasp/asvs/2.1.1.password-length-policy
```

Every identifier is self-identifying. A reader sees the first segment and knows where the rule lives. A grep `^entro/` finds every Entro rule. A grep `^litepress/` finds every LitePress rule.

### Downstream utility

The four-attribute pattern serves four consumers.

1. Documentation tools resolve every classification identifier to its page.
2. Test runners select tests by classification or path. xUnit Traits and Reqnroll tags carry the identifier.
3. Tracing tools group operations and correlate events using the identity and causation attributes.
4. Client libraries branch on failure codes without parsing prose.

The kind-prefixed grammar makes every consumer's filter a one-character prefix. `grep '^invariant/'` returns every invariant. `grep '^event/'` returns every past-tense event. `grep '^failure/'` returns every failure code.

## Standards

### State the identifier grammar (standards/rule/backend-identifiers.state-the-identifier-grammar)

**Requirement:** A domain identifier MUST follow `kind/anchor.topic` with `kind` naming the element kind, `anchor` naming the natural home, and `topic` naming the rule.

**Rationale:** One grammar across every element kind makes identifiers greppable, readable aloud, and stable across refactoring. The slash boundary lets tooling filter by kind without parsing the topic.

**Example:**

```text
invariant/event.only-scheduled-starts                # primary, on Event aggregate
validation/start-event.event-id-required           # primary, on start-event use case
authorization/start-event.manage-event-required     # primary, on start-event use case
acceptance-criterion/start-event.moves-scheduled-to-in-progress
policy/audit.append-only                            # primary, on audit policy page
rule/integrations.key-scope-unwidenable             # primary, on integrations module
event/event.started                                 # past-tense fact, Event aggregate
exception/event.not-scheduled                       # rejection condition, Event aggregate
use-case/events.start                               # command or query, events module
path/events.start.success                           # outcome of start
failure/events.not_scheduled                        # wire code, events module
```

### Name the kind with a full English word (standards/rule/backend-identifiers.name-the-kind-with-a-full-english-word)

**Requirement:** A domain identifier MUST include one kind segment from `invariant`, `validation`, `authorization`, `acceptance-criterion`, `policy`, `rule`, `event`, `exception`, `use-case`, `path`, `aggregate`, `failure`.

**Rationale:** The kind segment lets tooling filter by kind without consulting the page that owns the element. Removing the kind forces a reader to infer it from the anchor. Full English words are self-explanatory at first read. Abbreviations force a reader to learn a lookup table.

### Anchor the identifier on its natural home (standards/rule/backend-identifiers.anchor-the-identifier-on-its-natural-home)

**Requirement:** The anchor segment MUST name the natural home: the aggregate root, the use case, the policy page, or the module, as the kind requires.

**Rationale:** Anchoring on the owner of the element keeps the identifier correct when one module holds several aggregates. Anchoring on a module name hides the ownership of an aggregate-owned element.

**Example:** `invariant/event.only-scheduled-starts` anchors the invariant on the Event aggregate rather than on the events module. `path/events.start.success` anchors the path on the events module because a path is module-scoped.

### State the per-kind identifier forms (standards/rule/backend-identifiers.state-the-per-kind-identifier-forms)

**Requirement:** Each element kind MUST follow its declared identifier form.

**Rationale:** Each kind has a fixed form so a reader knows where to look for the home anchor and where to look for the descriptive topic. The forms differ because each kind has a different natural home.

**Example:**

```text
rule-primary  = <rule-kind>/<home>.<topic>
rule-trigger  = <rule-kind>/<aggregate>.<use-case>.<topic>
event         = event/<aggregate>.<past-tense>
exception     = exception/<aggregate>.<condition>
use-case      = use-case/<module>.<use-case-name>
path          = path/<module>.<use-case>.<outcome>
acceptance-criterion = acceptance-criterion/<module>.<use-case>.<topic>
aggregate     = aggregate/<aggregate>
failure       = failure/<module>.<lowercase_snake>
```

### Use a trigger form only for invariants (standards/rule/backend-identifiers.use-a-trigger-form-only-for-invariants)

**Requirement:** A trigger form MUST exist only for an `invariant` identifier whose aggregate is mutated by more than one use case.

**Rationale:** Other rule kinds are owned by a single use case. The primary form names the enforcement site already. A second form for those kinds duplicates the identifier and drifts.

**Example:**

```text
# invariant on Event aggregate, mutated by start-event and complete-event
invariant/event.only-scheduled-starts
invariant/event.only-in-progress-completes

invariant/event.start-event.only-scheduled-starts          # trigger from start-event
invariant/event.complete-event.only-in-progress-completes  # trigger from complete-event
```

### Attach four identifying attributes to every cross-boundary element (standards/rule/backend-identifiers.attach-four-identifying-attributes-to-every-cross-boundary-element)

**Requirement:** A domain element that crosses an aggregate boundary MUST carry four identifying attributes: identity, classification, causation, and a documentation anchor.

**Rationale:** One identifier cannot serve every consumer. Documentation tools want a stable URI. Tracing tools want an opaque UUID. Tests want a semantic name. Reviewers want a path to the page. The four attributes are independent.

**Example:** A raised `event/event.started` domain event carries:

```text
id            = 01H8ZJ3K4X9Y7V2NBQ6P8MTDGW       # UUID, opaque, set by store
classification = event/event.started               # semantic name, what is cited
causation     = use-case/events.start              # what triggered it
anchor        = docs/domain/modules/events/events/start-event.md
```

### Cite across sources with the source-prefix form (standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form)

**Requirement:** A citation from one source to another MUST use the source-prefix form `source/kind/anchor.topic`, where the `source` segment names the source where the identifier lives.

**Rationale:** Every source is independent. The source-prefix form lets a reader see the source from the first segment without consulting context. A grep `^source/` finds every citation from one source. A grep `^sourceX/` finds every citation from one specific source.

**Example:** A standards page citing an Entro rule writes `entro/invariant/event.only-scheduled-starts`. A LitePress example writes `litepress/invariant/article.published-once-only`. An RFC citation writes `rfc/2119.must-keyword-is-uppercase`.

### Exclude digits from every identifier (standards/rule/backend-identifiers.exclude-digits-from-every-identifier)

**Requirement:** A domain identifier MUST NOT contain a digit anywhere in any segment.

**Rationale:** Digits decay an identifier scheme into a row index. Once one rule earns a counter, the next one does. The scheme stops being readable. This rule applies to every form, including rule identifiers.

### Keep identifiers unique within their anchor (standards/rule/backend-identifiers.keep-identifiers-unique-within-their-anchor)

**Requirement:** Every active domain identifier MUST be unique within its anchor scope.

**Rationale:** Two identifiers wanting the same name in one anchor means one of them is wrong. The fix is to rename, not to append a digit. Appending a digit reintroduces the rule `standards/rule/backend-identifiers.exclude-digits-from-every-identifier` forbids.

### Retire identifiers through the tombstone list (standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list)

**Requirement:** A retired domain identifier MUST go to a tombstone list.

**Rationale:** A citation can outlive the element it names. The tombstone is the only place a reader can resolve a citation to its retired meaning. Reusing a retired identifier re-points every outstanding citation to the new element.

## Conventions

None.

## Reference example

This informative example demonstrates `standards/rule/backend-identifiers.state-the-identifier-grammar` through `standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list`. The worked set uses a hypothetical consumer aggregate to show every element kind and how they chain together.

### Step one, the aggregate

A consumer aggregate owns its events, exceptions, and invariants.

```text
aggregate = aggregate/order
```

### Step two, events the aggregate raises

Past-tense facts, anchored on the aggregate.

```text
event/order.placed
event/order.paid
event/order.cancelled
event/order.fulfilled
```

### Step three, exceptions the aggregate throws

Conditions the aggregate refuses, anchored on the aggregate.

```text
exception/order.not-found
exception/order.not-in-draft
exception/order.already-paid
exception/order.line-limit-reached
```

### Step four, invariants the aggregate enforces

Primary and trigger forms. The trigger form is the same invariant cited from a specific use case.

```text
invariant/order.placed-once-only                         # primary
invariant/order.paid-state-immutable                    # primary
invariant/order.line-total-equals-line-sum             # primary

invariant/order.place.placed-once-only                  # trigger from place
invariant/order.pay.paid-state-immutable                # trigger from pay
```

### Step five, use cases that mutate the aggregate

Each use case carries a `use-case/<module>.<name>` identifier.

```text
use-case/orders.place
use-case/orders.pay
use-case/orders.cancel
use-case/orders.fulfill
```

### Step six, validation and authorization per use case

Single-form rules, one per use case.

```text
validation/place.buyer-id-required
authorization/place.buyer-manage-required
validation/pay.amount-required
authorization/pay.buyer-pay-required
validation/cancel.reason-required
authorization/cancel.buyer-cancel-required
```

### Step seven, acceptance criteria per use case

The observable results a test proves.

```text
acceptance-criterion/orders.place.places-draft-order
acceptance-criterion/orders.place.refuses-buyer-without-id
acceptance-criterion/orders.pay.moves-placed-to-paid
acceptance-criterion/orders.pay.refuses-zero-amount
```

### Step eight, paths through the use cases

Each use case has a path per outcome. Each path maps to one failure code and one scenario.

```text
path/orders.place.success                # order moves to placed, no failure code
path/orders.place.not-found              # maps to failure/orders.not_found
path/orders.place.forbidden              # maps to failure/authorization.forbidden

path/orders.pay.success                  # order moves to paid, no failure code
path/orders.pay.not-in-placed            # maps to failure/orders.not_in_placed
```

### Step nine, failure codes

Lowercase snake case, anchored on the module, with the `failure/` kind word.

```text
failure/orders.not_found
failure/orders.not_in_placed
failure/orders.already_paid
failure/authorization.forbidden
failure/validation.failed
```

### Step ten, the chain from rule to test

The full chain is invariant to exception to failure code to path to scenario.

```text
# The invariant the use case enforces
invariant/order.placed-once-only

  # raises one exception when violated
  exception/order.not-in-draft

    # maps to one failure code on the wire
    failure/orders.not_in_placed

      # appears in one use case path
      path/orders.pay.not-in-placed

        # tested by one Reqnroll scenario, one xUnit Trait
        Scenario: refuses to pay an order that was not placed
          Given an order in draft state
          When an authorized buyer tries to pay it
          Then failure/orders.not_in_placed is returned
          And the order stays in draft state
```

### Reading the scheme

A reader who wants every invariant on `Order` greps `^invariant/order\.` and gets the three primaries and their trigger forms. A reader who wants every event the aggregate raises greps `^event/order\.` and gets the past-tense facts. A reader who wants every failure code in the orders module greps `^failure/orders\.` and gets the lowercase snake codes. A reader who wants every test for `pay` greps `^path/orders\.pay\.` and gets the three outcomes. The kind prefix is the filter. The rest is the topic.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/backend-identifiers.state-the-identifier-grammar | static | `node tools/validate-consumer.mjs` rejects an identifier whose shape does not match `kind/anchor.topic`. |
| standards/rule/backend-identifiers.name-the-kind-with-a-full-english-word | static | `RuleIdentifierScan` rejects any identifier missing a kind segment from the registered set. |
| standards/rule/backend-identifiers.anchor-the-identifier-on-its-natural-home | inspection | `RuleIdentifierScan` reads the anchor segment and asserts it matches the kind's home convention. |
| standards/rule/backend-identifiers.state-the-per-kind-identifier-forms | static | `RuleIdentifierScan` rejects an identifier whose shape does not match the per-kind grammar. |
| standards/rule/backend-identifiers.use-a-trigger-form-only-for-invariants | inspection | `RuleIdentifierScan` finds one trigger form per `invariant` citation and asserts none for other kinds. |
| standards/rule/backend-identifiers.attach-four-identifying-attributes-to-every-cross-boundary-element | inspection | `MultiFormScan` reads every raised event and asserts it carries an opaque identity, a classification, a causation, and a documentation anchor. |
| standards/rule/backend-identifiers.cite-across-sources-with-the-source-prefix-form | static | `RuleIdentifierScan` rejects a cross-source citation whose source segment is not a known source. |
| standards/rule/backend-identifiers.exclude-digits-from-every-identifier | static | `RuleIdentifierScan` rejects any segment matching `\\d`. |
| standards/rule/backend-identifiers.keep-identifiers-unique-within-their-anchor | inspection | `RuleIdentifierScan` reports duplicates within each anchor scope. |
| standards/rule/backend-identifiers.retire-identifiers-through-the-tombstone-list | inspection | `RuleIdentifierScan` finds every retired identifier in the tombstone list and asserts none appears in the active set. |
