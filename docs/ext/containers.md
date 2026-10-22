# Container Deployment

## Intent

Container deployment ships the API, Worker, and frontends as immutable images that carry their own runtime, instead of as processes on a server. This page states what those images hold, how releases roll out and roll back, and which runtime limits each deployment declares. A team whose staging or production ships images applies it, so each release deploys the same bytes it tested.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `containers` when production or staging deploys the API, the Worker, or a frontend as a container image.

## Baseline relationship

This extension replaces no baseline provision. Its schema, rollback, and secret rules cite the baseline provisions that own those obligations instead of restating them.

This extension switches on `limit` and `runbook`: resource bounds are Limit records under `litespec/ext/containers#declare-writable-paths-and-limits`, and the rollback procedure is a Runbook record under `litespec/ext/containers#retain-rollback-material`.

## Standards

### Build release images in stages

**Statement:** A release image MUST use multi-stage builds and pinned base-image digests.

**Rationale:** Build tooling has no place in a runtime image: each compiler and package cache widens the attack surface of every deployment. Multi-stage builds leave that tooling in the build stage. A pinned base-image digest fixes the exact reviewed base, so a rebuild months later starts from the same bytes.

### Run images as non-root

**Statement:** A release image MUST run its application with a non-root runtime user.

**Rationale:** A compromised application process inherits the rights of its runtime user. A non-root user confines the attacker to what that user may touch. Root would hand over the whole container.

### Copy only runtime files

**Statement:** A runtime image MUST contain only files required to run the deployed application.

**Rationale:** Every file in the runtime image ships to every replica and waits for an attacker to read it. Copying only the files the application needs keeps the image small to transfer and to inspect. Each extra file is cost with no runtime purpose.

### Exclude build material from runtime images

**Statement:** A runtime image MUST NOT contain source, tests, package caches, or local configuration.

**Rationale:** Source, tests, package caches, and local configuration serve the build and never the running application. Carrying them into production leaks internals to anyone who pulls the image. Secrets stay out under `litespec/quality/security#keep-secrets-out-of-tracked-and-observable-data`.

### Supply runtime configuration externally

**Statement:** A deployment platform MUST supply connection strings, OIDC settings, exporter endpoints, and secrets outside the image.

**Rationale:** Connection strings, OIDC settings, exporter endpoints, and secrets differ by environment. Supplying them outside the image lets one image serve every environment. Baking them in would rebuild and re-test the image for each environment it enters.

### Exclude environment configuration from images

**Statement:** A release image MUST NOT contain environment-specific configuration.

**Rationale:** One immutable image must deploy unchanged into staging and production. Environment values baked into the image break that promise: the tested bytes and the deployed bytes differ. External values keep the image identical everywhere it runs.

### Apply schema work before traffic

**Statement:** A release job MUST apply reviewed schema changes before traffic shifts to new application replicas, under `litespec/backend/persistence#control-production-schema-changes`.

**Rationale:** New application replicas expect the schema their release reviewed. The release job applies those schema changes before traffic shifts, under `litespec/backend/persistence#control-production-schema-changes`. Traffic first would send new code against an old schema.

### Keep schema work out of startup

**Statement:** An application replica MUST NOT alter the production schema during startup, under `litespec/backend/persistence#control-production-schema-changes`.

**Rationale:** Several replicas can start at once, each running its own startup. Schema work in startup then runs concurrently, without the release job's review and ordering. Startup reads the schema the release job prepared and changes nothing.

### Wait for replica readiness

**Statement:** A deployment controller MUST start new replicas and wait for readiness before shifting traffic.

**Rationale:** New replicas need time to load before they serve: a replica that receives traffic mid-startup fails its first requests. The controller starts them, waits for readiness, and only then shifts traffic. Readiness proves the new version serves before it becomes the version.

### Test released traffic

**Statement:** A release deployment MUST run the release's recorded end-to-end suite after traffic reaches the new version.

**Rationale:** An image that builds can still fail where it runs: routing, configuration, and data differ from the build machine. Running the release's recorded end-to-end suite after traffic shifts tests the deployed path itself. The release record names the suite, so the check runs the same tests every release.

### Retain rollback material

