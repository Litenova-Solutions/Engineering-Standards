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

## 2. Complete Backend Dockerfile

Prefer the copy-paste template at `docs/templates/Dockerfile.api` over inlining this block.

```dockerfile
# ---- build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first for layer caching
COPY ["apps/api/src/{ProjectName}.WebApi/{ProjectName}.WebApi.csproj", "apps/api/src/{ProjectName}.WebApi/"]
COPY ["apps/api/src/{ProjectName}.Infrastructure/{ProjectName}.Infrastructure.csproj", "apps/api/src/{ProjectName}.Infrastructure/"]
# ... copy all .csproj files before copying source ...
COPY ["apps/api/Directory.Build.props", "apps/api/"]
COPY ["apps/api/Directory.Packages.props", "apps/api/"]
COPY ["apps/api/{ProjectName}.slnx", "apps/api/"]
WORKDIR /src/apps/api
RUN dotnet restore "{ProjectName}.slnx"

WORKDIR /src
COPY . .
WORKDIR /src/apps/api
RUN dotnet publish "src/{ProjectName}.WebApi/{ProjectName}.WebApi.csproj" \
    --configuration Release \
    --no-restore \
    --output /app/publish

# ---- runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Set non-root user (APP_UID is defined in the base image as 1654)
USER $APP_UID

COPY --from=build /app/publish .

# Expose port 8080 (ASP.NET Core default non-root port)
EXPOSE 8080

# Health check for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "{ProjectName}.WebApi.dll"]
```

---

## 3. Complete Frontend Dockerfile

```dockerfile
# ---- deps stage ----
FROM node:22-alpine AS deps
WORKDIR /repo

# Install pnpm
RUN corepack enable pnpm

# Copy lockfile and workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/api-types/package.json ./packages/api-types/
COPY packages/api-client/package.json ./packages/api-client/

# Install dependencies using lockfile (no mutation)
RUN pnpm install --frozen-lockfile

# ---- build stage ----
FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable pnpm

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Build-time env vars for NEXT_PUBLIC_ variables only.
# Server-side variables are injected at runtime.
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN pnpm --filter @myproject/web build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
```

The frontend Dockerfile requires `output: "standalone"` in `next.config.ts`:

```typescript
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
}
```

---

## 4. `.dockerignore`

```
**/.git
**/.gitignore
**/node_modules
**/.next
**/dist
**/bin
**/obj
**/.vs
**/.vscode
**/TestResults
**/coverage
**/*.user
**/*.suo
```

Place `.dockerignore` at the repository root. Docker build context is the repository root for both Dockerfiles.

---

## 5. Health Checks

- WebApi containers MUST implement `/health` (or project-configured path) for orchestrator probes.
- Worker containers MUST expose a health endpoint or process heartbeat documented in the project ADR.
- Both images include a `HEALTHCHECK` instruction so container orchestrators can determine readiness without an external probe configuration.

---

## 6. Image Labels

Add standard OCI labels to every runtime image:

```dockerfile
LABEL org.opencontainers.image.title="{ProjectName}"
LABEL org.opencontainers.image.source="https://github.com/your-org/{ProjectName}"
LABEL org.opencontainers.image.revision="${GIT_SHA}"
LABEL org.opencontainers.image.created="${BUILD_TIMESTAMP}"
```

Pass `GIT_SHA` and `BUILD_TIMESTAMP` as build args from the CI pipeline.

---

## 7. Promotion

The same image digest that passes staging MUST be promoted to production. Do not rebuild between staging and production. See `docs/conventions/backend/13-deployment-and-migrations.md`.

---

## 8. Runtime Environment Variables

Runtime variables are injected by the container orchestrator (Kubernetes, ECS, Azure Container Apps). They are never in the image. Use the `__` separator for nested ASP.NET Core sections:

```bash
ConnectionStrings__Database=Host=...;Database=...
JwtSettings__Secret=...
JwtSettings__Issuer=https://yourdomain.com
```

For Next.js, server-side variables are injected at runtime (standalone mode). `NEXT_PUBLIC_*` variables are baked in at build time.

---

## 9. No Secrets in Build Args

Build args appear in the image manifest and in `docker history`. MUST NOT pass secrets, connection strings, or API keys as build args.

```dockerfile
# BAD: secret in build arg
ARG DATABASE_PASSWORD
ENV ConnectionStrings__Database=Host=db;Password=${DATABASE_PASSWORD}

# GOOD: empty in image, injected at runtime by orchestrator
ENV ConnectionStrings__Database=""
```
