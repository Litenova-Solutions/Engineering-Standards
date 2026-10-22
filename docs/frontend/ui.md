# Controlled UI Governance

## Intent

The shared UI package is a constrained construction language: the ready-made controls, the interaction behavior, the page layouts, and the named visual values every screen draws with. This page states how the workspace governs that language: the visual authority, the design contract, the floorplan set, and the route suite that proves every route. Frontend teams and agents apply it whenever they add or change a screen, a component, or a named value, so every page of one kind looks and behaves as one page.

## Concepts

### Approve Each Decision Once

A person approves each design decision once, where the decision is made: the token set, each composite, each pattern option, and each floorplan. The route suite and the stack lint enforce each approved decision on every route, so a route inside the contract needs no review of its own.

### The Floorplan Set

A floorplan is a page component that fixes one page layout and exposes named slots for the domain to fill. The shared package holds the closed set, and a route composes exactly one of them. A closed set lets an author choose a known shape by rule rather than invent a layout. Each floorplan implements the chosen option of one page-frame pattern from the pattern catalog ([UI patterns](patterns.md)).

The reference set holds one floorplan per reader task. A workspace declares the ones its routes need, and each carries the rule for choosing it.

| Floorplan | Choose it when the reader | Slots it carries |
|:---|:---|:---|
| `WorkPage` | Processes items one after another | The queue, the current item, and its actions |
| `ListPage` | Finds one record among many | Filters, the result count, and the rows |
| `EntityPage` | Acts on one record | Facts, state, the actions that state permits, and related records |
| `FormPage` | Supplies the input of one command | The fields, one primary action, and the refusals |
| `OutcomePage` | Receives one answer after an action | The answer and the next step |

The domain fills the slots, so a floorplan invents no state, action, or refusal.

| Slot | Domain source |
|:---|:---|
| Status | The aggregate states named in the specification |
| Actions | The use cases the current state permits |
| Refusals | The refusal results of the use case the route calls |

A floorplan exposes its name on its frame. A reviewer and the route suite read that name to learn which floorplan a route composes.

### The Tone Set

A tone names what a state means. The set is closed: a page picks one of them rather than a color.

| Tone | The state it means |
|:---|:---|
| `neutral` | Nothing is wrong and nothing is asked for |
| `positive` | The thing asked for happened |
| `caution` | A person has to decide |
| `destructive` | The thing asked for is refused |
| `info` | The page is explaining rather than reporting |

The mapping from a state code to a tone lives in one table in each application. A reader then sees the same color for the same state on every screen.

### The Command Surface

A command's surface follows the size of its input. A larger surface than the command needs costs the reader attention it has no use for.

| The command takes | Surface |
|:---|:---|
| Nothing, reversible | A button |
| Nothing, irreversible | A confirmation dialog |
| One to four inputs | A form dialog |
| More than four inputs | A form page |

### The Route Suite

The route suite is one specification per frontend that visits every route. It asserts the checks below, and a visual snapshot supplements an assertion without replacing one. A snapshot varies across platforms, fonts, and hardware, so an assertion is the gate.

| Check | What the suite asserts |
|:---|:---|
| Floorplan | The route composes exactly one floorplan |
| Reference | The route names its reference or is a recorded freestyle route |
| Accessibility | The WCAG 2.2 AA check reports zero violations |
| Heading | The route carries exactly one top-level heading |
| Landmark | The route carries one main content region |
| Reflow | At 320 pixels the route shows no clipped content; a data table scrolls inside its region |
| Text spacing | The route still shows no clipped content under the WCAG text-spacing override |
| Keyboard | Every interactive element is reachable and shows a visible focus indicator |
| Announcements | Asynchronous status changes announce through the platform live region |

The suite discovers its routes from the application route definition rather than from a list. A new route is therefore checked with no new specification. A dynamic segment resolves to a record the deployment holds, and falls back to an absent record when it holds none.

### Result Proof

A route calls use cases, and each use case declares its results. A test proves each result as [Frontend Testing](testing.md) states; proof follows the route code, so the calls a route makes name the results that need proof. Every result a route calls is therefore proved by a passing test, or named by a known-gap record with an owner and an end date.

## Standards

### Select One Visual Authority

**Statement:** A workspace MUST record one shared UI package in `litespec.project.json`.

**Rationale:** Two general-purpose visual systems in one workspace make every component choice ambiguous: each screen picks its source, and the product ships two looks. Recording one shared UI package in `litespec.project.json` settles the source for every controlled frontend. A frontend outside the contract declares another platform and says what replaces the contract.

### Pin the Baseline in the Shared Package

**Statement:** A workspace MUST install the pinned baseline from `litespec.manifest.json` once, into its shared UI package.

