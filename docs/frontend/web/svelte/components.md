# Svelte Components

## Intent

A Svelte component holds its state in runes, with props from `$props` and derived values from `$derived`. This page states what Svelte alone adds: runes-mode components with typed props, events, and snippets; the shared component principles live in [Frontend Components](../../components.md). A team that applies it while writing components keeps state, derivation, and boundaries compile-checked under strict mode.

## Standards

### Write Components in Runes Mode

**Statement:** A component MUST hold its local state in runes, with props from `$props` and derived values from `$derived`.

**Rationale:** Runes are the reactivity model the compiler understands: `$state` for local state, `$props` for inputs, and `$derived` for computed values. Legacy reactive statements and untyped prop access bypass that model and behave differently under the compiler. An effect covers what derivation cannot express, so nothing needs the legacy forms.

**Example:**

```svelte
<script lang="ts">
  let { orderId }: { orderId: string } = $props();
  let quantity = $state(1);
  let unitPrice = $state(0);
  let total = $derived(quantity * unitPrice);
</script>
```

### Keep Component Boundaries Typed

**Statement:** A component MUST type its props, its events, and its snippets under strict mode.

**Rationale:** An untyped prop fails at the call site the next author writes, which is the most expensive place to learn a shape: after writing the code that uses it. Strict mode turns that failure into a build error at the author's own call. Typed events and snippets do the same for what the component reports and what it lets callers fill in.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/svelte/components#write-components-in-runes-mode | checkable | `svelte-check` fails on a legacy reactive statement or an untyped `$props` call. |
| litespec/frontend/web/svelte/components#keep-component-boundaries-typed | checkable | `svelte-check` runs under strict mode and fails on an untyped prop, event, or snippet. |
