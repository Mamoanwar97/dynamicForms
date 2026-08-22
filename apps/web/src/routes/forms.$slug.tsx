import { createFileRoute } from "@tanstack/react-router";
import { trpcClient } from "@/api/client";
import { ViewForm } from "@/pages/view-form";
import type { CreateFormData } from "@/schemas/create";

export const Route = createFileRoute("/forms/$slug")({
  loader: ({ params }) =>
    trpcClient.publishedForm.byId.query({ slug: params.slug }),
  pendingComponent: () => (
    <p className="text-sm text-muted-foreground">Loading published form…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="text-sm text-muted-foreground">{error.message}</p>
  ),
  component: PublishedFormRoute,
});

function PublishedFormRoute() {
  const publishedForm = Route.useLoaderData();
  return (
    <ViewForm
      data={publishedForm.data as CreateFormData | undefined}
      isReadonly={false}
    />
  );
}