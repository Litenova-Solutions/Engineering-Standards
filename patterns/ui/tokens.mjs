/**
 * The theme, copied from `packages/ui/src/styles/tokens.css`.
 *
 * The library draws in semantic tokens on the shadcn neutral base, so a
 * reviewer compares a mock against the shipped dashboard and the colours match.
 * Values are verbatim; do not hand-tune one. A value that is not a token below
 * belongs in the mock as a documented divergence, not as a new token.
 */
export const TOKENS = /* css */ `
:root {
  /* Baseline, copied value for value from shadcn's neutral base colour. */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  /* Overridden: 4.3:1 on --muted is under WCAG SC 1.4.3's 4.5:1. */
  --muted-foreground: oklch(0.439 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  /* Overridden: the baseline red is 4.0:1 on its own 10% tint. */
  --destructive: oklch(0.505 0.213 27.518);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  /* Overridden: 2.6:1 on white is under WCAG SC 1.4.11's 3:1 for a focus ring. */
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  color-scheme: light dark;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.556 0 0);

  /* Local extensions: the four tone families and the scroll shade. */
  --destructive-foreground: oklch(0.985 0 0);
  --destructive-surface: oklch(0.971 0.013 17.38);
  --destructive-surface-foreground: oklch(0.444 0.177 26.899);
  --positive: oklch(0.5 0.145 163.225);
  --positive-surface: oklch(0.95 0.052 163.051);
  --positive-surface-foreground: oklch(0.432 0.095 166.913);
  --caution: oklch(0.666 0.179 58.318);
  --caution-surface: oklch(0.962 0.059 95.617);
  --caution-surface-foreground: oklch(0.473 0.137 46.201);
  --info: oklch(0.588 0.158 241.966);
  --info-surface: oklch(0.951 0.026 236.824);
  --info-surface-foreground: oklch(0.391 0.09 240.876);
  --scroll-shade: oklch(0 0 0 / 0.16);

  /* An accent brand colour, used only by the viewer's own frame. */
  --brand-gold: oklch(0.77 0.14 85);
  --brand-ink: oklch(0.19 0.02 70);

  /* Type scale. Geist is not embedded, so the stack stands in for it. */
  --font-sans: "Segoe UI Variable Text", "Segoe UI", -apple-system, BlinkMacSystemFont,
    Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Cascadia Code", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);

  --destructive-foreground: oklch(0.205 0 0);
  --destructive-surface: oklch(0.258 0.092 26.042);
  --destructive-surface-foreground: oklch(0.885 0.062 18.334);
  --positive: oklch(0.765 0.177 163.223);
  --positive-surface: oklch(0.262 0.051 172.552);
  --positive-surface-foreground: oklch(0.845 0.143 164.978);
  --caution: oklch(0.828 0.189 84.429);
  --caution-surface: oklch(0.279 0.077 45.635);
  --caution-surface-foreground: oklch(0.879 0.169 91.605);
  --info: oklch(0.746 0.16 232.661);
  --info-surface: oklch(0.293 0.066 243.157);
  --info-surface-foreground: oklch(0.901 0.058 230.902);
  --scroll-shade: oklch(0 0 0 / 0.55);
}
`;
