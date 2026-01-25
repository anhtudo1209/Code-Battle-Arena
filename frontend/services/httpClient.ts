const BASE_PATH = "/api";

function getAuthToken(): string | null {
  return (
    window.localStorage.getItem("accessToken") ||
    window.sessionStorage.getItem("accessToken") ||
    null
  );
}

function getRefreshToken(): string | null {
  return (
    window.localStorage.getItem("refreshToken") ||
    window.sessionStorage.getItem("refreshToken") ||
    null
  );
}

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_PATH}${path}`, {
    ...options,
    headers,
  });

  // Try to parse JSON, but handle errors gracefully
  let data: any = {};
  try {
    const text = await res.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    data = { message: `Invalid response from server (${res.status})` };
  }

  if (!res.ok) {
    // If 401 Unauthorized, try to refresh token
    if (res.status === 401 && !options._retry) {
      const refreshTokenValue = getRefreshToken();
      if (refreshTokenValue) {
        try {
          const refreshResponse = await fetch(`${BASE_PATH}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            // Store new tokens
            window.localStorage.setItem("accessToken", refreshData.accessToken);
            window.localStorage.setItem("refreshToken", refreshData.refreshToken);
            // Retry the original request with new token
            return request(path, { ...options, _retry: true });
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    }
    const message =
      data?.message ||
      data?.error ||
      `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export function post<T = any>(path: string, body: any, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function get<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { method: "GET", ...options });
}

export function put<T = any>(path: string, body: any, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

export function del<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { method: "DELETE", ...options });
}

export default { get, post, put, del };
