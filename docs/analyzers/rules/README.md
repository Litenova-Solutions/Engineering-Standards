# Overview

## Intent

This index lists the 24 analyzer rules, one reference page per rule, grouped by the projects each rule runs in. A developer who meets an error opens the page with the same ID to see what the rule reports, where the error sits, and how to fix the code. Each entry carries a 1-line summary of what the rule reports.

## Domain Rules

Rules `LS1001` to `LS1013` run in Domain only.

- [LS1001: Domain References an Outer-Layer Concern](ls1001.md): reports a Domain use of an outer-layer namespace.
- [LS1002: Domain Declares an Enum](ls1002.md): reports an enum declared in Domain.
- [LS1003: Aggregate Has No State Record](ls1003.md): reports an aggregate with no `State` record.
- [LS1004: State Case Is Not Sealed](ls1004.md): reports a state case that is not sealed.
- [LS1005: Domain Throws a Non-Domain Exception](ls1005.md): reports a throw of a non-`DomainException` type.
- [LS1006: Domain Exception Is Misnamed or Open](ls1006.md): reports a `DomainException` subclass that is misnamed or open.
- [LS1007: Domain Event Is Not an Immutable Record](ls1007.md): reports a domain event that is not an immutable record.
- [LS1008: Domain Uses Binary Floating Point](ls1008.md): reports a `double` or `float` use.
- [LS1009: Domain Reads a Nondeterministic Value](ls1009.md): reports a read of the clock, randomness, or a new identifier.
- [LS1010: Repository Exposes a Query Surface](ls1010.md): reports a repository that exposes a query surface.
- [LS1011: Public Domain Contract Is Undocumented](ls1011.md): reports a public contract without XML documentation.
- [LS1012: Identifier Is Not a Strongly Typed Value](ls1012.md): reports an identifier that is not a strongly typed value.
- [LS1013: Domain Event Sits Outside the Events Folder](ls1013.md): reports a domain event outside the `Events` folder.

## Outer-Layer Rules

Rules `LS2001` and `LS2003` to `LS2007` run in Application, Infrastructure, or WebApi, as each page states.

- [LS2001: Implementation Type Is Not Internal Sealed](ls2001.md): reports an implementation type that is not `internal sealed`.
- [LS2003: WebApi Uses an MVC Controller](ls2003.md): reports an MVC controller.
- [LS2004: Command Handler Writes Through a Document Session](ls2004.md): reports a command handler that writes through a session.
- [LS2005: Handler Name Lacks Its Command or Query Suffix](ls2005.md): reports a handler whose name lacks its command or query suffix.
- [LS2006: Endpoint Name Lacks Its Suffix](ls2006.md): reports an endpoint whose name does not end in `Endpoint`.
- [LS2007: Reaction or Job Name Hides Its Kind](ls2007.md): reports a reaction or job whose name hides its kind.

## Naming and Style Rules

Rules `LS3001` to `LS3004` run in the five production projects.

- [LS3001: Asynchronous Method Name Lacks Async](ls3001.md): reports an async method name without `Async`.
- [LS3002: CancellationToken Is Not the Last Parameter](ls3002.md): reports a `CancellationToken` that is misplaced or misnamed.
- [LS3003: File Does Not Match Its Primary Type](ls3003.md): reports a file that does not match its primary type.
- [LS3004: Concrete Class Is Not Sealed](ls3004.md): reports a concrete leaf class that is not sealed.

## Test Rules

Rule `LS4001` runs in test projects only.

- [LS4001: Test Contains No Assertion](ls4001.md): reports a test method with no assertion.
