---
{
  "kind": "section-index",
  "id": "__SECTION_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __SECTION_TITLE__

State what this directory holds and which records live elsewhere.

A section index claims no implemented behavior. It owns no aggregate, use case, or domain policy, so it carries only the base metadata fields. Use it for a directory whose contents no other index kind covers, such as a frontend architecture index or an evidence register.

```text
__SECTION_PATH__/
  README.md
  first-record.md
  second-record.md
```

Link each record this directory holds. Name the directory that owns anything a reader might expect here and will not find.
