# React Components

## Intent

A React component is a function using hooks, with props and events typed under strict mode. This page states what React alone adds: function components built on hooks and typed props and events; the shared component principles live in [Frontend Components](../../components.md). A team that applies it while writing components keeps every boundary compile-checked, so a wrong call fails at build time instead of in the browser.

## Standards

### Write components as functions

**Statement:** A component MUST be a function component using hooks, not a class component.

**Rationale:** Hooks are the reactivity model the renderer understands: state, derivation, and effects all flow through them. Class lifecycle methods split the same logic across mount and update paths that no new code follows. An effect covers what derivation cannot express, so nothing needs a class.

**Example:**

```tsx
function OrderTotal({ orderId }: { orderId: string }) {
  const [quantity, setQuantity] = useState(1);
  const unitPrice = useUnitPrice(orderId);
  const total = quantity * unitPrice;
  return <Price value={total} />;
}
```

### Keep component boundaries typed

**Statement:** A component MUST type its props and its events under strict mode.

**Rationale:** An untyped prop fails at the call site the next author writes, which is the most expensive place to learn a shape: after writing the code that uses it. Strict mode turns that failure into a build error at the author's own call. Typed events do the same for what the component reports.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/react/components#write-components-as-functions | guidance | Is every component a function component using hooks? |
| litespec/frontend/web/react/components#keep-component-boundaries-typed | checkable | `pnpm type-check` runs under strict mode and fails on an untyped prop or event. |
