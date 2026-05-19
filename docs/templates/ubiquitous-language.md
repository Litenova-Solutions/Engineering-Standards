# Ubiquitous Language Glossary

> Copy this file into `docs/domain/ubiquitous-language.md` in your project repository and fill it in. Update it whenever a stakeholder conversation introduces a new term or changes the meaning of an existing one.

---

This file defines the key terms of the bounded context so that all engineers and agents use consistent language. Without it, the same concept gets different names in different files, which erodes the domain model over time. A `Post` in one handler becomes an `Article` in another, and a `Customer` becomes a `User` three layers down. This file is the single source of truth for terminology.

Define every term that a new engineer might confuse, misname, or use inconsistently. Include terms from stakeholder conversations and product documentation, not only technical terms. When a term has a common synonym that MUST NOT be used in code, list the synonym in the "Do Not Use" column.

---

## Term Glossary

| Term | Definition | Maps To | Do Not Use |
|:---|:---|:---|:---|
| Post | A piece of content created by an author that can be in draft, published, or archived state. | `Post` aggregate | Article, Content, Entry |
| Author | A registered user who has been granted the ability to create and publish posts. | `Author` aggregate | Writer, Creator, User |
| Tag | A keyword associated with a post for categorization. A post may have up to 10 tags. | `PostTag` value object on `Post` | Category, Label, Topic |

---

## Bounded Context Relationships

When this domain interacts with another domain, it may reference that domain's concepts under a local alias. This table documents those aliases so that cross-domain references in code use the correct local name.

| External Concept | Local Alias |
|:---|:---|
| _(example) Identity.UserId_ | _(example) AuthorId_ |
| _(example) Billing.SubscriptionId_ | _(example) SubscriptionId (same name, no alias needed)_ |
