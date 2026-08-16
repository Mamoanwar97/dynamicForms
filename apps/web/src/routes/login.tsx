import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth-form";
import { getToken } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center bg-muted/40 p-8">
      <AuthForm mode="login" />
    </main>
  );
}