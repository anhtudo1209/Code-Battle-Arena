import { post } from "./httpClient";

export function login({ username, password }) {
  return post("/auth/login", { username, password });
}

export function register({ username, email, password }) {
  return post("/auth/register", { username, email, password });
}

export function oauthLogin({ provider, provider_user_id, email, username }) {
  return post("/auth/oauth-login", {
    provider,
    provider_user_id,
    email,
    username
  });
}

export function refreshToken(refreshToken) {
  return post("/auth/refresh", { refreshToken });
}

export function logout(refreshToken) {
  return post("/auth/logout", { refreshToken });
}

export default { login, register, refreshToken, logout };


