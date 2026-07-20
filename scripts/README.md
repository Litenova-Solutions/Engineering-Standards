# Standards validation scripts

These read-only scripts check consumer documentation rules that JSON Schema cannot check across files. The domain check expects `docs/domain/subjects/` and `docs/domain/cross-cutting/` buckets.

## Validate domain documentation

Run from the consumer repository root:

```powershell
powershell -File standards/scripts/validate-domain-docs.ps1
```

The check validates subject and use-case IDs, allowed risk flags, extension inheritance, acceptance ID prefixes, and test references for active acceptance IDs. It does not remove files or modify ignore rules.
