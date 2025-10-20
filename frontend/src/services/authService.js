import { post } from "./httpClient";

export function login({ username, password }) {
  return post("/auth/login", { username, password });
}

export function register({ username, email, password }) {
  return post("/auth/register", { username, email, password });
}

export function oauthLogin({ provider, provider_user_id, email, username }) {
  return post("/auth/oauth-login", {
    provider: "google",
    provider_user_id: provider_user_id,
    email: email,
    username: username
  })
}

export default { login, register };


