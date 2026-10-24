---
{
  "type": "use-case",
  "id": "use-case/<module>.<name>",
  "title": "<Use case display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "kind": "<command|query>",
  "serves": ["<journey/<name>#<step-id> or goal/<name>>"],
  "fulfills": ["requirement/<topic>.<name>"],
  "access": {
    "auth": ["<session|token|device|link|app|anonymous|system>"],
    "grant": "<permission/<name>|self(permission/<name>)|anonymous|system>",
    "tenant": "<own|cross|public|none>"
  },
  "reachedThrough": ["entry-point/<name>"],
  "input": [
    {
      "name": "<field>",
      "meaning": "<What this field means>",
      "rules": ["<The shape each value obeys>"],
      "source": "<caller|claim|derived>",
      "classification": "<public|internal|personal|sensitive>"
    }
  ],
  "output": {
    "include": {
      "<group>": {
        "fields": [
          {
            "name": "<field>",
            "meaning": "<What this field means>"
          }
        ],
        "classification": "<public|internal|personal|sensitive>",
        "source": ["aggregate/<module>.<name>"],
        "freshness": "<immediate|snapshot|bounded (<duration>)|advisory>",
        "visibleWhen": "<Condition, or remove this line>",
        "wideningBecause": "<requirement/<topic>.<name>, or remove this line>"
      }
    }
  },
  "paging": {
    "order": "<Field and direction; replace the whole paging object with none (<reason>) when the query returns one object>",
    "cursor": "<Cursor field, or replace this line with an offset field>",
    "defaultLimit": "<number>",
    "maxLimit": "<number>"
  },
  "builtAsynchronously": "<true when the query source lags, otherwise remove this line>",
  "changes": ["aggregate/<module>.<name>"],
  "reads": ["aggregate/<module>.<name>"],
  "consistency": {
    "mode": "<atomic|per-record|compensated|best-effort>",
    "because": ["<rule/<aggregate>.<name> when the mode is atomic across aggregates, or remove this line>"]
  },
  "effects": [
    {
      "issues": "<use-case/<module>.<name>, or replace this key with sends, publishes, or calls>",
      "timing": "<inline|after-commit|async>",
      "sharesTransaction": "<true or false when the timing is inline with issues, otherwise remove this line>",
      "onFailure": "<retry (<attempts>, <backoff>) then dead-letter|skip-and-log|discard>",
      "before": "<Another entry target with its reason, or remove this line>",
      "forEach": "<Scope, or remove this line>"
    }
  ],
  "raises": ["event/<aggregate>.<past-tense>"],
  "idempotency": {
    "mode": "<key|state|not-pending|none>",
    "key": "<Key template of {field} placeholders over the input field names, when the mode is key, otherwise remove this line>",
    "scope": "<organizer|account|login|global when the mode is key, otherwise remove this line>",
    "reason": "<Reason when the mode is none, otherwise remove this line>"
  },
  "audit": {
    "reason": "<required|optional|none; replace this whole audit object with { exempt: <justification> } when exempt>",
    "target": "<Target kind, or none>"
  },
  "risk": ["<money|door|personal-data|access, or remove this line>"],
  "records": [
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Success display title>",
      "outcome": "success",
      "meaning": "<The observable result in one sentence>",
      "codes": ["<Recorded code, or remove this line>"]
    },
    {
      "type": "result",
      "id": "result/<use-case>.<name>",
      "title": "<Refusal display title>",
      "outcome": "refusal",
      "code": "<module>.<reason; never write the generic forbidden or invalid-input refusals>",
      "meaning": "<What the caller sees in one sentence; list refusals in precedence order, first match wins>",
      "recorded": "<true when the attempt is stored, otherwise remove this line>"
    },
    {
      "type": "scenario",
      "id": "scenario/<use-case>.<name>",
      "title": "<Scenario display title>",
      "given": "<The starting state>",
      "when": "<What the actor does>",
      "then": "<The observable result>",
      "result": "result/<use-case>.<name>",
      "examples": [
        {
          "<column>": "<value>"
        }
      ]
    }
  ],
  "terms": ["term/<term-name>"],
  "questions": [
    {
      "question": "<The open question, or remove the questions block>",
      "decider": "<owner>",
      "decideBy": "<YYYY-MM-DD>"
    }
  ]
}
---
# <Use Case Display Title>

## Goal

State the actor goal in one sentence. For a command, replace the output object with a list of name and meaning entries, or remove output when the command returns nothing.

## What Happens

State the behavior in order, in plain sentences. Keep this section when the use case changes more than one aggregate, refuses for a reason beyond the generic ones, carries any risk, or has an inline effect; otherwise remove it.

## Example

Optional. Show one realistic run of this use case, drawing people, place, dates, and amounts from the example cast. Remove this section when no run adds to the scenarios.

## Notes

Optional. Record anything a reader needs that fits no section above, under free `###` headings. Notes are informative and never authoritative. Remove this section when there is nothing to note.
