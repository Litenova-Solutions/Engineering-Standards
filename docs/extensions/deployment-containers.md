# Container Deployment

## Intent

This extension defines container image and rollout requirements for hosted environments that deploy immutable images. It supplements the baseline release and operations standards.

## Activation

Enable `deployment-containers` when any production or staging environment deploys the API, Worker, or frontend as a container image.

The extension adds no application package and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Build multi-stage images with pinned release bases and a non-root runtime user.
- Copy only required runtime output.
- Inject environment configuration and secrets at runtime.
- Run schema work before traffic shifts.
- Gate traffic on readiness and run the primary smoke test.
- Retain the previous image and an executable rollback command.

## Standards

### Build immutable non-root images (EXT.CONTAINERS.IMAGE.001)

Use multi-stage builds, pinned base image digests for release, a non-root runtime user, and only required runtime files. Do not include source, tests, package caches, credentials, or local configuration in runtime layers.

### Inject runtime configuration (EXT.CONTAINERS.CONFIG.001)

Supply connection strings, OIDC settings, exporter endpoints, and secrets through the deployment platform. Keep environment-specific configuration outside the image.

### Run schema work as a release job (EXT.CONTAINERS.SCHEMA.001)

Apply reviewed schema changes from one release job before shifting traffic. Application replicas do not alter the production schema during startup.

### Gate traffic on readiness (EXT.CONTAINERS.TRAFFIC.001)

Start new replicas, wait for readiness, then shift traffic. Run the primary-journey smoke test after traffic reaches the new version.

### Retain the previous artifact (EXT.CONTAINERS.ROLLBACK.001)

Keep the previous image digest and an executable rollback command. Confirm schema and configuration remain compatible with the previous application before deployment.

### Bound container privileges (EXT.CONTAINERS.SECURITY.001)

Use a read-only filesystem where the application permits it, drop unnecessary capabilities, declare writable paths, and apply CPU and memory limits based on measurement.

## Conventions

Keep one Dockerfile beside each deployable application. Build from the repository root so shared project and package files are available without copying unrelated secrets.

## Dependencies

No application package is required.

## Verification

- Inspect image history and contents for secrets and build-only files.
- Run the image as the declared non-root user.
- Test liveness, readiness, shutdown, schema job, smoke test, and rollback.
- Scan the image and review base digest updates.
