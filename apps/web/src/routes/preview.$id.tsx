import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Rocket } from "lucide-react";

import { trpcClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { ViewForm } from "@/pages/view-form";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/preview/$id")({
  beforeLoad: requireAuth,
  loader: ({ params }) => trpcClient.form.byId.query({ id: params.id }),
  pendingComponent: () => (
    <p className="text-sm text-muted-foreground">Loading form…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="text-sm text-muted-foreground">{error.message}</p>
  ),
  component: PreviewRoute,
});

function PreviewRoute() {
  const form = Route.useLoaderData();
  const publish = trpc.publishedForm.create.useMutation();

  if (form === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        No form to preview yet. Create or edit a form on the left.
      </div>
    );
  }

  return (
    <main className="flex min-h-svh flex-col gap-6 bg-muted/40 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium">{form.title}</h2>
          <p className="text-sm text-muted-foreground">
            Preview of the rendered form.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {form.publishedFormId && (
            <Button asChild variant="outline">
              <Link to="/forms/$id" params={{ id: form.publishedFormId }}>
                <Globe data-icon="inline-start" />
                View published form
              </Link>
            </Button>
          )}
          <Button
            disabled={publish.isPending}
            onClick={() =>
              publish.mutate({
                formId: form.id,
                data: { title: form.title, inputs: form.inputs },
                isActive: true,
              })
            }
          >
            <Rocket data-icon="inline-start" />
            {publish.isPending
              ? "Publishing…"
              : form.publishedFormId
                ? "Republish"
                : "Publish"}
          </Button>
        </div>
      </div>

      {publish.isSuccess && (
        <p className="text-sm text-muted-foreground">
          Published successfully.{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            to="/forms/$id"
            params={{ id: publish.data.id }}
          >
            View published form
          </Link>
        </p>
      )}
      {publish.isError && (
        <p className="text-sm text-destructive">{publish.error.message}</p>
      )}

      <div className="mx-auto w-full max-w-md">
        <ViewForm
          data={{ title: form.title, inputs: form.inputs }}
          isReadonly
        />
      </div>
    </main>
  );
}