**Rationale:** The baseline installed once in the shared UI package gives every application the same primitives at the same pinned version. Installing per application makes a copy per application, and each copy drifts on its own update schedule with nothing reporting the split. An additional baseline source is permitted only under a deviation recorded against this provision.

### Publish a Design Contract

**Statement:** A workspace MUST publish one design contract with its shared UI package, carrying the required sections: Brand, Tokens, Vocabulary, Patterns, Do, Do not, Motion, Voice.

**Rationale:** An author that has read no contract picks their own tokens, motion, and voice for each page. The picks differ on the next page, and the reader sees the difference as clutter: same product, different looks. One design contract published with the shared UI package keeps every answer in one file, with the required sections Brand, Tokens, Vocabulary, Patterns, Do, Do not, Motion, Voice.

**Example:** The metadata block names the package and the floorplans it provides.

```json
{
  "kind": "design-contract",
  "schemaVersion": 1,
  "package": "@acme/ui",
  "profile": "application-balanced",
  "shell": "app-shell",
  "patterns": ["work-page", "list-page", "entity-page"]
}
```

### Declare a Closed Floorplan Set

**Statement:** The `Patterns` section of the design contract MUST list every floorplan the package provides, each with a when-to-use rule.

**Rationale:** A floorplan with no when-to-use rule leaves the choice to resemblance: two authors pick different floorplans for one kind of page, and the kind ships in two layouts. Listing every floorplan with its rule in the design contract's Patterns section makes the choice mechanical. A floorplan outside the list is a design decision for the package, not a route-level choice.

**Example:** The section states each floorplan and the question that selects it.

```markdown
## Patterns

| Floorplan | Component | Use it when the reader |
|:---|:---|:---|
| `list-page` | `ListPage` | Finds one record among many. The page shows the result count. |
| `entity-page` | `EntityPage` | Acts on one record: its facts, its state, and the actions that state permits. |
| `form-page` | `FormPage` | Supplies the input of one command, with one primary action. |
```

### Compose Each Route from One Floorplan

**Statement:** A route MUST render exactly one floorplan from the declared set, unless it is a recorded freestyle route.

**Rationale:** The floorplan fixes the layout, the heading position, and the slots, so a reviewer reads which floorplan a route composes and knows what the page looks like before opening it. The slots take domain values only: the aggregate state, the use cases that state permits, and the refusal results of the called use case. Exactly one floorplan per route keeps each page to one known shape, unless it is a recorded freestyle route.

**Example:** An order route composes the entity floorplan and fills each slot from the order.

### Keep Layout Inside Floorplans

**Statement:** Route code MUST NOT declare layout outside its floorplan and display composites.

**Rationale:** A layout declaration in a route file is a second layout beside the floorplan: the route draws its own spacing while claiming the floorplan's shape. The next route copies the declaration because it looks like the local way to draw, and the floorplan stops describing what routes render. Floorplan and display composites own layout, so one change there reaches every route composing them.

### Record a Freestyle Route

**Statement:** A route that composes no declared floorplan MUST name the decision record that justifies its layout.

**Rationale:** A route that composes no declared floorplan is either the first consumer of a floorplan that does not exist yet or a genuine one-off. Naming the decision record that justifies its layout makes either case reviewable and keeps the declared set closed. A second route of the same shape is the signal to add the floorplan instead of recording another freestyle route.

### Derive Each Page Type from a Named Reference

**Statement:** Every route MUST name its page type's reference, with a freestyle route naming its decision record instead.

**Rationale:** An author with no named reference invents a page from primitives, and the next author invents another page for the same type. Naming the page type's reference keeps every page of one type on the one drawing it derives from, so the type stays one design. A freestyle route names its decision record instead, since it derives from no reference.

### Select a Tone from the Closed Set

**Statement:** A state indicator MUST take one tone from the closed set, each application declaring its state-to-tone mapping once as an exhaustive table of glossary terms.

**Rationale:** A page that picks its own color picks a meaning nobody agreed to: the same red celebrates on one screen and warns on another. One state-to-tone mapping per application, declared once as an exhaustive table of glossary terms, makes the same state read the same way on every screen. A new state fails to compile until its tone and its word exist, so no state ships uncolored or mislabeled.

### Keep Tokens in One Definition

**Statement:** An application MUST use the shared token definition and declare no value, with no literal color in any shipped definition.

**Rationale:** One token definition is what makes two applications look like one product. An application uses the shared definition and declares no value of its own, so no second definition introduces a value the first has no opinion about. A definition the shared package ships declares no literal color, so every value traces to the declared baseline.

### Hold the Declared Base Color

**Statement:** A token definition MUST carry only the values the declared baseline publishes, except under a recorded deviation.

