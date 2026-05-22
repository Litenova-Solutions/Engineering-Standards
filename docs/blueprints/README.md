# Blueprints Index

Full-file reference implementations. Agents MUST copy from blueprints instead of assembling partial examples from convention files.

## Backend

| Blueprint | File |
|:---|:---|
| Program.cs (composition root) | [backend/program-cs.md](backend/program-cs.md) |
| AppHost | [backend/apphost.md](backend/apphost.md) |
| Worker Program.cs | [backend/worker-program-cs.md](backend/worker-program-cs.md) |
| Infrastructure DI | [backend/infrastructure-service-registration.md](backend/infrastructure-service-registration.md) |
| EndpointExtensions | [backend/endpoint-extensions.md](backend/endpoint-extensions.md) |
| Write endpoint | [backend/write-endpoint.md](backend/write-endpoint.md) |
| Outbox | [backend/outbox.md](backend/outbox.md) |
| Idempotency | [backend/idempotency.md](backend/idempotency.md) |
| Architecture tests | [backend/architecture-tests.md](backend/architecture-tests.md) |
| Integration test factory | [backend/integration-test-factory.md](backend/integration-test-factory.md) |

## Frontend

| Blueprint | File |
|:---|:---|
| Domain use case module | [frontend/domain-use-case.md](frontend/domain-use-case.md) |
| Server Action | [frontend/server-action.md](frontend/server-action.md) |
| lib/env.ts | [frontend/lib-env.md](frontend/lib-env.md) |
| lib/api/client.ts | [frontend/lib-api-client.md](frontend/lib-api-client.md) |
| Auth.js auth.ts | [frontend/auth-ts.md](frontend/auth-ts.md) |
| next.config.ts | [frontend/next-config.md](frontend/next-config.md) |
| proxy.ts (auth + CSP) | [frontend/proxy-ts.md](frontend/proxy-ts.md) |
| CSP headers (nonce) | [frontend/csp-headers.md](frontend/csp-headers.md) |

## Templates (copy to consumer repos)

See `docs/templates/` for CI workflow, Dockerfiles, `global.json`, domain doc templates, and infra.
