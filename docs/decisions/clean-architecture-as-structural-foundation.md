# Clean Architecture as Structural Foundation

**Status:** Accepted

**Date:** 2025-01-01

## Context

As applications grow, the cost of changing business logic increases because it is entangled with infrastructure concerns: database queries, HTTP calls, email sending, and framework details. Testing becomes difficult because unit tests require spinning up databases or mocking framework internals. Onboarding new engineers or agents is harder because there is no single place where business rules live.

Several architectural patterns address this:

1. **Layered Architecture (traditional N-tier):** Business logic, data access, and presentation in separate layers, but dependencies flow downward and the domain typically depends on the database layer.
2. **Clean Architecture / Hexagonal Architecture / Ports and Adapters:** The domain is the innermost layer with no outward dependencies. All infrastructure depends on the domain, never the reverse.
3. **Modular Monolith:** Modules with enforced boundaries but without strict dependency inversion.

The core benefit of Clean Architecture is the Dependency Inversion Principle applied at the architectural level: the Domain layer defines abstractions (repository interfaces, event publisher interfaces) and Infrastructure implements them. The Domain never references a NuGet package for database access or HTTP communication. This means the domain can be tested in pure memory without any infrastructure setup.

## Decision

All projects use Clean Architecture as the structural foundation. The dependency rule is: dependencies point inward only. The layer order from innermost to outermost is: Domain, Application, Infrastructure, WebApi. Domain has no external dependencies. Application depends on Domain. Infrastructure depends on Application and Domain. WebApi depends on Application contracts and Infrastructure (for DI registration).

## Consequences

### Positive

- The domain is fully testable in isolation with no infrastructure dependencies.
- Infrastructure can be swapped (e.g., switching from PostgreSQL to a different database) without changing domain or application logic.
- The project structure communicates the architecture: engineers and agents can tell what is business logic and what is infrastructure by looking at which project a file is in.
- Architecture tests can enforce the dependency rule mechanically.

### Negative

- More projects and more boilerplate than a simple layered architecture.
- Mapping between domain objects and persistence models adds code.
- Engineers unfamiliar with dependency inversion need to learn the pattern before contributing.

### Risks

- The discipline must be maintained through code review and architecture tests. Without enforcement, the dependency rule erodes over time as shortcuts are taken under time pressure.