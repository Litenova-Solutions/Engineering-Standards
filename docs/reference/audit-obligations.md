# Audit Obligations

## Intent

The audit extension is the LiteSpec bundle a project selects to record who attempted what against which target and what it produced; it satisfies obligations from 4 guidance bodies (NIST, ISO, PCI DSS, and OWASP) and from the General Data Protection Regulation (GDPR). This page states those obligations in one place: the frameworks, the GDPR articles, and the map from each obligation to the provision (one identified rule) that satisfies it. A team writing its audit adoption decision reads it to state that reasoning without surveying the frameworks from scratch; the [Audit Trail](../ext/audit.md) owns every provision, and this page explains and states no rules.

## Reference

### The Frameworks

Four bodies of guidance apply to a business application that holds personal data or touches payments. They agree far more than they differ, so an implementation built to their union satisfies each one without a separate program per framework.

#### NIST SP 800-53, AU Family

The AU controls split auditing into six questions. They are the most complete public statement of the problem.

| Control | Obligation |
|:---|:---|
| AU-2 | Select the audited event types and record the rationale for each. |
| AU-3 | State event type, time, location, source, outcome, and associated identities. |
| AU-6 | Review and analyze the records. |
| AU-9 | Protect the records from unauthorized change and deletion. |
| AU-11 | Retain records for a defined period. |
| AU-12 | Generate records across every component in scope. |

AU-3 is the field list that the other frameworks restate. AU-2 is the control most projects skip, because a selection nobody writes down produces no document to check.

#### ISO/IEC 27001:2022, Annex A 8.15

Control A.8.15 requires logs of user activities, exceptions, faults, and security events. It requires protection from tampering and unauthorized access. It also requires analysis, which makes an unread trail a finding rather than a control.

#### PCI DSS 4.0, Requirement 10

Requirement 10.2.2 names the fields for each event: user identification, event type, date and time, success or failure indication, origination, and affected resource identity.

Requirement 10.2.1 names the events: individual access to cardholder data, actions by administrative accounts, access to the audit records, invalid logical access attempts, and changes to authentication credentials.

A trail that records successes only fails exactly two obligations: the success-or-failure field and the invalid-attempt event.

#### OWASP Logging Cheat Sheet

The OWASP guidance adds the developer-facing half. Record authentication successes and failures, authorization failures, higher-risk actions, sensitive data access, and data import or export.

It also states the exclusions. Never record passwords, session identifiers, access tokens, encryption keys, database connection strings, payment card data, or sensitive personal data.

### GDPR

The General Data Protection Regulation both requires the trail and constrains what it holds. Reading it as only a constraint produces a thin trail, and reading it as only a mandate produces an erasure problem.

| Article | Effect on the trail |
|:---|:---|
| Article 5(2) | Accountability requires demonstrating lawful processing, which the trail shows. |
| Article 30 | Records of processing activities need evidence of who accessed personal data. |
| Article 32 | Security of processing covers the integrity and availability of the trail. |
| Article 17 | Erasure applies to the personal data a record holds. |
| Article 15 | Subject access can reach audit records naming that person. |

The resolution is the record shape. A trail retained on a legal-obligation or legitimate-interest basis stays lawful, and a supervisory authority accepts it. A trail that copies names, addresses, message bodies, or state snapshots into an append-only store conflicts with Article 17, and no retention policy resolves that conflict.

`litespec/ext/audit#exclude-personal-data-beyond-actor-identity` and `litespec/ext/audit#exclude-state-snapshots` prevent that conflict at design time. `litespec/ext/audit#remove-the-identity-mapping-on-erasure` then satisfies an erasure request by removing the mapping from actor identifier to person. The record keeps its evidential value and the person stops being identifiable from it.

Two consequences follow for a project. Record the lawful basis and the retention period of each audited category in the adoption decision. Include the trail in the records of processing activities, because the trail is itself a processing activity.

### Schema Alignment

The record shape follows a model that three sources describe in the same terms: an initiator performs an action on a target and produces an outcome at a time and from a place.

| Source | Contribution |
|:---|:---|
| DMTF CADF, DSP0262 | Initiator, action, target, outcome, and observer event model. |
| NIST AU-3 | The required content of one record. |
| OCSF | Vendor-neutral schema for shipping records to a security platform. |

Following that model at design time needs no extra work. It lets a project map the trail onto a security platform later without remodeling the store.

### Obligation to Provision Map

| Obligation | Source | Provision |
|:---|:---|:---|
| Select audited events and record the rationale | AU-2 | `litespec/ext/audit#record-the-audit-adoption-decision`, `litespec/ext/audit#declare-audit-selection-on-every-command` |
| Cover the required event categories | AU-2, PCI 10.2.1, ISO 8.15 | `litespec/ext/audit#cover-the-required-audit-categories` |
| Generate records across every component | AU-12 | `litespec/ext/audit#emit-audit-records-at-the-mediation-boundary` |
| State the required record content | AU-3, PCI 10.2.2 | `litespec/ext/audit#record-the-required-audit-fields` |
| Identify the affected resource | AU-3, PCI 10.2.2 | `litespec/ext/audit#record-the-required-audit-fields` |
| Indicate success or failure | AU-3, PCI 10.2.2 | `litespec/ext/audit#record-every-attempt-outcome` |
| Record invalid access attempts | PCI 10.2.1.4, OWASP | `litespec/ext/audit#record-refused-authorization` |
| Record the origination of the event | AU-3, PCI 10.2.2, ISO 8.15 | `litespec/ext/audit#record-the-request-origin` |
| Record credential and privilege change | PCI 10.2.1.5, ISO 8.15 | `litespec/ext/audit#cover-the-required-audit-categories` |
| Record access to the audit records | PCI 10.2.1.3 | `litespec/ext/audit#audit-reads-of-the-trail` |
| Record sensitive data access and export | OWASP, GDPR Art. 30 | `litespec/ext/audit#record-personal-data-reads`, `litespec/ext/audit#record-bulk-export` |
| Exclude secrets and payment data | OWASP, PCI | `litespec/ext/audit#exclude-secrets-and-payment-data` |
| Exclude sensitive personal data | OWASP, GDPR Art. 17 | `litespec/ext/audit#exclude-personal-data-beyond-actor-identity` |
| Protect records from change and deletion | AU-9, ISO 8.15, GDPR Art. 32 | `litespec/ext/audit#enforce-append-only-through-storage-privilege`, `litespec/ext/audit#provide-tamper-evidence` |
| Retain for a defined period | AU-11 | `litespec/ext/audit#retain-each-category-for-its-declared-period` |
| Satisfy erasure without destroying evidence | GDPR Art. 17 | `litespec/ext/audit#remove-the-identity-mapping-on-erasure` |
| Review and analyze the records | AU-6, ISO 8.15 | `litespec/ext/audit#give-the-trail-a-read-path` |

## Notes

The sources behind every table above:

- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001)
- [PCI DSS](https://www.pcisecuritystandards.org/litespec/pci-dss/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [DMTF Cloud Auditing Data Federation](https://www.dmtf.org/litespec/cadf)
- [Open Cybersecurity Schema Framework](https://github.com/ocsf/ocsf-schema)
- [Erasure rights against audit retention](https://axiom.co/blog/the-right-to-be-forgotten-vs-audit-trail-mandates)
