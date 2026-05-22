# Container and Runtime Images

Production services that follow these standards MUST ship as OCI images built from reproducible Dockerfiles in the repository.

---

## 1. Dockerfile Rules

- MUST use multi-stage builds: `build` stage compiles; `runtime` stage runs only the published artifact.
- MUST pin base image digests or minor tags (for example `mcr.microsoft.com/dotnet/aspnet:10.0`, not `latest`).
- MUST run the application process as a non-root user in the runtime stage.
- MUST expose only required ports (typically 8080 for ASP.NET Core, 3000 for Next.js standalone).
- MUST NOT bake secrets, connection strings, or API keys into image layers.

```dockerfile
# GOOD: non-root runtime user
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
USER $APP_UID
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyProject.WebApi.dll"]
```

```dockerfile
# BAD: secrets in build args copied into layers
ARG DATABASE_PASSWORD
ENV ConnectionStrings__Default=$DATABASE_PASSWORD
```

---

## 2. Health Checks

- WebApi containers MUST implement `/health` (or project-configured path) for orchestrator probes.
- Worker containers MUST expose a health endpoint or process heartbeat documented in the project ADR.

---

## 3. Promotion

The same image digest that passes staging MUST be promoted to production. Do not rebuild between staging and production. See `docs/conventions/backend/13-deployment-and-migrations.md`.

---

## 4. Next.js Frontend Images

- MUST use `output: "standalone"` in `next.config` when deploying as a container.
- MUST run `pnpm build` in CI before `docker build`; Turborepo cache is optional.
