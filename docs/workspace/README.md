# Overview

## Intent

The Workspace pages state the shape every repository built with LiteSpec shares: the canonical monorepo tree, the names that expose architectural role, the packages each layer, from Domain to the API host, may take, and where each configuration value lives. Every project applies them, whatever its size, shape, or technology stacks.

## How the pages fit together

[Workspace Structure](structure.md) states the tree, and the other three pages state what lives where inside it: [Naming and Code Style](naming.md) fixes names and suffixes, [Dependencies](dependencies.md) fixes which layer may take which package, and [Configuration](config.md) fixes where each value lives and who owns it. The .NET stack refines these pages for its own projects and packages; its [stack page](../backend/dotnet/stack.md) is the entry point.

## Pages

- [Workspace Structure](structure.md): the canonical monorepo tree for applications, packages, docs, and tests.
- [Naming and Code Style](naming.md): names, suffixes, and file conventions that expose intent and role.
- [Dependencies](dependencies.md): layer dependencies, package ownership, and approval of new packages.
- [Configuration](config.md): version pins, compiler rules, environment access, and secret handling.
