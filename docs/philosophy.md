# Engineering Philosophy

This document explains why the architecture is designed the way it is. It is written for humans: engineers evaluating the standards, clients reviewing the approach, and new team members onboarding. AI agents MUST NOT load this file for routine coding tasks; actionable rules live in `docs/conventions/`, `docs/guides/agentic-domain-driven-design.md`, and `AGENTS.md`.

---

## 1. Why Architecture Matters More Than Frameworks

Frameworks come and go. React was replaced in parts by Next.js. Spring Boot evolves year to year. Entity Framework has had multiple incompatible versions. The decisions you make at the framework level are temporary. The decisions you make at the architectural level outlast every framework choice you will ever make.

The value of a codebase is not in its framework selection. It is in the business logic that the software captures: the rules, invariants, and processes that represent real understanding of a domain. Architecture is the set of decisions that keep that logic accessible, testable, and modifiable regardless of what technology surrounds it. A good architecture makes it possible to swap a database, change a transport protocol, or replace a third-party library without rewriting the core of the system.

---

## 2. Why Clean Architecture

The core insight of Clean Architecture is that dependencies should point inward toward the domain, never outward toward infrastructure. The domain model has no dependencies. The application layer depends only on the domain. Infrastructure depends on both. The UI and API layers are the outermost ring: they depend on the application layer and can be replaced without touching any domain or application code.

This matters in practice for three reasons. First, tests run in milliseconds. A domain model with no external dependencies can be tested with nothing but the .NET runtime. No database setup, no HTTP server, no container, no wait. Second, business logic is portable. The domain and application layers can be extracted from one hosting context (a web API) and placed in another (a background job, a CLI tool, a different framework version) because they carry no framework-specific coupling. Third, technology decisions are reversible. When PostgreSQL is replaced by a document database, the change is confined to the Infrastructure layer. The domain and application logic do not know the difference.

---

## 3. Why Domain-Driven Design

Domain-Driven Design is not primarily a set of patterns. Aggregates, value objects, and domain events are useful tools, but they are not the point. The point is that the **entire system** speaks the language of the business: code, documentation, folder structure, and agent context.

When the code uses the same words as the business, the cost of translating requirements into implementation drops to near zero. A product owner says "a post can be published only once." The code has a method called `Publish()` on a `Post` aggregate that throws `PostAlreadyPublishedException`. There is no translation. The requirement and the code are in the same language. This is ubiquitous language, and it is the most valuable practice in DDD.

When the language drifts, when the code calls something an `Item` that the business calls an `OrderLine`, or when a method called `ProcessData` represents what the business calls `PublishPost`, the translation cost reappears at every requirement meeting, every code review, and every bug investigation.

DDD is not confined to the backend `Domain` project. It applies to:

- **Living domain docs** under `docs/domain/{feature}/` (feature README + use case docs as the human-readable source of truth)
- **Backend handlers** under `{Aggregate}/{UseCase}/`
- **Frontend modules** under `features/{feature}/{use-case}/` (not generic "feature slices" or technical folder names)

The same Feature → Use case boundary appears in all three places. An agent or engineer moves through `posts/create-post.md`, `Posts/Create/`, and `features/posts/create/` with the same mental model.

---

## 4. Why CQRS

The fundamental insight behind CQRS is that reads and writes have different requirements. Write operations need consistency, invariant enforcement, and transaction safety. They are infrequent relative to reads and their correctness is non-negotiable. Read operations need throughput, projection flexibility, and low latency. They are frequent, often involve data from multiple aggregates, and their shape changes as reporting and UI requirements evolve.

Putting both through the same model creates a system that satisfies neither requirement well. A query that asks "what are the titles of all published posts?" should not be forced through the same aggregate loading and invariant-checking machinery designed for the command that publishes a post. The split into Write, Read, and Reactions projects is a structural expression of this insight: the compiler prevents a query handler from loading an aggregate, because the query handler project has no reference to the repository interface. The separation is not organizational preference. It is an architectural constraint with real consequences for correctness and performance.

---

## 5. Why Explicitness Over Convention

Convention-over-configuration frameworks hide behavior. When something goes wrong in a Rails application or a Spring Boot application, the debugging path often goes through framework internals rather than application code. The behavior was inferred from a naming convention or a configuration file, and understanding what actually happened requires understanding how the framework interprets that convention.

Explicit code is slower to write and faster to debug. In a long-lived codebase, the ratio of time spent debugging to time spent writing new code is heavily skewed toward debugging. The keystrokes saved by convention-over-configuration are paid back many times over in debugging hours. The `IEndpoint` pattern is explicit: every endpoint is a class, every class is in a folder named after its use case, and the routing and parameter binding are written in plain C# that any developer can read. There is no framework magic to understand.

---

## 6. Why Screaming Architecture

