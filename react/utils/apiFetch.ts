import { getSession } from '@/services/session';
import { getDeviceInfo } from '@/utils/deviceInfo';

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

  try {
    const session = await getSession();

    // Get device info and add as headers
    const deviceInfo = getDeviceInfo();

    const isFormData = body instanceof FormData;
    const sessionHeaders = {
      Authorization: `Bearer ${session?.access_token}`,
      'X-App-Platform': deviceInfo.platform,
      'X-App-Device': deviceInfo.deviceModel,
      'X-App-OS-Version': deviceInfo.osVersion,
      'X-App-Version': deviceInfo.appVersion,
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

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: bodyToSend,
      cache,
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!res.status.toString().startsWith('2')) {
      const json = await res.json();
      const errorMessage = isJson ? json.message : null;
      const message = isJson ? json.error : null;

      return {
        success: false,
        error: {
          message: `${errorMessage || message || 'unknown error'}`,
          status: res.status,
        },
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
      error: {
        message: `${message}`,
        status: undefined,
      },
    };
  }
}
