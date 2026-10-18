# Container Deployment

## Intent

This extension defines image and rollout requirements for hosted environments that deploy immutable images. It supplements baseline release and operations standards.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `containers` when production or staging deploys the API, Worker, or frontend as a container image.

## Replaces

This extension replaces no baseline provision. Its schema, rollback and secret rules cite the baseline rules that own those obligations.

## Switches on

This extension switches on `limit` and `runbook`. `standards/rule/ext-containers.declare-writable-paths-and-limits` records resource bounds as Limit records, and `standards/rule/ext-containers.retain-rollback-material` records the rollback procedure as a Runbook record.

## Agent Summary {#agent-summary}

- Build multi-stage images from pinned bases. (standards/rule/ext-containers.build-release-images-in-stages)
- Run containers as a non-root user. (standards/rule/ext-containers.run-images-as-non-root)
- Inject environment configuration outside the image. (standards/rule/ext-containers.supply-runtime-configuration-externally)
- Apply reviewed schema changes before traffic. (standards/rule/ext-containers.apply-schema-work-before-traffic)
- Shift traffic only after readiness. (standards/rule/ext-containers.wait-for-replica-readiness)
- Retain a tested rollback artifact. (standards/rule/ext-containers.retain-rollback-material)
- Limit runtime privileges and writable state. (standards/rule/ext-containers.limit-container-privileges)
- Record image identity by digest. (standards/rule/ext-containers.record-image-digests)

## Standards

### Build release images in stages (standards/rule/ext-containers.build-release-images-in-stages)

**Requirement:** A release image MUST use multi-stage builds and pinned base-image digests.

**Rationale:** Staged builds isolate build tooling, and pinned digests identify the reviewed base image.

### Run images as non-root (standards/rule/ext-containers.run-images-as-non-root)

**Requirement:** A release image MUST run its application with a non-root runtime user.

**Rationale:** A non-root process limits the effect of an application compromise.

### Copy only runtime files (standards/rule/ext-containers.copy-only-runtime-files)

**Requirement:** A runtime image MUST contain only files required to run the deployed application.

**Rationale:** A small runtime layer reduces attack surface and image transfer cost.

### Exclude build material from runtime images (standards/rule/ext-containers.exclude-build-material-from-runtime-images)

**Requirement:** A runtime image MUST NOT contain source, tests, package caches, or local configuration.

**Rationale:** Build-only material has no production runtime purpose. Secrets stay out under `standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data`.

### Supply runtime configuration externally (standards/rule/ext-containers.supply-runtime-configuration-externally)

**Requirement:** A deployment platform MUST supply connection strings, OIDC settings, exporter endpoints, and secrets outside the image.

**Rationale:** Deployment-owned configuration can differ by environment without rebuilding the application image.

### Exclude environment configuration from images (standards/rule/ext-containers.exclude-environment-configuration-from-images)

**Requirement:** A release image MUST NOT contain environment-specific configuration.

**Rationale:** An immutable image remains deployable only when environment values stay external.

### Apply schema work before traffic (standards/rule/ext-containers.apply-schema-work-before-traffic)

**Requirement:** A release job MUST apply reviewed schema changes before traffic shifts to new application replicas, under `standards/rule/backend-persistence.control-production-schema-changes`.

**Rationale:** The release job is the container platform's form of the reviewed step the baseline rule requires.

### Keep schema work out of startup (standards/rule/ext-containers.keep-schema-work-out-of-startup)

**Requirement:** An application replica MUST NOT alter the production schema during startup, under `standards/rule/backend-persistence.control-production-schema-changes`.

**Rationale:** Replica startup can occur concurrently and lacks release-job control.

### Wait for replica readiness (standards/rule/ext-containers.wait-for-replica-readiness)

**Requirement:** A deployment controller MUST start new replicas and wait for readiness before shifting traffic.

**Rationale:** Readiness proves the new application can receive traffic before it becomes active.

### Test released traffic (standards/rule/ext-containers.test-released-traffic)

