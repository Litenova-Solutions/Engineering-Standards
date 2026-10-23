---
{
  "type": "external-system",
  "id": "external-system/<name>",
  "title": "<External system display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "actor": "actor/<name>",
  "operations": [
    {
      "name": "<operation>",
      "direction": "<out|in>",
      "timeout": "<duration>",
      "onTimeout": "<What happens on timeout>",
      "retries": "<Retry policy>",
      "response": "<What the response carries>",
      "cache": "<Cache policy, or remove this line>"
    }
  ],
  "erasure": "<call <operation>|via integration-event/<name>|impossible (<reason>)>",
  "acceptedBy": "<Decision or requirement id when erasure is impossible, otherwise remove this line>",
  "sends": ["<What the product sends, or remove this line>"],
  "receives": ["<What the product receives, or remove this line>"],
  "failure": "<What happens when this system fails, in words>",
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
# <External System Display Title>

## Summary

State what this system does for the product and who operates it.
