# Model a Domain Module

## Purpose

This tutorial models one domain module that the model builder reads. At the end the module holds its language, its business records, its rules, its use cases, its events, and its permissions. The worked example is the circulation desk of a library.

This guide carries no provision. Each step cites the provisions it satisfies.

## Prerequisites

- Finish [Get started](getting-started.md) through its configuration steps.
- Read the product brief and the requirements this module fulfils.
- Read the decisions that constrain identity, persistence, security, or external behavior.
- Copy the `module.md`, `business-record.md`, and `use-case.md` templates from the [template index](../../templates/consumer/README.md).

## Lesson

1. Name the module language. Write one Term entry per word with its meaning, its labels, and the words it rejects. Use the same term in documentation, domain types, application operations, API descriptions, and frontend features. This satisfies `litespec/rule/backend-domain.use-one-ubiquitous-language`.

    | Term | Meaning | Rejected words |
    |:---|:---|:---|
    | `term/loan` | One member holds one copy until its due date | Checkout, issue |
    | `term/copy` | One lendable item on the shelves | Volume, unit |
    | `term/member` | One person allowed to borrow | Patron, user |

    Rejected words stop a later contributor from creating `Checkout` beside `Loan`. They also tell an agent which plausible names are wrong for this domain.

2. Write the occasion before the rules. Name one occasion the module exists for: who acts, what surrounds them, and what they use today instead. Record it in the module page, and reuse its people and figures on every page beneath it. This satisfies `litespec/rule/core-system.state-one-occasion-for-every-behavior-record` and `litespec/rule/core-system.keep-a-scenario-informative`.

    Saturday morning at the central library brings two hundred members before noon. Each hands books across the desk and trusts the stamp card inside the cover. Without a loan record, the desk reconstructs who holds what from the card index and memory.

3. Write the module record. Give the module a person-chosen identifier such as `module/circulation`. Name each module it depends on, or remove the field. This satisfies `litespec/rule/core-system.group-language-and-use-cases-by-module`.
4. Draw business-record boundaries from invariants. A business record is a consistency boundary: state that must stay valid together in one command. An invariant is a condition that holds before and after every successful change. This satisfies `litespec/rule/backend-domain.treat-aggregates-as-consistency-boundaries` and `litespec/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary`.

    | Business record | Owns | References by typed ID |
    |:---|:---|:---|
    | `business-record/circulation.loan` | Loan lifecycle, due date, return facts | `CopyId`, `MemberId` |
    | `business-record/circulation.hold` | Hold queue position and expiry | `CopyId`, `MemberId` |

    A record owns a child when the child has no independent boundary and changes only through the record. Reference another record by typed ID when it changes on its own. Do not place `Member` inside `Loan` for convenient navigation. This satisfies `litespec/rule/backend-domain.reference-other-aggregates-by-id`.
5. Define every state. A state is a business-valid condition with its required data and permitted behavior. Describe states before writing transitions. This satisfies `litespec/rule/backend-domain.model-every-aggregate-lifecycle-with-state-types`.

    | State | Meaning | Required facts |
    |:---|:---|:---|
    | `Open` | The copy is out and the member holds it | Due date |
    | `Returned` | The copy is back on the shelves | Return date |

    Create an abstract state record and one sealed record per state. Put state-specific data on the state record. This satisfies `litespec/rule/dotnet-domain.model-every-aggregate-lifecycle-with-state-records`.

    ```csharp
    public abstract record LoanState;

    public sealed record LoanOpenState(
        DateTimeOffset DueDate) : LoanState;

    public sealed record LoanReturnedState(
        DateTimeOffset ReturnedAt) : LoanState;
    ```

    For each state, answer what makes it true, which data it alone requires, and which actions it allows and rejects. An unanswered question stays on the page. It receives no guessed default.
6. Write the rules with kinds. Give each rule a person-chosen identifier of one to six lowercase words. A statement with not, no, never, or cannot keeps that word in its name. This satisfies `litespec/rule/core-system.state-each-rule-with-its-kind`.

    | Rule | Kind | Enforced by | Statement | Refusal |
    |:---|:---|:---|:---|:---|
    | `rule/loan.only-an-open-loan-closes` | `always-true` | `aggregate` | Only an open loan closes. | `result/return-a-copy.loan-not-open` |
    | `rule/loan.a-due-date-is-required-to-borrow` | `checked-before` | `validator` | A borrow carries a due date. | `result/borrow-a-copy.due-date-missing` |
    | `rule/loan.no-copy-carries-two-open-loans` | `across-records` | `store` | No copy carries two open loans. | `result/borrow-a-copy.copy-already-on-loan` |

    An `always-true` rule holds after every change to its record. A `checked-before` rule rejects caller-correctable input before domain work starts. An `across-records` rule spans records that one transaction cannot hold. Input shape stays in the validator; current record state stays in the record. This satisfies `litespec/rule/backend-application.separate-input-validation-from-invariants`.
