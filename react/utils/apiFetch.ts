import { getSession } from '@/services/session';

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
};

export async function apiFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, cache = 'default' } = options;

  console.log('apiFetch called with:', { url, method, headers, body, cache });
  try {
    const session = await getSession();
    const isFormData = body instanceof FormData;
    const sessionHeaders = {
      Authorization: `Bearer ${session?.access_token}`,
      ...headers,
    };
    const finalHeaders = isFormData
      ? sessionHeaders
      : {
          'Content-Type': 'application/json',
          ...sessionHeaders,
        };

    const bodyToSend = isFormData
      ? (body as FormData)
      : body
        ? JSON.stringify(body)
        : undefined;

    console.log('Fetching:', method, url);
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: bodyToSend,
      cache,
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    console.log('Response status:', res.status, 'for', method, url);
    if (!res.status.toString().startsWith('2')) {
      const json = await res.json();
      const errorMessage = isJson ? json.message : null;
      const message = isJson ? json.error : null;

      return {
        success: false,
        error: `${errorMessage || message || 'unknown error'}`,
        status: res.status,
      };
    }

    const data = isJson ? await res.json() : await res.text();

    return { success: true, data };
  } catch (err) {
    let message = 'Network error';

    console.error('apiFetch error:', err);
    if (err instanceof Error) {
      message = err.message;
    }

    return {
      success: false,
      error: `${message}`,
    };
  }
}