**Requirement:** A release deployment MUST run the release's recorded end-to-end suite after traffic reaches the new version.

**Rationale:** The test verifies the deployed path rather than only an image build. The release record names the suite.

### Retain rollback material (standards/rule/ext-containers.retain-rollback-material)

**Requirement:** A release owner MUST record the rollback procedure as a Runbook record identifying the previous image digest, under `standards/rule/quality-operations.keep-rollback-executable`.

**Rationale:** The digest identifies one immutable image, and the Runbook carries the tested command.

### Limit container privileges (standards/rule/ext-containers.limit-container-privileges)

**Requirement:** A deployment MUST use a read-only filesystem when the application permits it and drop unnecessary capabilities.

**Rationale:** Runtime filesystem and capability limits reduce available compromise actions.

### Declare writable paths and limits (standards/rule/ext-containers.declare-writable-paths-and-limits)

**Requirement:** A deployment MUST declare writable paths and record CPU and memory bounds as Limit records.

**Rationale:** Explicit limits protect node capacity and document required mutable storage.

### Run the application as PID 1 (standards/rule/ext-containers.run-the-application-as-pid-1)

**Requirement:** A container MUST run the application as its entry process.

**Rationale:** The application then receives the deployment platform's termination signals.

### Set sufficient shutdown time (standards/rule/ext-containers.set-sufficient-shutdown-time)

**Requirement:** A deployment MUST set a shutdown grace period longer than measured request or Worker stop time.

**Rationale:** In-flight work needs enough time to finish or record safe interruption.

### Write runtime logs to streams (standards/rule/ext-containers.write-runtime-logs-to-streams)

**Requirement:** A containerized application MUST write logs to standard output or standard error.

**Rationale:** The deployment platform owns log collection for the immutable process.

### Keep mutable data external (standards/rule/ext-containers.keep-mutable-data-external)

**Requirement:** A containerized application MUST keep mutable data outside its container filesystem.

**Rationale:** Recreated replicas cannot rely on local mutable filesystem state.

### Apply OCI release labels (standards/rule/ext-containers.apply-oci-release-labels)

**Requirement:** A release image MUST include OCI source, revision, version, and created-time labels.

**Rationale:** Standard labels connect the image to source and release records.

### Record image digests (standards/rule/ext-containers.record-image-digests)

**Requirement:** A release record MUST store the deployed image digest rather than only an image tag.

**Rationale:** A tag can move, while a digest identifies one immutable image.

### Exclude build timestamps from contracts (standards/rule/ext-containers.exclude-build-timestamps-from-contracts)

**Requirement:** A published OpenAPI document or generated client MUST NOT contain a build timestamp.

**Rationale:** Build timestamps create nondeterministic generated output without application meaning. A generated-at field and a build-time comment are both build timestamps.

### Separate frontend configuration classes (standards/rule/ext-containers.separate-frontend-configuration-classes)

**Requirement:** A frontend image build MUST distinguish public build-time configuration from server-only runtime secrets.

**Rationale:** Browser bundles can contain only public values, while server secrets remain private.

### Use protected frontend secret delivery (standards/rule/ext-containers.use-protected-frontend-secret-delivery)

**Requirement:** A frontend image build MUST use secret mounts or runtime injection for secrets.

**Rationale:** Protected delivery keeps secrets outside persistent image history.

### Exclude insecure frontend secret carriers (standards/rule/ext-containers.exclude-insecure-frontend-secret-carriers)

**Requirement:** A frontend image build MUST NOT use `ARG`, copied environment files, or image layers for secrets.

**Rationale:** Build arguments, copied files, and layers can retain a secret in image history. Secrets stay out of layers under `standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data`.

## Conventions

### Place Dockerfiles beside deployables (standards/rule/ext-containers.place-dockerfiles-beside-deployables)

**Default:** Keep one Dockerfile beside each deployable application.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** The Dockerfile stays near the project that defines its runtime output.

### Build from the workspace root (standards/rule/ext-containers.build-from-the-workspace-root)

