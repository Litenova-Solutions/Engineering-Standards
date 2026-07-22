<p align="center">
  <img src="assets/agentic-engineering-system-icon.svg" alt="Agentic Engineering System" width="88" height="88">
</p>

<h1 align="center">Agentic Engineering System</h1>

<p align="center">
  <a href="https://www.litenova.solutions/Standards"><img src="https://img.shields.io/badge/docs-online-f8c258?labelColor=3e3643" alt="Documentation"></a>
  <a href="https://github.com/Litenova-Solutions/Engineering-Standards/releases/latest"><img src="https://img.shields.io/github/v/release/Litenova-Solutions/Engineering-Standards?label=version&color=3e3643" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Litenova-Solutions/Engineering-Standards" alt="MIT license"></a>
</p>

The Agentic Engineering System is the open-source set of standards Litenova Solutions
uses to develop software with human contributors and AI agents. It defines product and
domain specifications, architecture boundaries, implementation conventions, verification,
operations, and release evidence as one connected system.

Version 1 targets one bounded-context business application built with ASP.NET Core,
PostgreSQL, Marten, and optional Next.js frontends.

## What It Defines

- Specification-Driven Delivery for turning approved intent into verified software.
- Agent-Driven Engineering with explicit human decision authority and bounded agent work.
- Domain, Application, Infrastructure, and WebApi boundaries organized by module and use case.
- Required testing, security, operating, documentation, and release evidence.
- Conditional extensions for concerns such as durable delivery, EF Core, caching, and localization.

The baseline profile applies first. An extension may replace only the rule IDs it names.
A consumer override must name the affected rule and link to a project decision.

## Documentation

- [Hosted documentation](https://www.litenova.solutions/Standards)
- [Repository documentation index](docs/README.md)
- [Agentic Engineering System](docs/foundations/engineering-system.md)
- [V1 release scope](docs/guides/v1-release-scope.md)
- [Adoption guide](docs/guides/adopt-v1.md)
- [V1.5 upgrade guide](docs/guides/upgrade-v1.5.md)

## Use the Standards

Pin a published release as a repository submodule:

```bash
git submodule add https://github.com/Litenova-Solutions/Engineering-Standards.git standards
git -C standards checkout --detach <approved-tag-or-commit>
```

Add `standards.project.json`, a short root `AGENTS.md`, and the product and domain
specifications required by the current work. The [template index](templates/docs/README.md)
lists each starting point and its target path.

## Repository Structure

```text
docs/               Authored standards, extensions, guides, and reference material
schemas/            JSON contracts for standards and consumer configuration
templates/docs/     Consumer specification templates
standards.manifest.json  Version pins, profiles, extensions, and agent load plans
```

## Project

- [Contributing](CONTRIBUTING.md)
- [Roadmap](ROADMAP.md)
- [MIT License](LICENSE)
