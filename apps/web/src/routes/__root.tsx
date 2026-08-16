import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <Link
          to="/"
          className="font-heading text-sm font-semibold tracking-tight"
        >
          Dynamic Forms
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.username}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut data-icon="inline-start" />
                Log out
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}