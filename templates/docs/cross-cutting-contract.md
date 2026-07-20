# __CONTRACT_TITLE__

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Scope

State the behavior shared across subjects. Name the affected subjects and the customer or operator outcome it protects.

## Contract

| Rule ID | Required behavior | Applies to | Failure result |
|:---|:---|:---|:---|
| `CONTRACT-01` | State one shared rule. | `__SUBJECT__` | State the observable result. |

## Ownership

- Business owner: `__OWNER__`.
- Runtime owner: Name the Application, Domain, Infrastructure, or WebApi boundary.
- Decision owner: Name the role that may change the contract.

## Subject boundaries

Describe the public command, query, event, or port used between subjects. State which subject owns each invariant and which data may cross the boundary.

## Security, retention, and provider limits

State access rules, data classification, retention behavior, provider assumptions, and limits. Link a decision record when policy is unresolved.

## Verification

List acceptance IDs, integration or contract tests, operating checks, and release gates that prove the contract.

## Change control

State the compatibility, migration, review, and rollback requirements for a contract change.
