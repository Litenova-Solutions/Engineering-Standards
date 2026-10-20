# React Components

## Intent

Components in a React frontend are function components with typed boundaries. The shared provisions live on the stack-neutral page ([Frontend components](../../components.md)); this page holds what React alone requires.

## Agent Summary {#agent-summary}

- Components are function components using hooks. (litespec/frontend/web/react/components#write-components-as-functions)
- Components type their props and events under strict mode. (litespec/frontend/web/react/components#keep-component-boundaries-typed)

## Standards

### Write components as functions

**Requirement:** A component MUST be a function component using hooks, not a class component.

**Rationale:** Hooks are the reactivity model the renderer understands, so class lifecycle methods fall out of every component. An effect covers what derivation cannot express.

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

**Requirement:** A component MUST type its props and its events under strict mode.

**Rationale:** An untyped prop fails at the call site the next author writes, which is the most expensive place to learn a shape. Strict mode turns that failure into a build error.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/react/components#write-components-as-functions | guidance | Is every component a function component using hooks? |
| litespec/frontend/web/react/components#keep-component-boundaries-typed | checkable | `pnpm type-check` runs under strict mode and fails on an untyped prop or event. |
