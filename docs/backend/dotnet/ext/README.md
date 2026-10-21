# Overview

## Intent

The pages in this folder state the extensions only a .NET backend offers: executable acceptance scenarios and Entity Framework Core persistence for selected aggregates (business records that change in one step). An extension is an optional addition that stays inactive until one use case, journey, or module meets the criterion its page states, and the project records each selection with its criterion and review date. A use case is one command or query, a journey is the steps to one goal, and a module is one business area. Authors turn to these pages when shared examples need business-language review or when aggregates need relational storage that the Marten document-storage baseline cannot satisfy.

## How the pages fit together

The shared [Extensions overview](../../../ext/README.md) catalog holds the extensions any stack can select; the two pages below live beside the .NET stack because they bind to its runners, packages, and providers. Each states its activation criterion, the baseline provisions it replaces, and the records it switches on. The BDD page replaces nothing and switches on Case records; the EF Core page replaces the baseline provisions its page names for the aggregates it owns, and only after a decision records the scope.

## .NET stack extensions

- [Executable BDD Acceptance Tests](bdd.md): Gherkin features or LightBDD classes for critical examples that need business-language review.
- [EF Core Persistence](efcore.md): the Entity Framework Core read, query, mapping, migration, and commit rules for selected aggregates.
