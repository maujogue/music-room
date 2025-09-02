export type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string>;
    body?: unknown;
    cache?: RequestCache;
  };

export async function apiFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      cache = "default",
    } = options;

    try {
      const isFormData = body instanceof FormData;
      const finalHeaders = isFormData
        ? headers
        : {
            "Content-Type": "application/json",
            ...headers,
          };

      const bodyToSend = isFormData
          ? (body as FormData)
          : body
            ? JSON.stringify(body)
            : undefined;

      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        credentials: "include",
        body: bodyToSend,
        cache,
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (!res.ok) {
        const json = await res.json();
        const errorMessage = isJson ? json.message : null;
        const message = isJson ? json.error : null;

        return {
          success: false,
          error: `${errorMessage || message || "unknown error"}`,
          status: res.status
        }

      }

      const data = isJson ? await res.json() : await res.text();

      return { success: true, data };
    } catch (err) {
      let message = "Network error";

      if (err instanceof Error) {
        message = err.message;
      }

      return {
        success: false,
        error: `${message}`,
      };
    }
  }
