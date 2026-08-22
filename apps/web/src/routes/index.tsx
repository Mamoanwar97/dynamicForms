import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Eye, Globe, Pencil, Plus, Trash2 } from "lucide-react";

import { trpcClient } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
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
      <div className="flex flex-col items-center justify-center gap-2 rounded-[1rem] border bg-card px-6 py-16 text-center">
        <h2 className="font-heading text-lg font-semibold">
          No forms saved yet
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first schema-driven form and it will show up here.
        </p>
        <Button asChild className="mt-4">
          <Link to="/create">
            <Plus data-icon="inline-start" />
            Create form
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div
          key={form.id}
          className="flex flex-col gap-4 rounded-[1rem] border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{form.title}</p>
              <p className="text-xs text-muted-foreground">
                {form.inputs.length} input{form.inputs.length === 1 ? "" : "s"}
              </p>
            </div>
            {form.publishedFormId && (
              <Badge variant="secondary">Published</Badge>
            )}
          </div>
          <div className="mt-auto flex items-center gap-1 border-t pt-3">
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
        </div>
      ))}
    </div>
  );
}

function LandingPage() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit">
              Dynamic forms
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Your forms
            </h1>
            <p className="text-sm text-muted-foreground">
              Design schema-driven forms with a live preview.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/create">
              <Plus data-icon="inline-start" />
              Create form
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <FormsList />
      </div>
    </main>
  );
}