**Default:** Build images from the workspace root when shared project or package files are required.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** Root context supplies shared build inputs while the Dockerfile excludes unrelated secrets.

## Dependencies

No application package is required.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/ext-containers.build-release-images-in-stages | checkable | `ContainersImageTests` assert multi-stage builds and digest-pinned release bases. |
| standards/rule/ext-containers.run-images-as-non-root | checkable | `ContainersImageTests` assert the declared non-root runtime user. |
| standards/rule/ext-containers.copy-only-runtime-files | checkable | `ContainersImageTests` match the image file listing against the declared runtime manifest. |
| standards/rule/ext-containers.exclude-build-material-from-runtime-images | checkable | `ContainersImageTests` find no build-only files or local configuration in runtime images. |
| standards/rule/ext-containers.supply-runtime-configuration-externally | checkable | `ContainersConfigTests` match deployment manifests against runtime values declared outside the image. |
| standards/rule/ext-containers.exclude-environment-configuration-from-images | checkable | `ContainersConfigTests` find no environment-specific configuration in release images. |
| standards/rule/ext-containers.apply-schema-work-before-traffic | checkable | `ContainersSchemaTests` place the reviewed schema job before the traffic shift. |
| standards/rule/ext-containers.keep-schema-work-out-of-startup | checkable | `ContainersSchemaTests` observe no production schema mutation from replica startup. |
| standards/rule/ext-containers.wait-for-replica-readiness | checkable | `ContainersTrafficTests` assert new replicas reach readiness before traffic shifts. |
| standards/rule/ext-containers.test-released-traffic | checkable | `ContainersTrafficTests` pass after new-version traffic shift. |
| standards/rule/ext-containers.retain-rollback-material | checkable | `ContainersRollbackTests` resolve the Runbook record and its previous image digest. |
| standards/rule/ext-containers.limit-container-privileges | checkable | `ContainersSecurityTests` assert read-only filesystem and dropped capabilities in the deployment manifest. |
| standards/rule/ext-containers.declare-writable-paths-and-limits | checkable | `ContainersSecurityTests` match the manifest against declared writable paths and Limit records. |
| standards/rule/ext-containers.run-the-application-as-pid-1 | checkable | `ContainersProcessTests` confirm the application receives the container stop signal. |
| standards/rule/ext-containers.set-sufficient-shutdown-time | checkable | `ContainersProcessTests` assert in-flight work stops within the declared grace period. |
| standards/rule/ext-containers.write-runtime-logs-to-streams | checkable | `ContainersProcessTests` assert container logs appear on standard output or standard error. |
| standards/rule/ext-containers.keep-mutable-data-external | guidance | Does the design keep every piece of mutable data outside the container filesystem? |
| standards/rule/ext-containers.apply-oci-release-labels | checkable | `ContainersMetadataTests` assert the four required OCI labels on built images. |
| standards/rule/ext-containers.record-image-digests | checkable | `ContainersMetadataTests` identify the deployed artifact by immutable digest in the release record. |
| standards/rule/ext-containers.exclude-build-timestamps-from-contracts | checkable | `ContainersMetadataTests` assert the generated-contract diff contains no build timestamp. |
| standards/rule/ext-containers.separate-frontend-configuration-classes | guidance | Does the frontend build keep public configuration apart from server-only secrets? |
| standards/rule/ext-containers.use-protected-frontend-secret-delivery | guidance | Does the frontend build deliver every secret through mounts or runtime injection? |
| standards/rule/ext-containers.exclude-insecure-frontend-secret-carriers | checkable | `ContainersConfigTests` reject `ARG`, copied environment files and secret-bearing layers. |
| standards/rule/ext-containers.place-dockerfiles-beside-deployables | checkable | `ContainersTests` assert a colocated Dockerfile per deployable or a recorded Exception. |
| standards/rule/ext-containers.build-from-the-workspace-root | checkable | `ContainersTests` assert image builds access declared shared inputs from repository-root context. |
