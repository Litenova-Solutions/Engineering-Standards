# Infrastructure as Code

Production deployments for projects following these standards target **self-managed VPS hosting** (Hetzner, OVH, or equivalent). Application topology is defined as Docker Compose files in the project repository.

---

## 1. Target Topology

| Component | Runtime |
|:---|:---|
| PostgreSQL | Docker container on the VPS, or a managed database from the same provider |
| API (`WebApi`) | Docker container |
| Worker | Docker container (separate image from API) |
| Frontend (`web`) | Docker container (Next.js standalone) |
| TLS / reverse proxy | Caddy container (default) or nginx |

Local development uses .NET Aspire (`docs/conventions/backend/13-deployment-and-migrations.md`). Production uses Compose on one or more VPS instances.

---

## 2. Required Artifacts

Copy templates from `docs/templates/infra/` into the project repository:

| Template | Destination |
|:---|:---|
| `docker-compose.prod.yml` | `infra/docker-compose.prod.yml` |
| `Caddyfile` | `infra/Caddyfile` |

Add a `.env.example` (committed) listing required variable names without values. The real `.env` lives on the server only and MUST NOT be committed.

---

## 3. Server Provisioning

Provision VPS instances manually or with optional Terraform/Ansible. Pick one approach per project and document it in a project ADR.

| Approach | When to use |
|:---|:---|
| Manual setup | Single VPS, small team, fastest path |
| Terraform (`hcloud`, `ovh`) | Reproducible server creation, firewall rules, volumes |
| Ansible | Configuration after the OS is installed (Docker, users, firewall) |

Minimum server hardening:

- SSH key authentication only; disable password login.
- Firewall: allow 22 (from admin IPs), 80, 443 only.
- Unattended security updates enabled.
- Non-root deploy user in the `docker` group.

---

## 4. Secrets and Configuration

- Secrets (database password, JWT secret, registry tokens) live in the server `.env` file or in GitHub Actions secrets for CI deploy.
- MUST NOT commit secrets to the repository.
- CI injects image digests at deploy time (`API_IMAGE`, `WORKER_IMAGE`, `WEB_IMAGE`).
- See `docs/conventions/shared/security.md` for the full secrets baseline.

---

## 5. Deployment Flow

1. CI builds, tests, and pushes versioned images to a container registry (GHCR is the default).
2. Staging VPS runs the same Compose file with staging variables.
3. After smoke tests pass, production deploy pulls the **same image digests** and runs `docker compose up -d`.
4. Migrations run as a separate step before the new containers start (`docs/runbooks/deploy-release.md`).

Deploy over SSH example:

```bash
ssh deploy@your-vps "cd /opt/your-app && docker compose -f infra/docker-compose.prod.yml pull && docker compose -f infra/docker-compose.prod.yml up -d"
```

Image digests MUST NOT change between staging and production promotion.

---

## 6. Backups

- Schedule `pg_dump` from the VPS (cron) or use the provider's volume snapshots.
- Store backups off-server (second VPS, Hetzner Storage Box, or another provider's object storage).
- Test restore quarterly (`docs/runbooks/restore-database-backup.md`).

---

## 7. Scaling Beyond a Single VPS

When one VPS is insufficient:

- Split PostgreSQL onto a dedicated VPS or use the provider's managed PostgreSQL.
- Run API and Worker on separate VPS instances; point all at the same database.
- Add a load balancer only when horizontal API scaling is required; document the change in a project ADR.

Do not introduce Kubernetes or a cloud PaaS without a project ADR that justifies the operational cost.

---

## 8. Database and Migrations

- Compose provisions the PostgreSQL container and persistent volume.
- Schema changes follow `docs/conventions/backend/13-deployment-and-migrations.md`.
- MUST NOT run `Database.MigrateAsync()` on app startup in production.

---

## 9. CI Integration

Infrastructure PRs that change Compose or proxy config MUST:

- Validate Compose syntax (`docker compose config`).
- Run in CI on every PR that touches `infra/`.

Optional: Terraform fmt/validate when Terraform is used for server provisioning.
