import { redirect } from "@tanstack/react-router";

const TOKEN_KEY = "dynamicForms.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function requireAuth(): void {
  if (!getToken()) {
    throw redirect({ to: "/login" });
  }
}