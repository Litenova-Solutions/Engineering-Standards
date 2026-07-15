---
{
  "id": "recipe.deployment-containers",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["delivery", "security.review"],
  "recipes": ["deployment-containers"]
}
---
# Container Deployment

## RECIPE.CONTAINERS.IMAGE.001 - Build immutable non-root images

Use multi-stage builds, pinned base image digests for release, a non-root runtime user, and only required runtime files. Do not place build credentials or application secrets in image layers.

## RECIPE.CONTAINERS.CONFIG.001 - Inject runtime configuration

Supply connection strings, OIDC values, and secrets through the deployment platform. Keep environment-specific configuration outside the image.

## RECIPE.CONTAINERS.SCHEMA.001 - Run schema work as a release job

Apply reviewed schema changes before shifting traffic. WebApi replicas do not compete to update the database during startup.

## RECIPE.CONTAINERS.TRAFFIC.001 - Gate traffic on readiness

Start new replicas, wait for readiness, then shift traffic. Run the primary-journey smoke test after traffic reaches the new version.

## RECIPE.CONTAINERS.ROLLBACK.001 - Retain the previous artifact

Keep the previous image reference and an executable rollback command. Confirm the new schema remains compatible with the previous application before deployment.

