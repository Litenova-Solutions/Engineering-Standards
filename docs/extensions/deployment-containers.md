# Container Deployment

## Intent

This extension defines image and rollout requirements for hosted environments that deploy immutable images. It supplements baseline release and operations standards.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `deployment-containers` when production or staging deploys the API, Worker, or frontend as a container image.

## Baseline relationship

The extension adds no application package and replaces no baseline rule.

## Agent Summary {#agent-summary}

- Build multi-stage images from pinned bases. (EXT.CONTAINERS.IMAGE.001)
- Run containers as a non-root user. (EXT.CONTAINERS.IMAGE.002)
- Inject environment configuration outside the image. (EXT.CONTAINERS.CONFIG.001)
- Apply reviewed schema changes before traffic. (EXT.CONTAINERS.SCHEMA.001)
- Shift traffic only after readiness. (EXT.CONTAINERS.TRAFFIC.001)
- Retain a tested rollback artifact. (EXT.CONTAINERS.ROLLBACK.001)
- Limit runtime privileges and writable state. (EXT.CONTAINERS.SECURITY.001)
- Record image identity by digest. (EXT.CONTAINERS.METADATA.002)

## Standards

### Build release images in stages (EXT.CONTAINERS.IMAGE.001)

**Requirement:** A release image MUST use multi-stage builds and pinned base-image digests.

**Rationale:** Staged builds isolate build tooling, and pinned digests identify the reviewed base image.

### Run images as non-root (EXT.CONTAINERS.IMAGE.002)

**Requirement:** A release image MUST run its application with a non-root runtime user.

**Rationale:** A non-root process limits the effect of an application compromise.

### Copy only runtime files (EXT.CONTAINERS.IMAGE.003)

**Requirement:** A runtime image MUST contain only files required to run the deployed application.

**Rationale:** A small runtime layer reduces attack surface and image transfer cost.

### Exclude build and secret material (EXT.CONTAINERS.IMAGE.004)

**Requirement:** A runtime image MUST NOT contain source, tests, package caches, credentials, or local configuration.

**Rationale:** Build-only and secret material has no production runtime purpose.

### Supply runtime configuration externally (EXT.CONTAINERS.CONFIG.001)

**Requirement:** A deployment platform MUST supply connection strings, OIDC settings, exporter endpoints, and secrets outside the image.

**Rationale:** Deployment-owned configuration can differ by environment without rebuilding the application image.

### Exclude environment configuration from images (EXT.CONTAINERS.CONFIG.002)

**Requirement:** A release image MUST NOT contain environment-specific configuration.

**Rationale:** An immutable image remains deployable only when environment values stay external.

### Apply schema work before traffic (EXT.CONTAINERS.SCHEMA.001)

**Requirement:** A release job MUST apply reviewed schema changes before traffic shifts to new application replicas.

**Rationale:** One controlled job gives schema changes clear ordering and evidence.

### Keep schema work out of startup (EXT.CONTAINERS.SCHEMA.002)

**Requirement:** An application replica MUST NOT alter the production schema during startup.

**Rationale:** Replica startup can occur concurrently and lacks release-job control.

### Wait for replica readiness (EXT.CONTAINERS.TRAFFIC.001)

**Requirement:** A deployment controller MUST start new replicas and wait for readiness before shifting traffic.

**Rationale:** Readiness proves the new application can receive traffic before it becomes active.

### Test released traffic (EXT.CONTAINERS.TRAFFIC.003)

**Requirement:** A release deployment MUST run its included end-to-end tests after traffic reaches the new version.

**Rationale:** The test verifies the deployed path rather than only an image build.

### Retain rollback material (EXT.CONTAINERS.ROLLBACK.001)

**Requirement:** A release owner MUST retain the previous image digest and an executable rollback command.

**Rationale:** A known digest and command allow a controlled return to the last released artifact.

### Check rollback compatibility (EXT.CONTAINERS.ROLLBACK.002)

**Requirement:** A release owner MUST confirm schema and configuration compatibility with the previous application before deployment.

**Rationale:** Rollback depends on the previous application accepting the current persisted and configured state.

### Limit container privileges (EXT.CONTAINERS.SECURITY.001)

**Requirement:** A deployment MUST use a read-only filesystem when the application permits it and drop unnecessary capabilities.

**Rationale:** Runtime filesystem and capability limits reduce available compromise actions.

### Declare writable paths and limits (EXT.CONTAINERS.SECURITY.002)

**Requirement:** A deployment MUST declare writable paths and apply measured CPU and memory limits.

**Rationale:** Explicit limits protect node capacity and document required mutable storage.

### Run the application as PID 1 (EXT.CONTAINERS.PROCESS.001)

**Requirement:** A container MUST run the application as its entry process.

**Rationale:** The application then receives the deployment platform's termination signals.

### Set sufficient shutdown time (EXT.CONTAINERS.PROCESS.002)

**Requirement:** A deployment MUST set a shutdown grace period longer than measured request or Worker stop time.

**Rationale:** In-flight work needs enough time to finish or record safe interruption.

### Write runtime logs to streams (EXT.CONTAINERS.PROCESS.003)

**Requirement:** A containerized application MUST write logs to standard output or standard error.

**Rationale:** The deployment platform owns log collection for the immutable process.

### Keep mutable data external (EXT.CONTAINERS.PROCESS.004)

**Requirement:** A containerized application MUST keep mutable data outside its container filesystem.

