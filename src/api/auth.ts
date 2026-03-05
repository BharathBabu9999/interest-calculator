import { api } from "./client";

export interface UserRead {
  id: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserRead;
}

export const authApi = {
  register: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/register", { email, password }),

  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }),

  me: () => api.get<UserRead>("/auth/me"),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, new_password }),

  loginWithGoogle: (id_token: string) =>
    api.post<TokenResponse>("/auth/google", { id_token }),
};
