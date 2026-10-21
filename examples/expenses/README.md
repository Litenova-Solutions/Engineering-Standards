# Expenses

Expenses is the LiteSpec example consumer: a small, realistic SaaS product the docs show as a real, checked project.

Employees submit work expenses with receipts. Managers approve or reject them, and finance reimburses the approved ones.

## Layout

Records live under `docs/`, following the homes the model page names: product records under `docs/product/`, domain records under `docs/domain/`, research under `docs/research/`, operations under `docs/operations/` and `docs/runbooks/`, gaps under `docs/known-gaps/`, and the vocabulary in `docs/language.json`. Code lives under `apps/`: the .NET backend sample under `apps/api/`, the Svelte frontend under `apps/web/`, and the generated API client under `packages/api/`.

The code shows the shape the stack pages require: sealed state records, one `DomainException` subclass per refusal, internal sealed handlers, `Async` method names, and acceptance scenarios carrying `proves` tags. It is not a compiled solution: it holds no project or solution files, and its samples exist to give the model builder its anchors.

## Checks

Check the example with:

```bash
litespec model check --root examples/expenses
```

The check reports no open finding and one known gap: `export-expenses` has no handler yet, covered by `known-gap/export-expenses-unimplemented`.