**Statement:** A release owner MUST record the rollback procedure as a Runbook record identifying the previous image digest, under `litespec/quality/operations#keep-rollback-executable`.

**Rationale:** A rollback under pressure must not depend on memory. The Runbook record carries the tested rollback command with the previous image digest, which names one immutable image, under `litespec/quality/operations#keep-rollback-executable`. A tag alone could have moved since the release went out.

### Limit container privileges

**Statement:** A deployment MUST use a read-only filesystem when the application permits it and drop unnecessary capabilities.

**Rationale:** A read-only filesystem and dropped capabilities shrink what a compromised process can do next: no writes outside declared paths, no privileged calls it never needed. The limits apply where the application permits them. Each kept capability is an action an attacker inherits.

### Declare writable paths and limits

**Statement:** A deployment MUST declare writable paths and record CPU and memory bounds as Limit records.

**Rationale:** Declared writable paths name the mutable storage the application needs, and CPU and memory bounds as Limit records cap what one deployment may consume. The bounds protect the node's capacity from one hungry replica. The declarations also tell the next reader what the application was sized for.

### Run the application as PID 1

**Statement:** A container MUST run the application as its entry process.

**Rationale:** The platform stops a container by signaling its entry process. An application running as PID 1 receives that signal and shuts down on purpose. A wrapper that swallows the signal leaves the platform waiting until it kills the container mid-work.

### Set sufficient shutdown time

**Statement:** A deployment MUST set a shutdown grace period longer than measured request or Worker stop time.

**Rationale:** Stopping a replica interrupts its in-flight requests and Worker jobs. A grace period longer than the measured stop time lets that work finish or record a safe interruption. A shorter period kills work the system then has to reconcile.

### Write runtime logs to streams

**Statement:** A containerized application MUST write logs to standard output or standard error.

**Rationale:** Container filesystems vanish with their replicas, so a log file inside the container dies with the evidence it holds. Standard output and standard error hand each line to the platform's log collection. The platform then keeps logs past the life of any one replica.

### Keep mutable data external

**Statement:** A containerized application MUST keep mutable data outside its container filesystem.

**Rationale:** The platform recreates replicas at will: deploys, scaling, and node failures each replace containers with fresh ones. Mutable data kept inside the container filesystem dies with its replica. External storage keeps the data alive across every recreation.

### Apply OCI release labels

**Statement:** A release image MUST include OCI source, revision, version, and created-time labels.

**Rationale:** Source, revision, version, and created-time labels in the OCI standard form connect each image to the commit and release that produced it. An incident responder reads the running image's labels and opens the exact source. Images without labels force that join through guesswork.

### Record image digests

**Statement:** A release record MUST store the deployed image digest rather than only an image tag.

**Rationale:** The release record stores the deployed digest, not just the tag. A tag can move to a newer image after release, while the digest names the exact bytes that went out. The digest makes the deployed artifact reproducible and the rollback target exact.

### Exclude build timestamps from contracts

**Statement:** A published OpenAPI document or generated client MUST NOT contain a build timestamp.

**Rationale:** A generated-at field or a build-time comment changes the OpenAPI document and generated clients on every build. The diff then reports change where no contract changed, which buries real breaks. Contracts carry version identity instead of build time.

### Separate frontend configuration classes

**Statement:** A frontend image build MUST distinguish public build-time configuration from server-only runtime secrets.

**Rationale:** A frontend build produces a browser bundle that anyone may download. Public build-time configuration belongs there, and server-only runtime secrets must never join it. The build distinguishes the two classes so each value lands in its own delivery.

### Use protected frontend secret delivery

**Statement:** A frontend image build MUST use secret mounts or runtime injection for secrets.

**Rationale:** Secret mounts and runtime injection hand secrets to the build without writing them into a layer. Nothing secret then persists in the image history. A pulled image reveals its layers to anyone, so a layer must never hold a secret.

### Exclude insecure frontend secret carriers

**Statement:** A frontend image build MUST NOT use `ARG`, copied environment files, or image layers for secrets.

**Rationale:** `ARG` values, copied environment files, and image layers all persist into the image history. A secret delivered through any of them stays readable to anyone who pulls the image. Secrets stay out of layers under `litespec/quality/security#keep-secrets-out-of-tracked-and-observable-data`.

## Conventions

