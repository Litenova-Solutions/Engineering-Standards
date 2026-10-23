---
{
  "type": "entry-point-list",
  "title": "<Entry points display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "records": [
    {
      "type": "entry-point",
      "id": "entry-point/<name>",
      "title": "<Entry point display title>",
      "kind": "<browser|api|webhook|device|cli|mcp|served-content|reaction|job>",
      "auth": ["<session|token|device|link|app|anonymous|system>"],
      "path": "<Path when the kind is served-content, otherwise remove this line>",
      "contentType": "<Content type when the kind is served-content, otherwise remove this line>",
      "cacheControl": "<Cache value when the kind is served-content, otherwise remove this line>",
      "versioning": "<Versioning when the kind is served-content, otherwise remove this line>",
      "fulfills": ["<requirement/<topic>.<name> when the kind is served-content, otherwise remove this line>"]
    }
  ]
}
---
# <Entry Points Display Title>
