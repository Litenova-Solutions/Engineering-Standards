# __REGISTER_TITLE__

## Document metadata

- Owner: __OWNER__.
- Document status: `current`, `planned`, `retired`, or `reference`.
- Last verified: `YYYY-MM-DD`.
- Canonical source: `This document` or one repository path.
- Implementation evidence: code paths, test paths, acceptance IDs, generated artifacts, operating records, or `None`.

## Purpose

State the decision, journey, or release claim that this register supports.

## Evidence classes

- `Observed`: directly recorded behavior, interview finding, log, test result, or provider statement.
- `Calculated`: a value derived from identified observations and a named calculation.
- `Inferred`: an interpretation supported by observations but not directly recorded.
- `Hypothesis`: an unverified claim that needs a test, interview, or decision.
- `Gate`: a condition that must be met before a decision or release can proceed.

## Register

| ID | Claim | Class | Source or calculation | Confidence | What changes confidence | Decision or use-case impact |
|:---|:---|:---|:---|:---|:---|:---|
| `EVID-01` | State one claim. | `Observed` | Link the source. | `High` | State the next check. | State the affected choice. |

## Decision gates

| Gate | Required evidence IDs | Owner | Due or review date | Status |
|:---|:---|:---|:---|:---|
| `GATE-01` | `EVID-01` | `__OWNER__` | `YYYY-MM-DD` | `planned` |

## Assumptions and gaps

- State a missing source, unresolved conflict, or hypothesis that blocks a decision.

## Verification

State who reviews the register, what source is checked, and when the status may change.
