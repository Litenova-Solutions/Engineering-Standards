# Upgrade to Standards v1.2

## Intent

Standards v1.2 replaces structural capability terminology with subject terminology. It also makes the distinction between the cross-layer subject boundary and the runtime aggregate root explicit.

## Agent Summary {#agent-summary}

- Update the pinned standards commit through a dedicated consumer change.
- Treat each existing `docs/domain/{name}/README.md` as a subject specification.
- Replace structural capability terminology with subject terminology across current documentation, folders, tests, and architecture checks.
- Keep `AggregateRoot<TId>` as the runtime consistency and mutation boundary.
- Do not introduce `Subject`, `ISubject`, or `SubjectRoot` runtime abstractions.
- Rename Application results, query result items, handlers, and validators to include their `Command` or `Query` role.
- Rename HTTP DTOs and mapping classes to include `RequestModel`, `ResponseModel`, or `ApiMappings`.
- Keep existing use-case, invariant, and acceptance IDs when the subject identifier is unchanged.

## Upgrade steps

1. Update the `standards` submodule to the v1.2 release commit or tag.
2. Replace uses of `templates/docs/capability.md` with `templates/docs/subject.md`. Existing specifications under `docs/domain/{subject}/README.md` keep their paths.
3. Replace structural capability wording with subject wording across current documents, tests, folder checks, and architecture rules. Historical decision records may retain the vocabulary they originally accepted.
4. Update standards overrides from `ADDD.CAPABILITY.001` to `ADDD.SUBJECT.001` and from `ARCH.CAPABILITIES.001` to `ARCH.SUBJECTS.001`.
5. Rename Application types and files from role-ambiguous names such as `CreateDraftResult`, `CreateDraftHandler`, and `GetPostHandler` to `CreateDraftCommandResult`, `CreateDraftCommandHandler`, and `GetPostQueryHandler`. Apply the same rule to command and query validators.
6. Replace query-specific names such as `PostSummary` with the owning use-case name and role, such as `ListPostsQueryResultItem`.
7. Rename WebApi types and files from names such as `CreateDraftRequest`, `CreateDraftResponse`, and `CreateDraftMappings` to `CreateDraftRequestModel`, `CreateDraftResponseModel`, and `CreateDraftApiMappings`. Give every other passive HTTP DTO a concrete boundary role ending in `Model`.
8. Replace `{Concept}` placeholders with `{DomainType}`, `{BusinessTerm}`, or `{BusinessRule}` according to the role.
9. Confirm every state-changing subject names one primary aggregate root. A read-only subject may name no aggregate root.
10. Keep Domain aggregate roots derived from `AggregateRoot<TId>`. Remove or reject any attempted `Subject`, `ISubject`, or `SubjectRoot` runtime abstraction.
11. Compare subject and use-case names across documentation, Domain, Application, API, frontend features, and tests.

## Migration impact

The Subject terminology migration does not require folder, namespace, document-path, or business-identifier changes when the existing subject identifier stays the same. For example, `docs/domain/posts/README.md`, `posts.create-draft`, `INV-POSTS-01`, and `AC-POSTS-CREATE-DRAFT-01` remain valid.

The Application and WebApi naming rules require C# type, file, constructor, generic argument, mapping, and test reference updates. V1.2 also removes the old Capability rule IDs and template path. Consumers must apply these migrations in the same standards-upgrade change. No deprecated aliases remain.

## Verification

- Confirm the submodule records the v1.2 release commit or tag.
- Confirm current specifications use subject terminology and the subject template.
- Confirm each state-changing subject identifies one primary aggregate root.
- Confirm aggregate roots still derive from `AggregateRoot<TId>` and no runtime subject abstraction exists.
- Confirm command and query results, query result items, handlers, validators, files, and tests include their full architectural role suffix.
- Confirm passive HTTP DTOs name their concrete boundary role and end in `Model`; confirm mapping classes, files, and references end in `ApiMappings`.
- Confirm subject and use-case names align across active documentation, code, routes, frontend features, tests, and acceptance evidence.
- Confirm no current override references `ADDD.CAPABILITY.001` or `ARCH.CAPABILITIES.001`.