**Rationale:** A token value outside the published ramp is a second palette beside the declared one, and the next author copies the value because it looks approved. Carrying only the values the declared baseline publishes keeps the palette to what the baseline designed. A recorded deviation keeps a deliberate departure visible in the design contract instead of hidden in the tokens.

### Keep Separators at the Subtle Step

**Statement:** A structural separator or input border MUST NOT be darker than the border step the declared base color publishes.

**Rationale:** A separator darker than its neighbors reads as emphasis, so authors stop trusting the token and start picking weights by eye. The border step the declared base color publishes keeps every structural separator and input border at one weight, so weight carries no accidental meaning.

### Select a Command Surface by Size

**Statement:** A command MUST use the surface the Concepts table assigns to its input.

**Rationale:** The surface fits the input: a button for a reversible action, a confirmation dialog for an irreversible one, a form dialog for one to four inputs, and a form page beyond that. A form dialog with more inputs than the table allows scrolls, loses its title, and hides the refusal beside the field that caused it. An oversized surface for a small command costs the reader attention the command has no use for.

### Show the Trace ID in Error Detail

**Statement:** Every error the user sees MUST show its trace identifier in copyable form in the error detail, from the problem body or the `X-Trace-Id` header.

**Rationale:** Support reads the trace identifier to find the failed request, and the reader copies it from the detail without retyping. Shown in copyable form from the problem body or the `X-Trace-Id` header, it connects the reader's report to the server's logs. The headline carries what happened in words; the identifier belongs in the detail.

### Check Every Route

**Statement:** Every route MUST pass each route suite check.

**Rationale:** The route suite visits every route and asserts each check the Concepts section names: the floorplan, the reference, accessibility, the heading, the landmark, reflow, text spacing, keyboard use, and status announcements. The suite discovers its routes from the application route definition, so a new route is checked with no new specification. Every route passing every check keeps each address inside the contract by default.

### Prove Every Result a Route Calls

**Statement:** Every result a called use case returns MUST be proved by a passing test or a known-gap record with owner and end date.

**Rationale:** A refusal a reader can reach and no test provokes is a refusal nobody sees render: it ships unshown and breaks unnoticed. Proving every result a called use case returns, by a passing test or a known-gap record with owner and end date, ties each reachable outcome to evidence or to named missing work. The calls come from the route code, so the obligation follows the code rather than a declaration.

**Example:** A test calls the use case and asserts one refusal result.

### Restrict Styling to Semantic Tokens

**Statement:** A style MUST use a semantic token rather than a raw value.

**Rationale:** A raw value in a style answers to no token: the theme leaves it unchanged through every restyle, and the next author copies the value instead of the token. The shared package definition is the approved style surface, holding the tokens, the fonts, and the documented resets. A style built from semantic tokens stays inside the product's visual language by construction.

### Govern Behavior Packages

**Statement:** A behavior package MUST name the decision record approving it for the capability it supplies, and render through baseline components and tokens.

**Rationale:** A behavior package adds a capability the baseline lacks, such as a chart or a rich editor, and naming the decision record that approves it for that capability keeps the approval tied to the need. Approval follows the capability rather than the visual catalog, so no package duplicates a component the baseline already provides. Rendering through baseline components and tokens keeps the new capability inside the product's look.

### Prove UI Behavior and Appearance

**Statement:** A primitive, composite, token, source, floorplan, or route change MUST name the evidence in the matrix in this section.

**Rationale:** Each change class carries different risk: a token change reaches every route in every profile, while a primitive change reaches one component. The matrix maps each class to the narrowest evidence that represents its risk, so a change runs the evidence its reach requires and no more.

| Change class | Narrowest evidence |
|:---|:---|
| Primitive or variant | The component test for that primitive |
| Floorplan or display composite | The route suite on one route that composes it |
| Token or global style | The route suite on one route in each profile |
| Route | The route suite on that route, and every test proving a result it calls |
| Pattern decision | The catalog entry changes with its implementation |
| Fork | The fork record and the component test |
| Behavior package | The accessibility check for the capability it supplies |

### Record a Frontend Outside the Controlled Contract

**Statement:** A frontend outside the controlled platforms MUST declare an entry point record naming that platform and the boundaries replacing this contract.

**Rationale:** A device client with no shared component and no router sits outside the floorplan set and the component rules: the contract's checks do not apply to it. Declaring an entry point record that names its platform and the boundaries replacing this contract keeps the decision visible, instead of letting the frontend report as one with nothing to check.

## Conventions

### Use the Product Profiles

**Default:** Select one density profile from `public-light`, `application-balanced`, or `admin-dense` for each controlled frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Density is a property of the audience: `public-light` suits a surface a visitor meets once, `application-balanced` suits a surface a signed-in user works in, and `admin-dense` suits a surface an operator reads all day. All three profiles share one baseline, so choosing per frontend changes density without changing the visual language.

