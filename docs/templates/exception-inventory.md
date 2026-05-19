<!-- Last updated: (fill in date when first created in a project) -->
<!-- Required sections: Exception Types, HTTP Mapping -->
# Exception Inventory

> Copy this file into `docs/domain/exception-inventory.md` in your project repository and fill it in. Update it whenever a new aggregate is added or a new domain invariant is introduced.

---

This file gives engineers and agents a reference for all custom exceptions so they throw the correct type rather than inventing a new one or using a generic exception. Before writing a validator, a repository method, or an aggregate method, check this file.

> **Note:** Every new aggregate MUST add at least one `NotFoundException` entry to this table. Every new domain invariant that can be violated MUST add a `DomainException` entry.

---

## Exception Types

| Exception Class | Category | Location | HTTP Status | When Thrown |
|:---|:---|:---|:---|:---|
| `PostNotFoundException` | NotFound | `Domain/Posts/Exceptions/PostNotFoundException.cs` | 404 | Repository `GetByIdAsync` when no post exists with the given `PostId`. |
| `PostTitleRequiredException` | Validation | `Application.Write.Contracts/Posts/Exceptions/PostTitleRequiredException.cs` | 400 | `CreatePostCommandValidator` when `Title` is null or empty. |
| `PostTitleTooLongException` | Validation | `Application.Write.Contracts/Posts/Exceptions/PostTitleTooLongException.cs` | 400 | `CreatePostCommandValidator` when `Title` exceeds 200 characters. |
| `PostAlreadyPublishedException` | DomainInvariant | `Domain/Posts/Exceptions/PostAlreadyPublishedException.cs` | 409 | `Post.Publish()` when the post is already in `PublishedPostState`. |
| `AuthorNotFoundException` | NotFound | `Domain/Authors/Exceptions/AuthorNotFoundException.cs` | 404 | Repository `GetByIdAsync` when no author exists with the given `AuthorId`. |