Folder structure is the first thing a new engineer sees when they open a codebase. It is the first signal about what the system does and how it is organized. A folder called `Services/` tells you nothing about the business. A folder called `Posts/` tells you the system handles posts. A folder called `Posts/Publish/` tells you that publishing is a distinct, named use case with its own handler, its own validator, and its own endpoint.

Screaming architecture means the folder structure communicates the business model without requiring any code to be read. An engineer who has never seen the codebase should be able to understand what the system does from its folder names alone.

This applies at every layer:

| Layer | Example path | What it screams |
|:---|:---|:---|
| Domain docs | `docs/domain/posts/create-post.md` | Create Post use case |
| Backend write | `Posts/Create/` | Same use case, command side |
| Backend read | `Posts/List/` | List posts query |
| Frontend | `features/posts/create/` | Same use case, UI |
| App Router | `app/(main)/posts/new/page.tsx` | Thin routing shell only |

The hierarchy is documentation that stays honest when domain docs are updated in the same pull request as the code they describe.

---

## 7. Why Agentic Domain-Driven Design

AI agents are now primary contributors to codebases. That changes how we document and structure software.

**Agentic development** means explicit rules and compiler-enforced boundaries outperform team culture when agents generate code. A rule in `AGENTS.md` helps; a project reference that makes the wrong pattern fail to compile helps more.

**Domain-driven documentation** means living domain docs under `docs/domain/` are the source of truth for what the system does. There are no parallel inventories, glossaries, route lists, or exception catalogs. Ubiquitous language, invariants, endpoints, UI flows, and acceptance criteria live in the feature README or use case doc where they belong. Docs are updated in the same pull request as code.

Together, **Agentic Domain-Driven Design (ADDD)** combines:

1. DDD boundaries in docs, backend, and frontend
2. Explicit, reviewable use case docs before agent implementation
3. Structural guardrails (Clean Architecture, CQRS, architecture tests) that survive context window limits

Industry practice calls the documentation half "spec-driven development." We use DDD terms: domain docs, features, and use cases. The intent is the same: write the contract in business language first, implement against it, keep the contract current.

Consistent structure lets agents move through the codebase confidently. An agent that sees `Posts/Publish/PublishPostCommandHandler.cs` and `features/posts/publish/` and `docs/domain/posts/publish-post.md` can extend the system without inventing new vocabulary or folder patterns.

See `docs/agentic-development.md` for agent failure modes and guardrails. See `docs/guides/agentic-domain-driven-design.md` for the documentation workflow.

---

## 8. Why We Ban Dual-Writes (Outbox Resiliency Philosophy)

A dual-write occurs when an application attempts to update state in a database and simultaneously notify or update another system (e.g., publishing a message to a broker, calling an external payment gateway, or sending a transactional email) inside the same logical operation.

Dual-writes are an architectural anti-pattern because **distributed systems fail in partial ways**:
1. If the database commit succeeds but the network call to the external service fails (due to latency, packet loss, or service outage), the external system remains unaware of the change. State is now permanently desynchronized.
2. If the external service call succeeds but the subsequent database transaction fails or is rolled back, the external system has committed a side effect for a change that never happened in our system (e.g., shipping an order that was canceled).

We solve this using the Outbox pattern. A command handler's transaction writes *only* to the local database—modifying the aggregate state and inserting a pending event record into the `outbox` table in the exact same atomic transaction. The request then terminates immediately, returning success. A separate, resilient, background process reads these rows asynchronously and handles the external deliveries.

By decoupling the persistence of the intent from the execution of the side effect, we guarantee that the event is eventually delivered at least once, even in the event of hardware, database, or network failure.

---

## 9. Why Client State and Server Cache are Mutually Exclusive

A common frontend failure mode is storing fetched server data (e.g., user profiles, list of posts, shopping cart items) inside global UI state management systems (such as Zustand, Redux, or MobX). This is a conceptual error.

Server state is fundamentally different from client state:
- **Server state** is not owned by the client. It lives on a remote system, can be mutated by other users or background tasks, and represents a read-only snapshot that is immediately stale the moment it is retrieved.
- **Client state** is owned entirely by the client. It lives in the browser's memory, represents ephemeral UI configuration (e.g., which sidebar is open, active tab, text input drafts), and is 100% accurate at all times.

Attempting to merge these two distinct models into a single store forces engineers to write highly complex manual synchronization, loading state management, and manual cache invalidation code.

We partition these concerns:
1. **TanStack Query** acts as a highly optimized, automated **remote cache**. It owns all server state, handles polling, request deduplication, loading/error states, and automatic cache invalidation.
2. **Zustand** acts as the **ephemeral UI state store**. It contains *zero* server-fetched properties and no manual fetch functions.

This separation ensures that UI state remains predictable, rendering cycles are isolated, and server data stays synchronized without manual orchestration.
