// This file is generated from the published OpenAPI document. Do not edit it by hand.

export type RequestResult<TData, TError, ThrowOnError extends boolean> = ThrowOnError extends true
  ? Promise<TData>
  : Promise<{ data?: TData; error?: TError; response: Response }>;

export type Client = {
  get<TData, TError, ThrowOnError extends boolean>(options: { url: string } & Record<string, unknown>): RequestResult<TData, TError, ThrowOnError>;
  post<TData, TError, ThrowOnError extends boolean>(options: { url: string } & Record<string, unknown>): RequestResult<TData, TError, ThrowOnError>;
};

export type Options<TData, ThrowOnError extends boolean> = Partial<TData> & {
  client?: Client;
  throwOnError?: ThrowOnError;
};

async function send(method: string, options: { url: string; body?: unknown; throwOnError?: boolean }) {
  const response = await fetch(options.url, {
    method,
    headers: options.body === undefined ? undefined : { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = response.headers.get("content-type")?.includes("json") ? await response.json() : undefined;
  if (options.throwOnError && !response.ok) {
    throw payload;
  }
  return options.throwOnError ? payload : response.ok ? { data: payload, response } : { error: payload, response };
}

export const client: Client = {
  get: (options) => send("GET", options) as never,
  post: (options) => send("POST", options) as never,
};
