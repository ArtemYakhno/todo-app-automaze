const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      errorBody.message ?? "Request failed",
      errorBody.errors,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};
