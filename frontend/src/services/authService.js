import { post } from "./httpClient";

export function login({ username, password }) {
  return post("/auth/login", { username, password }).then(response => {
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
  });
}

export function register({ username, email, password }) {
  return post("/auth/register", { username, email, password }).then(response => {
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
  });
}

export function oauthLogin({ provider, provider_user_id, email, username }) {
  return post("/auth/oauth-login", {
    provider,
    provider_user_id,
    email,
    username
  }).then(response => {
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
  });
}

export function refreshToken(refreshToken) {
  return post("/auth/refresh", { refreshToken });
}

export function logout(refreshToken) {
  return post("/auth/logout", { refreshToken });
}

export function forgotPassword(email) {
  return post("/auth/forgot-password", { email });
}

export function resetPassword(token, newPassword) {
  return post("/auth/reset-password", { token, newPassword });
}

export default { login, register, refreshToken, logout, forgotPassword, resetPassword };


