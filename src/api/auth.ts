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
};
