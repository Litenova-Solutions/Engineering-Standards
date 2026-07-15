---
{
  "id": "recipe.frontend-authjs",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["frontend.app", "security.review"],
  "recipes": ["frontend-authjs"]
}
---
# Auth.js Frontend Authentication

## RECIPE.AUTHJS.ADOPT.001 - Keep provider behavior in the recipe

Enable this recipe when Next.js owns interactive login and session cookies. Backend JWT validation remains provider-neutral.

## RECIPE.AUTHJS.SESSION.001 - Keep session processing server-side

Store session cookies with `HttpOnly`, `Secure` outside local HTTP development, and an explicit `SameSite` policy. Read and refresh provider tokens on the server.

## RECIPE.AUTHJS.API.001 - Call protected APIs through a server boundary

Prefer Server Components, Server Actions, or Route Handlers that attach the access token server-side. Do not place refresh tokens in browser storage.

## RECIPE.AUTHJS.FAILURE.001 - Handle session failure explicitly

Expired or revoked sessions redirect to a safe login path. Authorization failures remain distinct from authentication failures. Do not retry 401 or 403 responses indefinitely.

## RECIPE.AUTHJS.GATES.001 - Test the complete session lifecycle

Cover login, callback validation, logout, expiry, refresh failure, authenticated API calls, and forbidden resource access.
