# Model a Domain Capability

Use this guide after human discovery has identified the business language and rules for a capability. It converts those findings into the capability document, use-case specifications, and Domain object design required by the profile.

This guide does not replace interviews, Event Storming, policy review, or another discovery method. An agent may expose a missing definition or conflicting rule. It must not invent the business answer.

## Required inputs

Start with:

- The product brief and primary journey.
- The domain glossary.
- The capability purpose and actors.
- Known business policies, examples, and failure cases.
- Decisions that constrain identity, persistence, security, or external behavior.

If a command depends on an unknown policy, record it under `Open modeling questions` in the capability document and stop that use case. Other use cases with complete rules may continue.

## Name the capability language

Record each capability term with one definition and any rejected synonyms. Use the same term in documentation, Domain types, Application operations, API descriptions, and frontend features.

For a publishing capability:

| Term | Definition | Rejected synonyms |
|:---|:---|:---|
| Post | Author-owned content that moves through the publication lifecycle. | Article, entry |
| Publish | Make a draft post visible to readers. | Activate, enable |
| Archive | Remove a published post from normal reader discovery while retaining it. | Delete, disable |

Rejected synonyms prevent later contributors from creating types such as `ArticleStatus` beside `PostState`.

## Draw aggregate boundaries from invariants

Group data that must remain consistent in one command transaction. Name the root, owned children, referenced aggregate IDs, and the invariant that requires the boundary.

```text
Post
  owns: PostTitle, PostContent, PostState, PostTag values
  references: AuthorId
  protects: publication and editing rules
```

An aggregate owns a child when the child has no independent consistency boundary and is changed through the root. Reference another aggregate by typed ID when it can change independently.

Do not place `Author` inside `Post` to make author data easy to read. Store `AuthorId` and use a read projection for author presentation.

## Define every aggregate state

Create an abstract state record and sealed state records before writing aggregate transitions. Every aggregate has this hierarchy, including an aggregate with one current state.

```csharp
public abstract record PostState;

public sealed record DraftPostState : PostState;

public sealed record PublishedPostState(
    DateTimeOffset PublishedAt) : PostState;

public sealed record ArchivedPostState(
    DateTimeOffset ArchivedAt,
    ArchiveReason Reason) : PostState;
```

Put state-specific data on the state record. Do not duplicate `PublishedAt` or `ArchivedAt` on the aggregate. Do not add `PostStatus`, `IsPublished`, or a state string.

For each state, answer:

- What business fact makes this state true?
- Which data is required only in this state?
- Which actions are allowed from this state?
- Which actions are rejected from this state, and why?

An unanswered question belongs in the capability document. It does not receive a guessed default.

## Write the transition table

Record each business action with its source state, target state, invariant IDs, event, and owning use case.

| From state | Business action | To state | Invariant IDs | Event | Use case |
|:---|:---|:---|:---|:---|:---|
| `DraftPostState` | `Publish` | `PublishedPostState` | `INV-POSTS-01` | `PostPublished` | `posts.publish-post` |
| `PublishedPostState` | `Archive` | `ArchivedPostState` | `INV-POSTS-02` | `PostArchived` | `posts.archive-post` |

The aggregate root owns the transition method. State records remain immutable data.

```csharp
public void Publish(DateTimeOffset publishedAt)
{
    if (State is not DraftPostState)
    {
        throw new PostCannotBePublishedException(Id, State);
    }

    State = new PublishedPostState(publishedAt);
    RaiseDomainEvent(
        new PostPublished(Id, AuthorId, Title, publishedAt));
}
```

Document rejected source states in the use-case failure table and acceptance criteria. A transition table with no owning use case identifies behavior that cannot yet be delivered or tested.

## Give invariants stable identities

Write each shared rule once in the capability document and assign `INV-{CAPABILITY}-{NN}`.

| ID | Rule | Protected by | Failure |
|:---|:---|:---|:---|
| `INV-POSTS-01` | Only a draft post can be published. | `Post.Publish` | `PostCannotBePublishedException` |
| `INV-POSTS-02` | Only a published post can be archived. | `Post.Archive` | `PostCannotBeArchivedException` |

