# Audit Obligations

This page records the external obligations that the [audit extension](../ext/audit.md) satisfies. It is informative. The extension page owns every provision.

`EXT.AUDIT.ADOPT.001` requires an adoption decision. `EXT.AUDIT.COVERAGE.001` requires a stated selection of audited categories. Both ask a project to say why it audits what it audits. This page is the source those answers draw on, so a project records a decision rather than a survey.

## The frameworks

Four bodies of guidance apply to a business application that holds personal data or touches payments. They agree far more than they differ. An implementation built to their union satisfies each one without a separate programme.

### NIST SP 800-53, AU family

The AU controls split auditing into six questions. They are the most complete public statement of the problem.

| Control | Obligation |
|:---|:---|
| AU-2 | Select the audited event types and record the rationale for each. |
| AU-3 | State event type, time, location, source, outcome, and associated identities. |
| AU-6 | Review and analyze the records. |
| AU-9 | Protect the records from unauthorized change and deletion. |
| AU-11 | Retain records for a defined period. |
| AU-12 | Generate records across every component in scope. |

AU-3 is the field list that the other frameworks restate. AU-2 is the control most projects skip, because an implicit selection needs no document.

### ISO/IEC 27001:2022, Annex A 8.15

Control A.8.15 requires logs of user activities, exceptions, faults, and security events. It requires protection from tampering and unauthorized access. It also requires analysis, which makes an unread trail a finding rather than a control.

### PCI DSS 4.0, Requirement 10

Requirement 10.2.2 names the fields for each event. They are user identification, event type, date and time, success or failure indication, origination, and affected resource identity.

Requirement 10.2.1 names the events. It includes individual access to cardholder data, actions by administrative accounts, access to the audit records, invalid logical access attempts, and changes to authentication credentials.

The success-or-failure field and the invalid-attempt event are the two obligations that a success-only trail fails.

### OWASP Logging Cheat Sheet

The OWASP guidance adds the developer-facing half. Record authentication successes and failures, authorization failures, higher-risk actions, sensitive data access, and data import or export.

It also states the exclusions. Never record passwords, session identifiers, access tokens, encryption keys, database connection strings, payment card data, or sensitive personal data.

## GDPR

The General Data Protection Regulation pulls in two directions at once. Reading it as only a constraint produces a thin trail. Reading it as only a mandate produces an erasure problem.

| Article | Effect on the trail |
|:---|:---|
| Article 5(2) | Accountability requires demonstrating lawful processing, which the trail evidences. |
| Article 30 | Records of processing activities need evidence of who accessed personal data. |
| Article 32 | Security of processing covers the integrity and availability of the trail. |
| Article 17 | Erasure applies to the personal data a record holds. |
| Article 15 | Subject access can reach audit records naming that person. |

The resolution is the record shape. A trail retained on a legal-obligation or legitimate-interest basis stays lawful, and a supervisory authority accepts it. A trail that copies names, addresses, message bodies, or state snapshots into an append-only store conflicts with Article 17. No retention policy resolves that conflict.

`EXT.AUDIT.CLASSIFICATION.002` and `EXT.AUDIT.CLASSIFICATION.003` prevent that conflict at design time. `EXT.AUDIT.PURGE.002` then satisfies an erasure request by removing the mapping from actor identifier to person. The record keeps its evidential value and the person stops being identifiable from it.

Two consequences follow for a project. Record the lawful basis and the retention period of each audited category in the adoption decision. Include the trail in the records of processing activities, because it is itself a processing activity.

## Schema alignment

The record shape follows a model that three sources describe in the same terms. An initiator performs an action on a target, producing an outcome, observed at a time and from a place.

| Source | Contribution |
|:---|:---|
| DMTF CADF, DSP0262 | Initiator, action, target, outcome, and observer event model. |
| NIST AU-3 | The required content of one record. |
| OCSF | Vendor-neutral schema for shipping records to a security platform. |

Building to that model costs nothing at design time. It lets a project map the trail onto a security platform later without remodelling the store.

## Obligation to provision map

| Obligation | Source | Provision |
|:---|:---|:---|
| Select audited events and record the rationale | AU-2 | `EXT.AUDIT.ADOPT.001`, `EXT.AUDIT.ADOPT.002` |
| Cover the required event categories | AU-2, PCI 10.2.1, ISO 8.15 | `EXT.AUDIT.COVERAGE.001` |
| Generate records across every component | AU-12 | `EXT.AUDIT.BOUNDARY.001` |
| State the required record content | AU-3, PCI 10.2.2 | `EXT.AUDIT.RECORD.001` |
| Identify the affected resource | AU-3, PCI 10.2.2 | `EXT.AUDIT.RECORD.001` |
| Indicate success or failure | AU-3, PCI 10.2.2 | `EXT.AUDIT.STATUS.001` |
| Record invalid access attempts | PCI 10.2.1.4, OWASP | `EXT.AUDIT.STATUS.002` |
| Record the origination of the event | AU-3, PCI 10.2.2, ISO 8.15 | `EXT.AUDIT.CONTEXT.001` |
| Record credential and privilege change | PCI 10.2.1.5, ISO 8.15 | `EXT.AUDIT.COVERAGE.001` |
| Record access to the audit records | PCI 10.2.1.3 | `EXT.AUDIT.ACCESS.002` |
| Record sensitive data access and export | OWASP, GDPR Art. 30 | `EXT.AUDIT.READ.001`, `EXT.AUDIT.EXPORT.001` |
| Exclude secrets and payment data | OWASP, PCI | `EXT.AUDIT.CLASSIFICATION.001` |
| Exclude sensitive personal data | OWASP, GDPR Art. 17 | `EXT.AUDIT.CLASSIFICATION.002` |
| Protect records from change and deletion | AU-9, ISO 8.15, GDPR Art. 32 | `EXT.AUDIT.PROTECTION.001`, `EXT.AUDIT.PROTECTION.002` |
| Retain for a defined period | AU-11 | `EXT.AUDIT.PURGE.001` |
| Satisfy erasure without destroying evidence | GDPR Art. 17 | `EXT.AUDIT.PURGE.002` |
| Review and analyze the records | AU-6, ISO 8.15 | `EXT.AUDIT.ACCESS.001` |

## Sources

- [NIST SP 800-53 Rev. 5, AU family](https://csf.tools/reference/nist-sp-800-53/r5/au/)
- [ISO/IEC 27001:2022 Annex A 8.15 implementation guidance](https://www.isms.online/iso-27001/annex-a-2022/how-to-implement-iso-27001-2022-annex-a-control-8-15-logging/)
- [PCI DSS 4.0 Requirement 10](https://www.herodevs.com/blog-posts/pci-dss-4-0-requirement-10-how-to-log-and-monitor-all-access-to-system-components-and-cardholder-data)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [DMTF Cloud Auditing Data Federation](https://www.dmtf.org/standards/cadf)
- [Open Cybersecurity Schema Framework](https://github.com/ocsf/ocsf-schema)
- [Erasure rights against audit retention](https://axiom.co/blog/the-right-to-be-forgotten-vs-audit-trail-mandates)
