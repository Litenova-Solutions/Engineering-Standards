# Runbooks Index

Load these during incidents. Do not load for routine feature development.

| Runbook | When to use | Priority |
|:---|:---|:---|
| [deploy-release.md](deploy-release.md) | Promote a vetted image to production | P1 |
| [rollback-release.md](rollback-release.md) | Production deployment failure | P0 |
| [run-database-migration.md](run-database-migration.md) | Apply or review EF migrations in staging/production | P1 |
| [restore-database-backup.md](restore-database-backup.md) | Migration failure or data corruption | P0 |
| [recover-outbox-message.md](recover-outbox-message.md) | Outbox message dead-lettered | P1 |
| [handle-leaked-secret.md](handle-leaked-secret.md) | Secret committed or exposed | P0 |
| [rotate-jwt-secret.md](rotate-jwt-secret.md) | Planned or emergency JWT secret rotation | P1 |
| [investigate-5xx-spike.md](investigate-5xx-spike.md) | Elevated 5xx rate | P1 |
| [investigate-slow-query.md](investigate-slow-query.md) | Database latency spike | P2 |
| [handle-tanstack-or-npm-compromise.md](handle-tanstack-or-npm-compromise.md) | Supply-chain incident affecting npm packages | P0 |

All runbooks assume monorepo layout with `apps/api/` and optional `apps/web/`.
