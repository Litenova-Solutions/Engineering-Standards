# Deployment and Migrations

This document defines migration safety, environment promotion, feature flags, and deployment rules for production projects.

---

## 1. Production Migration Rule

Production database migrations MUST be reviewed before execution. Do not call `Database.MigrateAsync()` from application startup in production.

Use one of these deployment artifacts:

- Reviewed SQL migration script.
- Idempotent SQL migration script for environments with unknown migration position.
- EF Core migration bundle generated in CI.

Local development may use `dotnet ef database update`.

---

## 2. Expand and Contract

Breaking database changes use expand and contract.

| Phase | Action |
|:---|:---|
| Expand | Add nullable columns, new tables, new indexes, or compatibility views |
| Dual write | Application writes old and new shape |
| Backfill | Background job migrates existing data |
| Read switch | Application reads the new shape |
| Contract | Remove old columns or tables after all deployed versions stop using them |

Destructive migrations are forbidden in the same deployment that first introduces the replacement shape.

```csharp
// GOOD: first migration adds the new nullable column
migrationBuilder.AddColumn<string>(
    name: "DisplayName",
    table: "Users",
    type: "text",
    nullable: true);
```

```csharp
// BAD: drops old column before all deployed versions stop reading it
migrationBuilder.DropColumn(
    name: "Name",
    table: "Users");
```

---

## 3. Migration Checklist

Every migration PR MUST answer:

- Does this migration drop, rename, or make a column non-null?
- Can the old and new application versions run against the schema during deployment?
- Is a backfill needed?
- Is the backfill idempotent and restartable?
- Is the migration safe for large tables?
- Are indexes created without blocking writes when the database supports it?
- Is a rollback or forward-fix plan documented?

---

## 4. Environment Promotion

The deployment order is:

1. Development.
2. Staging.
3. Production.

The same container image and migration artifact that pass staging are promoted to production. Do not rebuild between staging and production.

Required gates before production:

- `dotnet build`.
- `dotnet test`.
- Frontend `pnpm lint`, `pnpm type-check`, and `pnpm build` when a frontend exists.
- Vulnerability scan.
- OpenAPI freshness check when a frontend consumes backend APIs.
- Migration script review.

---

## 5. Feature Flags

Use feature flags for behavior changes that need staged rollout or fast disablement. Do not use feature flags to hide incomplete code forever.

Feature flags MUST have:

- A named owner.
- A removal date or removal condition.
- A default value for every environment.
- Test coverage for both enabled and disabled states when the behavior is risky.

Flags are read in the application or API layer. Domain rules MUST NOT depend on a feature flag service.

---

## 6. Seed Data

Seed data is environment-specific.

| Environment | Allowed Seed Data |
|:---|:---|
| Development | Demo users, fake data, local test fixtures |
| Staging | Minimal operational data and test accounts |
| Production | Reference data only |

Never seed production users, permissions, or secrets from application startup code.

