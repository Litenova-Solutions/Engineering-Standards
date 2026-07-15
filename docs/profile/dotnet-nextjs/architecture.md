---
{
  "id": "profile.dotnet-nextjs.architecture",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["backend.domain", "backend.application", "backend.infrastructure"],
  "recipes": []
}
---
# Architecture

The default profile is a modular monolith with four application projects. CQRS separates command and query behavior inside one Application assembly.

## Agent Quick Rules {#agent-quick-rules}

- Use Domain, Application, Infrastructure, and WebApi as the application core.
- Keep Domain package-free from persistence, web, and mediator frameworks.
- Keep commands, queries, validators, handlers, and reactions in one feature-first Application project.
- Use project references and architecture tests to enforce dependencies.
- Add Worker only when an enabled recipe needs a separate process.

## ARCH.PROJECTS.001 - Use four core projects

Create:

```text
apps/api/{ProjectName}.Domain/
apps/api/{ProjectName}.Application/
apps/api/{ProjectName}.Infrastructure/
apps/api/{ProjectName}.WebApi/
```

Aspire projects support local hosting:

```text
apps/api/{ProjectName}.AppHost/
apps/api/{ProjectName}.ServiceDefaults/
```

They are hosts, not application layers.

## ARCH.DEPENDENCIES.001 - Point dependencies inward

The allowed project references are:

- Domain references no application project.
- Application references Domain.
- Infrastructure references Domain and Application.
- WebApi references Application and Infrastructure.
- AppHost references host projects through Aspire resource references.
- Worker references Application and Infrastructure when enabled.

WebApi may reference Infrastructure because `Program.cs` is the composition root. Endpoint classes cannot resolve repositories or Marten sessions.

## ARCH.APPLICATION.001 - Keep one Application assembly

Commands, queries, their public results, validators, handlers, domain-event reactions, and external capability ports live in one Application project.

Separate command and query mediator interfaces preserve intent. Separate Contracts, Write, Read, and Reactions projects are outside this profile.

## ARCH.FEATURES.001 - Organize Application by use case

Use feature and operation folders:

```text
Application/
  Posts/
    CreatePost/
      CreatePostCommand.cs
      CreatePostValidator.cs
      CreatePostHandler.cs
      CreatePostResult.cs
    GetPost/
      GetPostQuery.cs
      GetPostHandler.cs
      GetPostResult.cs
    OnPostPublished/
      PostPublishedHandler.cs
```

Do not create project-wide `Commands`, `Queries`, `Handlers`, or `Validators` folders.

## ARCH.VISIBILITY.001 - Keep implementation types internal

Commands, queries, results, shared application contracts, external capability ports, and assembly markers may be public when another project needs them. Handlers and validators are `internal sealed`.

An Infrastructure implementation cannot implement an internal Application interface. Any port implemented by Infrastructure must be public.

## ARCH.DOMAIN.001 - Keep business invariants in Domain

Aggregates and value objects enforce state transitions and invariants. Command handlers coordinate loading, mutation, and staging. They do not reimplement aggregate rules.

A `Publish` method rejects an already published post inside the aggregate. The handler does not inspect and set publication fields itself.

## ARCH.CQRS.001 - Separate write and read models by behavior

Commands mutate aggregates through repositories. Queries project result models through `IQuerySession`. A query does not load an aggregate, and a command does not use a query projection to enforce an aggregate invariant.

## ARCH.WORKER.001 - Add Worker only for a process boundary

Create Worker for durable outbox dispatch, queue consumption, or scheduled work that must continue independently of HTTP requests. Do not create Worker for a short best-effort task that can remain inside the WebApi host.

## ARCH.ENFORCEMENT.001 - Test structural boundaries

Architecture.Tests must verify project references, forbidden package dependencies, handler visibility, endpoint boundaries, and feature isolation rules that the compiler cannot prove alone.
