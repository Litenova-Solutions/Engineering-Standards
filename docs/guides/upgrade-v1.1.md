# Upgrade to Standards v1.1

## Intent

Standards v1.1 adds product and operating context to the product brief, requires ownership and freshness metadata for new or materially changed consumer documents, and adds code-document consistency checks.

## Agent Summary {#agent-summary}

- Update the pinned standards commit through a dedicated consumer change.
- Add the document metadata block to new or materially changed consumer documents.
- Add commercial, legal, provider, money, risk, audit, and support context to the product brief.
- Run the documentation consistency check with the related code, tests, and generated contracts.

## Upgrade steps

1. Update the `standards` submodule to the v1.1 release commit or tag.
2. Add the metadata block from `WRITING.METADATA.001` to the product brief, domain index, glossary, capability documents, use-case specifications, page specifications, decisions, and runbooks when each document is next changed.
3. Fill the product brief's Product and operating context section. Record `None` for a category that does not apply.
4. Mark future behavior as `planned` and remove claims that current code does not support. Record code paths, test paths, acceptance IDs, generated contracts, or operating records for current implementation claims.
5. Run the documentation, code, test, generated-contract, and applicable release checks together.

## Compatibility

V1.1 does not change the baseline application project layout, dependency direction, persistence model, API model, or frontend model. Existing documents do not require a bulk rewrite before the next document change. A changed document must use the v1.1 metadata and consistency checks.

## Verification

- Confirm the submodule records the v1.1 release commit or tag.
- Confirm changed consumer documents contain complete metadata.
- Confirm the product brief records the product and operating context.
- Confirm current documentation maps to source, tests, generated contracts, and operating records when those surfaces exist.
- Confirm no active acceptance ID, route, operation ID, error code, or public business name is left without matching evidence.
