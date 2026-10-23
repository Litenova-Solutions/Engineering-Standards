---
{
  "type": "retention-schedule",
  "title": "<Retention schedule display title>",
  "owner": "<owner>",
  "status": "draft",
  "decider": "<owner>",
  "decideBy": "<YYYY-MM-DD>",
  "records": [
    {
      "dataClass": "<class>",
      "aggregates": ["aggregate/<module>.<name>"],
      "basis": "<statute|business|engineering>",
      "period": "<ISO duration, or none (on-demand)>",
      "enforcedBy": "<job/<module>.<name>|record-expiry|store-ttl|query-filter>",
      "intent": "<requirement/<topic>.<name>, required for personal or sensitive>",
      "processors": [
        {
          "system": "external-system/<name>",
          "forwarding": "<How erasure forwards, or impossible (<reason>)>",
          "acceptedBy": "<Decision or requirement id>"
        }
      ],
      "conflicts": "<Which wins when keeping for audit and erasing for the subject collide, and who records it>"
    }
  ]
}
---
# <Retention Schedule Display Title>
