# Svelte Components

## Intent

Components in a Svelte frontend hold state in runes with typed boundaries. The shared provisions live on the stack-neutral page ([Frontend components](../../components.md)); this page holds what Svelte alone requires.

## Agent Summary {#agent-summary}

- Components hold state in runes with typed props. (litespec/frontend/web/svelte/components#write-components-in-runes-mode, litespec/frontend/web/svelte/components#keep-component-boundaries-typed)

## Standards

### Write components in runes mode

**Requirement:** A component MUST hold its local state in runes, with props from `$props` and derived values from `$derived`.

**Rationale:** Runes are the reactivity model the compiler understands, so legacy reactive statements and untyped prop access fall out of every component. An effect covers what derivation cannot express.

**Example:**

```svelte
<script lang="ts">
  let { orderId }: { orderId: string } = $props();
  let quantity = $state(1);
  let unitPrice = $state(0);
  let total = $derived(quantity * unitPrice);
</script>
```

### Keep component boundaries typed

**Requirement:** A component MUST type its props, its events, and its snippets under strict mode.

**Rationale:** An untyped prop fails at the call site the next author writes, which is the most expensive place to learn a shape. Strict mode turns that failure into a build error.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/svelte/components#write-components-in-runes-mode | checkable | `svelte-check` fails on a legacy reactive statement or an untyped `$props` call. |
| litespec/frontend/web/svelte/components#keep-component-boundaries-typed | checkable | `svelte-check` runs under strict mode and fails on an untyped prop, event, or snippet. |
