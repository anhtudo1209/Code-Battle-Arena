import { post, get, put } from "./httpClient";

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user?: any;
}

export function login(creds: LoginCredentials): Promise<AuthResponse> {
    return post<AuthResponse>("/auth/login", creds).then(response => {
        if (response.accessToken && response.refreshToken) {
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);
        }
        return response;
    });
}

export function register(creds: RegisterCredentials): Promise<AuthResponse> {
    return post<AuthResponse>("/auth/register", creds).then(response => {
        if (response.accessToken && response.refreshToken) {
            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("refreshToken", response.refreshToken);
        }
        return response;
    });
}

export function forgotPassword(email: string): Promise<any> {
    return post("/auth/forgot-password", { email });
}

export function resetPassword(token: string, newPassword: string): Promise<any> {
    return post("/auth/reset-password", { token, newPassword });
}

export function logout(refreshToken: string): Promise<any> {
    return post("/auth/logout", { refreshToken });
}

export function getMe(): Promise<any> {
    return get("/auth/me");
}

export function updateProfile(data: { display_name?: string; avatar_animal?: string; avatar_color?: string }): Promise<any> {
    return put("/auth/profile", data);
}

export function changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return post("/auth/change-password", { currentPassword, newPassword });
}

export function getLeaderboard(): Promise<{ leaderboard: any[] }> {
    return get("/auth/leaderboard");
}

export default { login, register, forgotPassword, resetPassword, logout, getMe, updateProfile, changePassword, getLeaderboard };
