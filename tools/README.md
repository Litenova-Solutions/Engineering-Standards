# Standards Tools

Reference tooling for consumers of the Agentic Engineering System. These are reference implementations. A consumer may extend or replace them, but the checks match the Verification lists in the foundation standards.

## validate-consumer.mjs

A dependency-free Node validator for a consumer repository. It validates every structured Specification Metadata block against the kind-discriminated schema and runs the cross-file checks that JSON Schema cannot prove.

```bash
# from the consumer repository root (must contain standards.project.json)
node standards/tools/validate-consumer.mjs

# or point at another consumer root
node standards/tools/validate-consumer.mjs /path/to/consumer
```

Checks performed:

- Metadata block parses, has the required fields for its `kind`, and carries no unknown field.
- `id`, `specStatus`, `implementationStatus`, `operationType`, `releaseRole`, `risks`, and identifier arrays match the schema patterns and enums.
- Exactly one `product` specification and exactly one `primary` release flow exist.
- Every end-to-end flow `useCases` entry resolves to a module use-case file.
- Every workflow `participatingModules` and domain-policy `appliesToModules` entry resolves to a module directory.
- Each use-case `id` matches its file path under `modules/{module}/{use-case}.md`.
- Acceptance `AC-*` and end-to-end `E2E-*` definitions are unique.
- Local `applicableExtensions` are selected in `standards.project.json`, are not project-scoped, and are allowed for the specification kind (when the standards manifest is reachable).
- Relative Markdown links resolve.

Exit code is `0` on pass and non-zero on failure. It does not run backend, frontend, or extension verification; those remain in the release gates.
