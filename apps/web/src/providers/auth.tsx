import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@repo/server";

import { getToken, setToken } from "@/lib/auth";
import { trpc } from "@/trpc";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(getToken()),
    retry: false,
  });

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    if (meQuery.isSuccess) {
      setUser(meQuery.data);
      setIsLoading(false);
    }
    if (meQuery.isError) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data]);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(username, password) {
        const result = await loginMutation.mutateAsync({ username, password });
        setToken(result.token);
        setUser(result.user);
      },
      async register(username, password) {
        const result = await registerMutation.mutateAsync({
          username,
          password,
        });
        setToken(result.token);
        setUser(result.user);
      },
      logout() {
        setToken(null);
        setUser(null);
        queryClient.clear();
      },
    }),
    [user, isLoading, loginMutation, registerMutation, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}