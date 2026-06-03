# Internationalization

This document defines the frontend internationalization convention. Use it when a project supports more than one locale or has a credible product requirement to add locales later.

---

## 1. Default Rule

Projects start single-locale unless the product requires localization. Do not add an i18n library without a project ADR.

When localization is enabled, routes include the locale segment:

```text
app/
  [locale]/
    (main)/
      dashboard/
        page.tsx
```

The locale is URL state. Do not store the active locale only in Zustand or local storage.

---

## 2. Message Ownership

Messages live outside components in locale files. Components receive translated strings from a server component parent or a project i18n hook.

```typescript
// GOOD: component receives display text as props
type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}
```

```typescript
// BAD: feature text is hard-coded in a localized component
export function EmptyState() {
  return <p>No tickets found.</p>
}
```

---

## 3. Formatting

Use `Intl` APIs or the project-approved i18n library for dates, numbers, currency, relative time, and pluralization. Do not hand-format localized values with string concatenation.

```typescript
// GOOD: locale-aware formatting
const formatted = new Intl.DateTimeFormat(locale, {
  dateStyle: "medium",
}).format(date)
```

```typescript
// BAD: hard-coded date format
const formatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
```

---

## 4. Backend Contract

APIs return stable machine values, not localized display strings, unless the endpoint is explicitly a presentation endpoint. The frontend localizes labels, enum names, validation summaries, and dates.

Backend validation error codes MUST be stable so the frontend can localize messages when the project requires it.