Do not renumber an accepted invariant. A revised business rule updates the existing ID unless its meaning is replaced by a distinct rule. A removed rule remains traceable through history and retired use-case documentation.

## Select entities and value objects

Use a child entity when identity and continuity matter inside the aggregate. Use a value object when complete value defines equality.

Examples:

- `OrderLineId` identifies one line through quantity changes, so `OrderLine` is an entity.
- `PostTitle` is replaced as a complete value, so it is a value object.
- `Money` combines amount and currency and defines arithmetic rules, so it is a value object.
- `PostTags` defines collection equality and normalization, so it is a collection value object.

Give each aggregate a typed version 7 ID. Use typed IDs for other identities that participate in Domain behavior. Keep raw primitives for mechanical values with no domain meaning, such as a loop index.

## Separate validation from invariants

Application validation handles caller-correctable structure before the command handler. Domain objects repeat their own rules so no invalid object can enter through a test, background process, or future host.

For `PostTitle`:

- The validator returns stable errors for missing text or more than 200 characters.
- `PostTitle.Create` checks the same limits and throws a specific Domain exception if another caller bypasses validation.
- `Post` accepts `PostTitle`, not the raw string.

Aggregate state decides whether behavior is allowed. That check never moves into an Application validator because the validator does not own the aggregate's current state.

## Identify domain services

Place a rule on the aggregate or value object that owns it. Use a stateless domain service only when no object is a natural owner.

`Order.CalculateSubtotal` belongs on `Order` or its lines. A pricing policy combining order lines with a project-owned discount schedule may use `OrderPricingDomainService` when neither aggregate owns the complete calculation.

The service accepts Domain values and returns a Domain value or decision. Application obtains required aggregates and external facts before calling it.

## Record events and reactions

Name each event as a completed business fact. Include immutable values required to understand that fact, without carrying the aggregate.

| Event | Fact | Reaction | Delivery |
|:---|:---|:---|:---|
| `PostPublished` | A draft became published at a specified time. | Notify subscribers. | Durable when subscriber notification cannot be lost. |

A domain event remains an internal Domain contract. Translate it to a separate integration event when another system consumes a versioned external message.

The event table may list no reaction. Events can remain useful as explicit business facts and test evidence. Do not create an event solely because every method is expected to emit one.

## Map the model to use cases

Each command use-case specification names:

- Aggregate and business method.
- Source and target states.
- Invariant IDs.
- Domain events.
- Rejected states and observable failures.
- Acceptance criteria for allowed and rejected behavior.

Each query states that it has no Domain transition and names its read source. A query may expose state as a stable response field, but the API representation does not replace the Domain state records.

Update the capability coverage table after the use cases have stable acceptance IDs:

| Invariant or transition | Use cases | Acceptance criteria |
|:---|:---|:---|
| `INV-POSTS-01` | `posts.publish-post` | `AC-POSTS-PUBLISH-POST-01`, `AC-POSTS-PUBLISH-POST-02` |

Do not record test class or method names. Automated tests cite acceptance IDs, and the acceptance IDs map back to invariant IDs through the use-case specification.

## Check structural completeness

Agents and reviewers may report these gaps without deciding the missing business policy:

- An aggregate with no state record hierarchy.
- A state with no business definition.
- A transition with no use case.
- A command use case with no source or target state.
- An invariant with no acceptance criterion.
- An event with a mutable value or aggregate reference.
- A reaction with no delivery requirement.
- A term used in code but absent from the glossary or capability language.
- Two names for the same domain concept.

Structural completeness does not prove that the business model is correct. Domain experts still approve the language, boundaries, states, transitions, and invariants.

## Completion check

- The capability language uses one term for each concept and records rejected synonyms.
- Every aggregate boundary names owned children and referenced aggregate IDs.
- Every aggregate has an explicit state record hierarchy.
- State-specific data appears only on its state record.
- Every transition maps to an aggregate method and command use case.
- Every invariant has a stable ID and acceptance coverage.
- Value objects define validation and equality, including collection and money rules.
- Domain services are stateless and have no outer-layer dependency.
- Events contain stable business facts and no aggregate references.
- Persistence tests round-trip every concrete state record.