### Keep a Blocked Command Visible with Its Reason

**Default:** Leave a command blocked only by the current state or role visible and disabled, with the reason beside it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A command blocked only by the current state or role stays visible and disabled, with the reason beside it. The reader looking for the action learns it exists and why it is unavailable, such as a missing permission or an unmet precondition. A control that vanishes instead looks like a product that does not offer the action at all.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/ui#select-one-visual-authority | checkable | `litespec consumer` reports controlled frontends with no `paths.uiPackage` in `litespec.project.json`, and `litespec ui` reports `[litespec/frontend/ui#select-one-visual-authority]` for a second general-purpose visual dependency. Run either at the consumer root. |
| litespec/frontend/ui#pin-the-baseline-in-the-shared-package | guidance | The shared UI package installs the pinned manifest baseline once, and applications install none. Look in the shared package manifest and lock, and the application manifests. |
| litespec/frontend/ui#publish-a-design-contract | checkable | `litespec ui` reports `[litespec/frontend/ui#publish-a-design-contract]` for a missing contract, a missing metadata block, a package mismatch, or a missing required section. Run it at the consumer root. |
| litespec/frontend/ui#declare-a-closed-floorplan-set | guidance | The design contract Patterns section lists every floorplan with its when-to-use rule. Look in the design contract. |
| litespec/frontend/ui#compose-each-route-from-one-floorplan | guidance | Routes render exactly one declared floorplan, or record a freestyle decision. Look in the route sources and the suite output reading the floorplan name from each frame. |
| litespec/frontend/ui#keep-layout-inside-floorplans | guidance | Route files declare no layout outside floorplan and display composites. Look in the route sources. |
| litespec/frontend/ui#record-a-freestyle-route | guidance | Freestyle routes name the decision record justifying their layout. Look in the freestyle routes and the decision records. |
| litespec/frontend/ui#derive-each-page-type-from-a-named-reference | guidance | Routes name their page type reference, and freestyle routes name their decision record instead. Look in the route sources. |
| litespec/frontend/ui#select-a-tone-from-the-closed-set | guidance | Applications declare their state-to-tone mapping once as an exhaustive table of glossary terms. Look in the application state mapping. |
| litespec/frontend/ui#keep-tokens-in-one-definition | guidance | Applications use the shared token definition with no declared value and no literal color in shipped definitions. Look in the application and shared token definitions. |
| litespec/frontend/ui#hold-the-declared-base-color | guidance | Token definitions carry only declared baseline values, with each departure recorded as a deviation. Look in the token definitions and the deviation records. |
| litespec/frontend/ui#keep-separators-at-the-subtle-step | guidance | Structural separators and input borders sit at the published border step or lighter. Look in the token definitions and the rendered separators. |
| litespec/frontend/ui#select-a-command-surface-by-size | guidance | Commands use the surface the Concepts table assigns to their input. Look in the command surfaces. |
| litespec/frontend/ui#show-the-trace-id-in-error-detail | guidance | Visible errors show the trace identifier copyably in the detail, from the problem body or the `X-Trace-Id` header. Look in the error surfaces. |
| litespec/frontend/ui#check-every-route | guidance | The route suite output shows every discovered route passing each check. Look in the suite output and the CI job logs. |
| litespec/frontend/ui#prove-every-result-a-route-calls | guidance | Results called from route code are proved by passing tests or named by known-gap records with owner and end date. Look in the route call sites, the test runs, and the known-gap records. |
| litespec/frontend/ui#restrict-styling-to-semantic-tokens | guidance | Styles use semantic tokens rather than raw values. Look in the stylesheets and the shared package definition. |
| litespec/frontend/ui#govern-behavior-packages | guidance | Behavior packages name their approving decision record and render through baseline components and tokens. Look in the package declarations and the decision records. |
| litespec/frontend/ui#prove-ui-behavior-and-appearance | guidance | Changes name the evidence the matrix assigns to their class. Look in the change descriptions and the named evidence. |
| litespec/frontend/ui#record-a-frontend-outside-the-controlled-contract | guidance | Frontends outside the controlled platforms declare an entry point record naming their platform and replacement boundaries. Look in the entry point records. |
| litespec/frontend/ui#use-the-product-profiles | checkable | `litespec ui` reports a controlled frontend with no `ui` block declaring its density profile or a profile outside `public-light`, `application-balanced`, `admin-dense`. Run it at the consumer root. |
| litespec/frontend/ui#keep-a-blocked-command-visible-with-its-reason | guidance | Commands blocked only by state or role stay visible and disabled with the reason beside them. Look in the command surfaces. |
