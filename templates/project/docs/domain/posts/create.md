---
{
  "id": "posts.create",
  "kind": "command",
  "status": "active",
  "actors": ["author"],
  "surfaces": ["api"],
  "criticality": ["authorization"],
  "recipes": []
}
---
# Create post

## Intent

An authenticated author creates a post that can be read through the API.

## Authorization

The actor ID comes from the validated `sub` claim. The request cannot supply another actor ID.

## Preconditions

- The actor has a valid authenticated session.

## Input

- Title: required text with at most 200 characters after trimming.

## Output

- The new post ID and normalized title.

## Business rules

- The title cannot be empty.
- The post belongs to the authenticated actor.

## Main flow

1. Read the actor ID from claims.
2. Validate the title.
3. Create and store the aggregate.
4. Return the created representation and resource location.

## Failures

- `validation_failed`: the title or actor claim is invalid.
- `unexpected_error`: an unhandled server failure occurred.

## Acceptance criteria

- [AC-POSTS-CREATE-01] An authenticated author can create and read a post with the normalized title and their actor ID.

## Examples

### Successful example

Given an authenticated author and the title ` First post `
When the author creates the post
Then the stored title is `First post` and the author ID matches the `sub` claim

