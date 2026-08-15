import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 bg-muted/40 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="outline">Dynamic forms</Badge>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Build forms, your way
        </h1>
        <p className="max-w-md text-muted-foreground">
          Design schema-driven forms with a live preview. Start fresh or edit
          an existing form.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link to="/create">
            <Plus data-icon="inline-start" />
            Create form
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/edit">
            <Pencil data-icon="inline-start" />
            Edit form
          </Link>
        </Button>
      </div>
    </main>
  );
}
