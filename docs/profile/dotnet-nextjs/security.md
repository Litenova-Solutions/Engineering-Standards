---
{
  "id": "profile.dotnet-nextjs.security",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["backend.api", "frontend.app", "security.review"],
  "recipes": []
}
---
# Security

## Agent Quick Rules {#agent-quick-rules}

- Validate JWTs through OIDC metadata and configured issuer and audience.
- Derive authenticated actor IDs from claims.
- Check resource ownership for object access.
- Keep secrets outside source control and bind validated options.
- Return safe Problem Details without exception internals.
- Treat authentication, authorization, and sensitive data as critical assurance triggers.

## SECURITY.AUTHN.001 - Use generic OIDC and JWT validation

WebApi validates bearer tokens against the configured issuer, audience, signing keys, lifetime, and allowed algorithms. Configuration binds to startup-validated options.

Provider-specific login and browser session behavior belongs in an enabled frontend authentication recipe.

## SECURITY.ACTOR.001 - Trust claims for authenticated identity

Map the actor ID from one documented subject claim. Reject missing or invalid actor claims before dispatching the Application message.

Do not accept the same actor ID from client-controlled input.

## SECURITY.AUTHZ.001 - Authorize the target resource

Use endpoint policies for coarse permissions and an Application query or aggregate rule for resource ownership. A valid token does not grant access to every object of the same type.

Cover unauthenticated, forbidden, and permitted cases for protected operations.

## SECURITY.INPUT.001 - Validate at trust boundaries

Validate HTTP shape before application dispatch and business invariants in Domain. Set request-size limits for uploads and large bodies. Normalize identifiers only when the domain contract defines normalization.

## SECURITY.SECRETS.001 - Keep secrets out of tracked files

Use local secret storage for development and the deployment platform's secret store outside development. Repository templates contain names and safe placeholders, never credentials.

## SECURITY.SQL.001 - Parameterize database input

Use Marten LINQ, parameterized commands, or interpolated SQL APIs that create parameters. Do not concatenate user input into SQL.

## SECURITY.ERRORS.001 - Limit public error detail

Problem Details exposes stable codes, field-level validation messages, and a trace ID. Logs may contain the internal exception under access controls. Responses cannot contain stack traces, SQL, tokens, connection strings, or internal file paths.

## SECURITY.SUPPLY.001 - Pin and review dependencies

Use the exact versions in the standards manifest and the consumer lockfiles. Run NuGet vulnerability checks and `pnpm audit` in CI. A new package requires a current use case, license review, and a decision when it changes an architectural boundary.

## SECURITY.FRONTEND.001 - Keep browser trust explicit

Do not expose server secrets through public environment variables. Escape user content by default. Sanitization is required before rendering trusted HTML. Configure content security policy when the application renders third-party scripts or user HTML.
