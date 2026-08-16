import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Eye, Globe, Pencil, Plus, Trash2 } from "lucide-react";

import { trpcClient } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/")({
  loader: () => trpcClient.form.list.query(),
  pendingComponent: () => (
    <p className="text-sm text-muted-foreground">Loading forms…</p>
  ),
  component: LandingPage,
});

function FormsList() {
  const forms = Route.useLoaderData();
  const router = useRouter();

  const remove = trpc.form.delete.useMutation({
    onSuccess: () => {
      void router.invalidate();
    },
  });

  if (forms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No forms saved yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="flex w-full max-w-md flex-col gap-2">
      {forms.map((form) => (
        <li
          key={form.id}
          className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{form.title}</p>
              {form.publishedFormId && (
                <Badge variant="secondary">Published</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {form.inputs.length} input{form.inputs.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {form.publishedFormId && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`View published ${form.title}`}
              >
                <Link to="/forms/$id" params={{ id: form.publishedFormId }}>
                  <Globe />
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={`Edit ${form.title}`}
            >
              <Link to="/edit/$id" params={{ id: form.id }}>
                <Pencil />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={`Preview ${form.title}`}
            >
              <Link to="/preview/$id" params={{ id: form.id }}>
                <Eye />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${form.title}`}
              disabled={remove.isPending}
              onClick={() => remove.mutate({ id: form.id })}
            >
              <Trash2 />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

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
      </div>

      <FormsList />
    </main>
  );
}