### Place Dockerfiles beside deployables

**Default:** Keep one Dockerfile beside each deployable application.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** One Dockerfile beside each deployable application keeps the image definition with the project that defines its runtime output. A reader finds the build next to the code it ships. A shared folder of Dockerfiles separates each build from its owner.

### Build from the workspace root

**Default:** Build images from the workspace root when shared project or package files are required.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** Shared project and package files sit above any one application, so the build starts from the workspace root to reach them. The Dockerfile excludes what the build does not need, including unrelated secrets. A narrower context would copy shared inputs into each build or miss them.

## Dependencies

This extension adds no required package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/containers#build-release-images-in-stages | checkable | `ContainersImageTests` assert multi-stage builds and digest-pinned release bases. |
| litespec/ext/containers#run-images-as-non-root | checkable | `ContainersImageTests` assert the declared non-root runtime user. |
| litespec/ext/containers#copy-only-runtime-files | checkable | `ContainersImageTests` match the image file listing against the declared runtime manifest. |
| litespec/ext/containers#exclude-build-material-from-runtime-images | checkable | `ContainersImageTests` find no build-only files or local configuration in runtime images. |
| litespec/ext/containers#supply-runtime-configuration-externally | checkable | `ContainersConfigTests` match deployment manifests against runtime values declared outside the image. |
| litespec/ext/containers#exclude-environment-configuration-from-images | checkable | `ContainersConfigTests` find no environment-specific configuration in release images. |
| litespec/ext/containers#apply-schema-work-before-traffic | checkable | `ContainersSchemaTests` place the reviewed schema job before the traffic shift. |
| litespec/ext/containers#keep-schema-work-out-of-startup | checkable | `ContainersSchemaTests` observe no production schema mutation from replica startup. |
| litespec/ext/containers#wait-for-replica-readiness | checkable | `ContainersTrafficTests` assert new replicas reach readiness before traffic shifts. |
| litespec/ext/containers#test-released-traffic | checkable | `ContainersTrafficTests` pass after new-version traffic shift. |
| litespec/ext/containers#retain-rollback-material | checkable | `ContainersRollbackTests` resolve the Runbook record and its previous image digest. |
| litespec/ext/containers#limit-container-privileges | checkable | `ContainersSecurityTests` assert read-only filesystem and dropped capabilities in the deployment manifest. |
| litespec/ext/containers#declare-writable-paths-and-limits | checkable | `ContainersSecurityTests` match the manifest against declared writable paths and Limit records. |
| litespec/ext/containers#run-the-application-as-pid-1 | checkable | `ContainersProcessTests` confirm the application receives the container stop signal. |
| litespec/ext/containers#set-sufficient-shutdown-time | checkable | `ContainersProcessTests` assert in-flight work stops within the declared grace period. |
| litespec/ext/containers#write-runtime-logs-to-streams | checkable | `ContainersProcessTests` assert container logs appear on standard output or standard error. |
| litespec/ext/containers#keep-mutable-data-external | guidance | Does the design keep every piece of mutable data outside the container filesystem? |
| litespec/ext/containers#apply-oci-release-labels | checkable | `ContainersMetadataTests` assert the four required OCI labels on built images. |
| litespec/ext/containers#record-image-digests | checkable | `ContainersMetadataTests` identify the deployed artifact by immutable digest in the release record. |
| litespec/ext/containers#exclude-build-timestamps-from-contracts | checkable | `ContainersMetadataTests` assert the generated-contract diff contains no build timestamp. |
| litespec/ext/containers#separate-frontend-configuration-classes | guidance | Does the frontend build keep public configuration apart from server-only secrets? |
| litespec/ext/containers#use-protected-frontend-secret-delivery | guidance | Does the frontend build deliver every secret through mounts or runtime injection? |
| litespec/ext/containers#exclude-insecure-frontend-secret-carriers | checkable | `ContainersConfigTests` reject `ARG`, copied environment files, and secret-bearing layers. |
| litespec/ext/containers#place-dockerfiles-beside-deployables | checkable | `ContainersTests` assert a colocated Dockerfile per deployable or a recorded Exception. |
| litespec/ext/containers#build-from-the-workspace-root | checkable | `ContainersTests` assert image builds access declared shared inputs from repository-root context. |
