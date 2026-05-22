# Infrastructure as Code

Cloud and platform resources for projects following these standards MUST be defined as code in the project repository or a dedicated infrastructure repository linked by ADR.

---

## 1. Tooling

| Tool | When to use |
|:---|:---|
| Terraform | Default for multi-cloud or AWS/Azure/GCP resources |
| Bicep | Azure-only teams with ARM-first operations |
| Pulumi | When the team already standardizes on Pulumi and has an ADR |

Pick one primary IaC tool per project. MUST NOT mix Terraform and Bicep for the same environment without an ADR.

---

## 2. Required Practices

- MUST store state remotely with locking (Terraform S3+DynamoDB, Azure Storage, Terraform Cloud, etc.).
- MUST use separate state per environment (`dev`, `staging`, `production`).
- MUST tag all resources with `project`, `environment`, and `owner`.
- MUST NOT commit secrets; use vault, Key Vault, Secrets Manager, or CI OIDC.
- MUST review `terraform plan` (or equivalent) in CI before apply to production.

---

## 3. Environment Parity

Staging MUST mirror production topology at smaller scale (same services, fewer replicas). Development MAY use reduced services but MUST use the same IaC modules with different variable files.

---

## 4. Database and Migrations

- IaC provisions PostgreSQL instances, networking, and backups.
- Schema changes follow `docs/conventions/backend/13-deployment-and-migrations.md`; MUST NOT run `Database.MigrateAsync()` on app startup in production.

---

## 5. CI Integration

Infrastructure PRs MUST run:

```bash
terraform fmt -check
terraform validate
terraform plan -out=plan.tfplan
```

Project repositories MAY add policy-as-code (OPA, Checkov, tfsec) in CI. Failures block merge.
