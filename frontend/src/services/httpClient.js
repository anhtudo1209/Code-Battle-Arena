const BASE_PATH = "/api";

function getAuthToken() {
  return (
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token") ||
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || `Request failed with ${res.status}`;
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

export default { get, post };


