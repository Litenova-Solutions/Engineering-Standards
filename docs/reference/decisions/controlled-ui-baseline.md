# Controlled React web UI baseline

Status: Accepted for standards v1.10.0

## Decision

New React web frontends use shadcn/ui with Base UI, Tailwind CSS v4, the Vega visual style, CSS
variables, neutral tokens, Geist, Lucide, the preset radius, and the built-in shadcn registry. Each
frontend owns the generated source. React Native remains a separate platform decision.

## Reproducible input

The reference output was generated and inspected with the manifest-pinned CLI:

```text
pnpm dlx shadcn@4.16.2 init --template next --base base --preset bIkf1RQ \
  --css-variables --no-rtl --no-monorepo --yes
pnpm dlx shadcn@4.16.2 preset decode bIkf1RQ
```

The preset decodes to these values, confirmed by `preset decode`:

| Field | Value |
|:---|:---|
| style | `vega` |
| baseColor | `neutral` |
| theme | `neutral` |
| chartColor | `neutral` |
| font | `geist` |
| fontHeading | `inherit` |
| iconLibrary | `lucide` |
| radius | `default` |
| menuAccent | `subtle` |
| menuColor | `default` |

The canonical JSON fingerprint is:

```text
sha256:87311f8e21348d5c467843284cbf4bbb75a34d383c6ed900c0c8e5c2539eadb0
```

The CLI writes `base-vega` to `components.json` because the component base is encoded in the style
name. The generated configuration also sets `rsc: true`, `tsx: true`, `rtl: false`, an empty registry
map, Lucide icons, and the standard aliases for components, utilities, UI, libraries, and hooks.

## Direct initialization dependencies

The reference initialization added these direct packages. Versions in the standards manifest are the
authority:

- `@base-ui/react`;
- `class-variance-authority`;
- `clsx`;
- `lucide-react`;
- `next-themes`;
- `shadcn`;
- `tailwind-merge`;
- `tw-animate-css`.

`shadcn` stays a runtime dependency rather than a tool-only dependency because the generated global CSS
imports `shadcn/tailwind.css`. The initialization also adds `prettier` and `prettier-plugin-tailwindcss`
as development dependencies. Both are pinned because `ui-source-lock.json` normalizes source with the
project formatter before hashing, so an unpinned formatter would let two consumers compute different
digests for identical source.

Framework, React, TypeScript, and Tailwind versions are resolved from the same manifest. A component
installation may add another direct package only after `DEP.APPROVAL.001` and a manifest pin.

The `base-vega` registry index declares `class-variance-authority`, `lucide-react`, and `@base-ui/react`
as its dependency set, and every manifest npm pin was confirmed published. A source-lock entry records the
direct dependencies of that component rather than the whole style set; the generated `button` source
imports `@base-ui/react` and `class-variance-authority` only.

## Maintenance boundary

The reference output is a baseline, not a shared runtime package. A consumer commits its own
`components.json`, installed source, global CSS entry, vocabulary, and source lock. A source change is
classified and evidenced under `UI.FORKS.001`. A new preset code is a visual-system migration and
requires a new decision, decoded values, fingerprint, affected-state matrix, and visual review.