**Rationale:** Recreated replicas cannot rely on local mutable filesystem state.

### Apply OCI release labels (EXT.CONTAINERS.METADATA.001)

**Requirement:** A release image MUST include OCI source, revision, version, and created-time labels.

**Rationale:** Standard labels connect the image to source and release records.

### Record image digests (EXT.CONTAINERS.METADATA.002)

**Requirement:** A release record MUST store the deployed image digest rather than only an image tag.

**Rationale:** A tag can move, while a digest identifies one immutable image.

### Exclude build timestamps from contracts (EXT.CONTAINERS.METADATA.003)

**Requirement:** A generated application contract MUST NOT contain a build timestamp.

**Rationale:** Build timestamps create nondeterministic generated output without application meaning.

### Separate frontend configuration classes (EXT.CONTAINERS.METADATA.004)

**Requirement:** A frontend image build MUST distinguish public build-time configuration from server-only runtime secrets.

**Rationale:** Browser bundles can contain only public values, while server secrets remain private.

### Use protected frontend secret delivery (EXT.CONTAINERS.METADATA.005)

**Requirement:** A frontend image build MUST use secret mounts or runtime injection for secrets.

**Rationale:** Protected delivery keeps secrets outside persistent image history.

### Exclude insecure frontend secret carriers (EXT.CONTAINERS.METADATA.006)

**Requirement:** A frontend image build MUST NOT use `ARG`, copied environment files, or image layers for secrets.

**Rationale:** Build arguments, copied files, and layers can retain a secret in image history.

## Conventions

### Place Dockerfiles beside deployables (EXT.CONTAINERS.CONVENTION.001)

**Default:** Keep one Dockerfile beside each deployable application.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The Dockerfile stays near the project that defines its runtime output.

### Build from the workspace root (EXT.CONTAINERS.CONVENTION.002)

**Default:** Build images from the workspace root when shared project or package files are required.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Root context supplies shared build inputs while the Dockerfile excludes unrelated secrets.

## Dependencies

No application package is required.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.CONTAINERS.IMAGE.001 | static | `ContainersImageTests` asserts dockerfile review shows multi-stage builds and digest-pinned release bases. |
| EXT.CONTAINERS.IMAGE.002 | test | `ContainersImageTests` with its declared non-root runtime user. |
| EXT.CONTAINERS.IMAGE.003 | inspection | Image file listing contains only declared runtime outputs. |
| EXT.CONTAINERS.IMAGE.004 | static | `ContainersImageTests` contain no build-only files, credentials, or local configuration. |
| EXT.CONTAINERS.CONFIG.001 | operation | Deployment configuration supplies declared runtime values outside the image. |
| EXT.CONTAINERS.CONFIG.002 | static | `ContainersConfigTests` contains no environment-specific configuration. |
| EXT.CONTAINERS.SCHEMA.001 | operation | Release record places the reviewed schema job before traffic shift. |
| EXT.CONTAINERS.SCHEMA.002 | test | `ContainersSchemaTests` perform no production schema mutation. |
| EXT.CONTAINERS.TRAFFIC.001 | operation | Deployment event log records readiness before traffic shift. |
| EXT.CONTAINERS.TRAFFIC.003 | test | `ContainersTrafficTests` pass after new-version traffic shift. |
| EXT.CONTAINERS.ROLLBACK.001 | operation | Release record stores the previous digest and tested rollback command. |
| EXT.CONTAINERS.ROLLBACK.002 | test | `ContainersRollbackTests` proves prior application schema and configuration compatibility. |
| EXT.CONTAINERS.SECURITY.001 | static | `ContainersSecurityTests` asserts deployment manifest defines read-only filesystem and capability restrictions. |
| EXT.CONTAINERS.SECURITY.002 | operation | Deployment manifest records writable paths and measured resource limits. |
| EXT.CONTAINERS.PROCESS.001 | test | `ContainersProcessTests` confirms the application receives the container stop signal. |
| EXT.CONTAINERS.PROCESS.002 | test | `ContainersProcessTests` asserts in-flight work stops within the declared grace period. |
| EXT.CONTAINERS.PROCESS.003 | test | `ContainersProcessTests` asserts container logs appear on standard output or standard error. |
| EXT.CONTAINERS.PROCESS.004 | inspection | Runtime design identifies no required mutable container filesystem state. |
| EXT.CONTAINERS.METADATA.001 | static | `ContainersMetadataTests` asserts built image inspection reports the four required OCI labels. |
| EXT.CONTAINERS.METADATA.002 | operation | Release record identifies the deployed artifact by immutable digest. |
| EXT.CONTAINERS.METADATA.003 | static | `ContainersMetadataTests` asserts generated-contract diff contains no build timestamp. |
| EXT.CONTAINERS.METADATA.004 | inspection | Frontend build review separates public configuration from server-only secrets. |
| EXT.CONTAINERS.METADATA.005 | inspection | Frontend build review identifies secret mounts or runtime injection. |
| EXT.CONTAINERS.METADATA.006 | static | Dockerfile scan rejects `ARG`, copied environment files, and secret-bearing layers. |
| EXT.CONTAINERS.CONVENTION.001 | inspection | Each deployable has a colocated Dockerfile or a recorded local replacement. |
| EXT.CONTAINERS.CONVENTION.002 | test | `ContainersTests` asserts image builds access declared shared inputs from repository-root context. |
