const BASE_PATH = "/api";

function getAuthToken() {
  return (
    window.localStorage.getItem("accessToken") ||
    window.sessionStorage.getItem("accessToken") ||
    null
  );
}

function getRefreshToken() {
  return (
    window.localStorage.getItem("refreshToken") ||
    window.sessionStorage.getItem("refreshToken") ||
    null
  );
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_PATH}${path}`, {
    ...options,
    headers,
  });
  
  // Try to parse JSON, but handle errors gracefully
  let data = {};
  try {
    const text = await res.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    // If it's not JSON, try to get error message from response
    data = { message: `Invalid response from server (${res.status})` };
  }
  
  if (!res.ok) {
    // If 401 Unauthorized, try to refresh token
    if (res.status === 401 && !options._retry) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${BASE_PATH}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
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
  return data;
}

export function post(path, body, options = {}) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function get(path, options = {}) {
  return request(path, { method: "GET", ...options });
}

export function put(path, body, options = {}) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

export function del(path, options = {}) {
  return request(path, { method: "DELETE", ...options });
}

export default { get, post, put, del };