7. Name the people and their permissions. Write one actor page per party and one role page per grantable set. Name the permission each use case needs. This satisfies `litespec/rule/backend-application.enforce-target-authorization-in-the-pipeline`.

    | Actor | Role | Permission |
    |:---|:---|:---|
    | `actor/member` | `role/member` at self scope | `permission/borrow-copy` |
    | `actor/librarian` | `role/librarian` at desk scope | `permission/close-any-loan` |

8. Write the use cases. Give each use case a name that is unique across the project, so its results and cases resolve. Name the operation, the needed permissions, the entry points, the raised events, and the fulfilled requirements. This satisfies `litespec/rule/backend-application.use-this-operation-layout` and `litespec/rule/backend-application.keep-command-handlers-narrow`.

    | Use case | Operation | Needs | Raises |
    |:---|:---|:---|:---|
    | `use-case/circulation.borrow-a-copy` | `command` | `permission/borrow-copy` | `event/loan.copy-borrowed` |
    | `use-case/circulation.return-a-copy` | `command` | `permission/borrow-copy` | `event/loan.copy-returned` |
    | `use-case/circulation.list-open-loans` | `query` | `permission/borrow-copy` | None |

    A query states no domain transition and names its read model. It loads no business record for presentation.
9. Write one result per ending. A result is one way a use case ends: success, or a named refusal with its failure code. This satisfies `litespec/rule/backend-application.model-expected-use-case-failures-explicitly` and `litespec/rule/backend-api.use-consistent-status-codes`.

    | Result | Outcome | Code | Status |
    |:---|:---|:---|:---|
    | `result/borrow-a-copy.copy-borrowed` | `success` | None | 201 |
    | `result/borrow-a-copy.copy-already-on-loan` | `refusal` | `failure/circulation.copy-already-on-loan` | 409 |
    | `result/borrow-a-copy.due-date-missing` | `refusal` | `failure/circulation.due-date-missing` | 400 |

    Each refusal explains what the caller sees. The failure code is stable across releases.
10. Write the cases. A case is one working example: a situation and the result it leads to. Each case names its result. A case with no proving test yet becomes a known-gap record with an owner and an end date.

    | Case | Situation | Action | Result | Expect |
    |:---|:---|:---|:---|:---|
    | `case/borrow-a-copy.first-borrow-succeeds` | The copy sits on the shelf | The member borrows it | `result/borrow-a-copy.copy-borrowed` | The loan opens with a due date |
    | `case/borrow-a-copy.second-borrow-is-refused` | The copy is already out | Another member borrows it | `result/borrow-a-copy.copy-already-on-loan` | The desk sees the refusal code |

    Name each test by the observable behavior it asserts. This satisfies `litespec/rule/backend-testing.name-tests-by-observable-behavior`. An acceptance scenario carries one `/// <proves>case/...</proves>` tag. The model builder confirms the claim when the scenario calls the use case and asserts the result.
11. Record the events. An event is an immutable record of a completed fact. Name what completed and which fields it carries. This satisfies `litespec/rule/dotnet-domain.raise-immutable-domain-facts`.

    | Event | Meaning | Carries |
    |:---|:---|:---|
    | `event/loan.copy-borrowed` | A member took a copy from the desk | `loanId`, `copyId`, `memberId`, `dueDate` |
    | `event/loan.copy-returned` | A copy came back to the shelves | `loanId`, `copyId`, `returnedAt` |

    Work that crosses a transaction or time boundary is a use case that reacts to an event, or a use case on a schedule. It declares what it reacts to and its delivery. This satisfies `litespec/rule/backend-application.keep-event-reaction-implementations-explicit`.
12. Keep one transaction per command. One handler stages the records its use case owns and lets the pipeline commit once. It dispatches no further command. This satisfies `litespec/rule/backend-application.keep-one-state-changing-use-case-in-one-pipeline` and `litespec/rule/backend-persistence.commit-each-command-pipeline-once`.
13. Map the model to folders. Mirror the module, record, and use case path in every layer. This satisfies `litespec/rule/backend-architecture.organize-every-layer-by-module-and-use-case` and `litespec/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

    ```text
    apps/api/src/Library.Domain/
      Circulation/
        Loans/
          Loan.cs
          LoanId.cs
          ILoanRepository.cs
          States/
            LoanState.cs
            LoanOpenState.cs
            LoanReturnedState.cs
          Events/
            CopyBorrowedEvent.cs
          Exceptions/
            CopyAlreadyOnLoanException.cs

    apps/api/src/Library.Application/
      Circulation/
        Loans/
          BorrowACopy/
            BorrowACopyCommand.cs
            BorrowACopyCommandResult.cs
            BorrowACopyCommandValidator.cs
            BorrowACopyCommandHandler.cs
    ```

    Create subfolders only when real types require them.
14. Run the model check. Run `litespec model check` from the consumer root. It resolves every citation, computes the code, screen, and test links, and reports each unproved case. The [command index](../tools/README.md) states how `litespec` runs in a consumer.

## What you built

- One module with its language, records, rules, use cases, results, cases, events, and permissions.
- Every identifier is person-chosen, and every citation resolves.
- Every case is proved by a passing test or owned by a known gap.
