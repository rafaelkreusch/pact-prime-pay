type HttpJsonOptions = {
  method?: "GET" | "POST" | "PATCH";
  headers?: HeadersInit;
  body?: unknown;
};

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export async function fetchJson<T>(url: string, options: HttpJsonOptions = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body == null ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, response.status, payload ?? text);
  }

  return payload as T;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
