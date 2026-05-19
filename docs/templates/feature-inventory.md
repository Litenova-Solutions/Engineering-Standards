<!-- Last updated: (fill in date when first created in a project) -->
<!-- Required sections: Implemented Features, Planned Features -->
# Feature Inventory

> Copy this file into `docs/domain/feature-inventory.md` in your project repository and keep it current as features are added. Update this table in the same PR that adds or removes a handler.

---

This file gives agents a map of what exists before they start generating new handlers. Without it, agents pattern-match on nearby code and create duplicate use cases with slightly different names. A stale inventory is worse than no inventory because agents will follow it confidently in the wrong direction. Keep it accurate.

> **Note:** Update this table in the same PR that adds or removes a handler. A stale inventory is worse than no inventory because agents will follow it confidently in the wrong direction.

---

## Use Cases

| Feature | Use Case | Type | Handler Class | Status |
|:---|:---|:---|:---|:---|
| Posts | Create Post | Command | `CreatePostCommandHandler` | Implemented |
| Posts | Publish Post | Command | `PublishPostCommandHandler` | Implemented |
| Posts | Archive Post | Command | `ArchivePostCommandHandler` | Planned |
| Posts | Get Post by ID | Query | `GetPostByIdQueryHandler` | Implemented |
| Posts | List Posts by Author | Query | `GetAllPostsByAuthorQueryHandler` | Implemented |
