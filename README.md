<p align="center">
  <img src="assets/agentic-engineering-system-icon.svg" alt="Agentic Engineering System" width="88" height="88">
</p>

<h1 align="center">Agentic Engineering System</h1>

<p align="center">
  <a href="https://www.litenova.solutions/Standards"><img src="https://img.shields.io/badge/docs-online-f8c258?labelColor=3e3643" alt="Documentation"></a>
  <a href="https://github.com/Litenova-Solutions/Engineering-Standards/releases/latest"><img src="https://img.shields.io/github/v/release/Litenova-Solutions/Engineering-Standards?label=version&color=3e3643" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Litenova-Solutions/Engineering-Standards" alt="MIT license"></a>
</p>

## Intent

The Agentic Engineering System is the standards contract Litenova Solutions uses for software work by humans and AI agents.

Standards v1.14.0 targets one bounded-context business application. The `dotnet-nextjs` profile uses ASP.NET Core, PostgreSQL, Marten, and zero or more Next.js frontends. The `dotnet-blazor` profile replaces the frontend with a .NET WebAssembly client.

## What It Defines

- Product and domain specifications that own approved intent.
- Domain, Application, Infrastructure, and WebApi boundaries.
- Implementation conventions for backend and frontend work.
- Verification, security, operations, and release evidence.
- Conditional extensions for capabilities outside the baseline.
- Controlled technical prose for standards and agent instructions.

The baseline profile applies first. An extension or consumer decision names each Standard that it replaces.

## Documentation

- [Hosted documentation](https://www.litenova.solutions/Standards)
- [Repository documentation index](docs/README.md)
- [Agentic Engineering System foundation](docs/core/system.md)
- [Authoring standard](docs/core/authoring.md)
- [Get started](docs/guide/getting-started.md)

## Use the Standards

Pin a published release as a repository submodule:

```bash
git submodule add https://github.com/Litenova-Solutions/Engineering-Standards.git standards
git -C standards checkout --detach <approved-tag-or-commit>
```

Add `standards.project.json`, a short root `AGENTS.md`, and the product and domain specifications required by current work.

Follow [Get started](docs/guide/getting-started.md) when creating a consumer repository.

The [template index](templates/consumer/README.md) lists each consumer template and its target path.

## Repository Structure

```text
docs/                    One directory per provision area, plus guides and reference material
schemas/                 JSON contracts for standards and consumer configuration
templates/consumer/      Consumer specification templates
templates/standard/      Standards authoring templates
tools/                   Dependency-free reference validators and fixture suites
standards.manifest.json  Versions, profiles, extensions, and agent load plans
```

## Project

- [Contributing](CONTRIBUTING.md)
- [MIT License](LICENSE)
