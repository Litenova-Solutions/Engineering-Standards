// Vendored openapi-fetch source. See docs/decisions/openapi-typescript-client-generation.md.
// Copy the current openapi-fetch src/index.ts and src/types.ts from the upstream release
// when bootstrapping a new project. Do not install openapi-fetch from npm.

export { default, createClient } from "./client"
export type * from "./types"
