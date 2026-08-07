# Upgrade the frontend UI governance standard

The frontend UI governance standard adds `UI.GOVERNANCE.001` as a general rule. It does not prescribe
Tamagui, shadcn/ui, React Native Paper, or another library. Each frontend surface chooses the system
that fits its platforms and records that choice, its public primitive boundary, and its theme-token
contract.

## Record the UI system and boundary

Add a decision for every frontend surface that names:

- the primary component and styling system;
- the owning package or source directory for vendor imports and primitives;
- the documented public exports available to feature and route code;
- the theme tokens and declared variants used for visual changes;
- the platforms covered by the system and any approved supporting accessibility utilities.

Platform-native controls and a headless or unstyled accessibility library may support the primary system,
but each must remain inside an owned wrapper or documented exception. Do not introduce a second visual
system without a decision that names the affected rule.

## Move feature code to approved primitives

Search the approved primitive inventory before adding a control. Replace local buttons, fields, dialogs,
cards, and icon wrappers that duplicate an approved export. Change feature imports to documented public
exports and remove imports from vendor internals or package-internal paths.

Add a primitive only when the existing inventory cannot provide the required behavior. Put it in the
owning UI boundary, give it a narrow typed API, use declared theme tokens and variants, document its use,
and add keyboard, focus, labeling, state, responsive, and accessibility evidence.

## Add enforceable checks

Add the checks that fit the repository, such as:

- an AST or lint rule that limits direct vendor imports to the owning UI boundary;
- an import rule that rejects package-internal paths from features and routes;
- a review or static check for duplicate primitives and unexplained raw visual values;
- component, browser, and accessibility tests for every new primitive.

## Verify

Run the frontend lint, type, component, browser, and accessibility checks. Confirm that each frontend
surface has one documented primary UI system and that new primitives have a public export, token-based
variants, and test evidence.

