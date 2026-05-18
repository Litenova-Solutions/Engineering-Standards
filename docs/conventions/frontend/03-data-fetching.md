# Data Fetching Conventions

This file will contain the data fetching conventions for all frontend projects once the frontend stack is standardized. It covers how to fetch data from the backend API using Next.js 15 App Router patterns, including Server Components, Route Handlers, and client-side fetching.

This file is intentionally incomplete. Frontend conventions will be added in a future release. Pin to a version tag that includes these files before relying on them in a project.

## Sections That Will Be Present When Complete

- **Server Component Data Fetching:** How to fetch data directly in Server Components using `async/await`. When to fetch at the page level vs. the component level. Waterfall vs. parallel fetch patterns.
- **Caching and Revalidation:** Next.js `fetch` cache options (`force-cache`, `no-store`, `revalidate`), tag-based revalidation, and when to use `unstable_cache` for non-fetch data sources.
- **Route Handlers:** When to use Route Handlers (`app/api/`) and when to fetch directly from the backend in Server Components. Rules for authenticated Route Handlers.
- **Client-Side Fetching:** When client-side fetching is necessary (real-time data, user-triggered refreshes). The approved fetch abstraction and error handling pattern.
- **API Client Layer:** Structure of the typed API client, how it maps to backend endpoints, and how backend response types are shared or mirrored in the frontend.
- **Loading States:** Conventions for `loading.tsx` Suspense boundaries, skeleton components, and streaming patterns.
- **Error Handling:** How HTTP errors (400, 404, 409, 500) from the backend are caught, mapped to UI states, and surfaced to users.
- **Authentication Token Propagation:** How the authentication token is attached to server-side fetch requests when making authenticated calls to the backend API.
