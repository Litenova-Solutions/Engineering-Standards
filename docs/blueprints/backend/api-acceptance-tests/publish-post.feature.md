# Blueprint: Publish Post Feature File

Copy to `Features/Posts/PublishPost.feature`. Maps to `docs/domain/posts/publish-post.md`.

```gherkin
@acceptance @critical @usecase:posts/publish-post
Feature: Publish Post

  An authenticated Author publishes a Draft post, making it visible on the public web.

  @ac:AC-001 @critical
  Scenario: Author publishes a draft post
    Given an authenticated author exists
    And the author has a draft post titled "Blueprint acceptance draft"
    When the author publishes the post
    Then the response is successful
    And the post is visible in the published posts feed

  @ac:AC-003 @critical
  Scenario: Publishing an already published post is rejected
    Given an authenticated author exists
    And the author has a published post titled "Already published blueprint"
    When the author publishes the post
    Then the response is a conflict problem

  @ac:AC-004 @authz @critical
  Scenario: Unauthenticated publish request is rejected
    Given the author has a draft post titled "Unauthenticated publish blueprint"
    When an unauthenticated caller publishes the post
    Then the response is unauthorized
```

Do not restate exceptions or HTTP paths here. Link to the use-case doc for normative contract details.
