import { createFileRoute } from "@tanstack/react-router";
import { trpcClient } from "@/api/client";
import { ViewForm } from "@/pages/view-form";

export const Route = createFileRoute("/preview/$id")({
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
  if (form === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        No form to preview yet. Create or edit a form on the left.
      </div>
    );
  }
  return (
    <ViewForm data={{ title: form.title, inputs: form.inputs }} isReadonly />
  );
}
