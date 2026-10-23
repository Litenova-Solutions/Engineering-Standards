# Overview

## Intent

The backend pages state how a LiteSpec server application is built: its layers, business model, coordination of use cases, storage, HTTP boundary, testing, and record identifiers, with the stack binding that realizes each one. A use case is one command or query with its access, results, and scenarios; a reaction answers an event, and a job runs scheduled or operator work. A server project applies these pages through its stack, while a product without a server applies only the architecture, domain, application, and identifier pages, so every reader finds the rules for the parts their product has and no others.

## How the Pages Fit Together

The seven principle pages directly in this folder hold for every backend. They say what each layer owns and which direction references point, without naming a framework or a package. The [.NET Stack](dotnet/stack.md) states how the .NET backend realizes those principles: its projects, its C# shapes, its Marten persistence, and its test suites. A team that adds a use case reads the principle page for the layer it touches, then the matching .NET page for the binding.

## Backend Principles

- [Backend Architecture](architecture.md): the five parts, the direction references point, and the modules and use cases that organize every layer.
- [Domain Layer](domain.md): aggregates, lifecycles, closed value sets, and domain repositories, and the boundary that keeps technical concerns out of business rules.
- [Application Layer](application.md): use-case coordination, pipeline stages, ports, reactions, jobs, and declared effects.
- [Persistence](persistence.md): domain repositories, the read session, the one commit per command, and the obligations on stored data.
- [HTTP API](api.md): endpoints, routes, errors, collection paging, and the generated OpenAPI contract.
- [Backend Testing](testing.md): the test suites each project size keeps and what each suite may use.
- [Record Identifiers](identifiers.md): the identifier form for each record type and how citations resolve.

## Backend Stack

- [.NET Stack](dotnet/stack.md): the .NET binding of every principle page, and the test-result formats the model builder reads.
- [.NET Extensions Overview](dotnet/ext/README.md): the extensions only a .NET backend offers: executable BDD scenarios and EF Core persistence.
