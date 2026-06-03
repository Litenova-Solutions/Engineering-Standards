// Placeholder: replace with vendored openapi-fetch implementation (~500 lines).
// The createClient factory MUST accept paths from @myproject/api-types.

export type ClientMethod = "get" | "post" | "put" | "patch" | "delete"

export interface Client {
  GET: (path: string, init?: RequestInit) => Promise<{ data?: unknown; error?: unknown }>
  POST: (path: string, init?: RequestInit) => Promise<{ data?: unknown; error?: unknown }>
}

export default function createClient<_Paths>(options: { baseUrl: string }): Client {
  const baseUrl = options.baseUrl.replace(/\/$/, "")

  async function request(method: string, path: string, init?: RequestInit) {
    const response = await fetch(`${baseUrl}${path}`, { ...init, method })
    const data = response.ok ? await response.json().catch(() => undefined) : undefined
    const error = response.ok ? undefined : await response.json().catch(() => ({ status: response.status }))
    return { data, error }
  }

  return {
    GET: (path, init) => request("GET", path, init),
    POST: (path, init) => request("POST", path, init),
  }
}
