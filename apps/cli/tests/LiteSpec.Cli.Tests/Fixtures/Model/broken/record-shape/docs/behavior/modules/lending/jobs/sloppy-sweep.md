---
{
  "type": "job",
  "id": "job/lending.sloppy-sweep",
  "title": "Sloppy sweep",
  "owner": "lending-team",
  "status": "draft",
  "decider": "lending-team",
  "decideBy": "2035-06-01",
  "kind": "one-off",
  "issues": [
    "use-case/lending.return-copy"
  ],
  "fulfills": [
    "requirement/borrowing.loan-period-days"
  ],
  "onFailure": {
    "retry": {
      "maxAttempts": 10,
      "initialDelay": "5 seconds",
      "maxDelay": "PT10M",
      "backoff": "exponential"
    },
    "deadLetter": {
      "after": "7 days",
      "action": "Replay by hand."
    }
  }
}
---

# Sloppy sweep

A job that keeps the retired edge field and states its delays in prose instead of ISO 8601 durations.
