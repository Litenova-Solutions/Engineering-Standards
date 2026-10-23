---
{
  "type": "decision",
  "id": "decision/0001-loan-period",
  "title": "Loan period",
  "owner": "lending-team",
  "status": "draft",
  "options": [
    {
      "name": "14 days",
      "for": "Copies turn over fast for holds.",
      "against": "Readers rush through long books."
    },
    {
      "name": "21 days",
      "for": "Most readers finish in three weeks.",
      "against": "Holds wait a week longer."
    },
    {
      "name": "28 days",
      "for": "Slow readers keep up.",
      "against": "Popular copies sit idle."
    }
  ],
  "changeWhen": "Reader demand shifts.",
  "decides": [
    "requirement/borrowing.loan-period-days"
  ],
  "basedOn": [],
  "decider": "lending-team",
  "decideBy": "2027-01-01"
}
---

# Loan period

## Context

Readers asked for a longer loan.

## Options

Fourteen, 21, or 28 days.

## Decision

The loan lasts 21 days.

## Consequences

Holds wait longer.

## Evidence

Reader survey, January 2026.
