import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { trpcClient } from "@/api/client";
import { CommonForm } from "@/pages/common-form";
import { FormLiveViewer } from "@/pages/form-life-viewer";
import { requireAuth } from "@/lib/auth";

export const Route = createFileRoute("/edit/$id")({
  beforeLoad: requireAuth,
  loader: ({ params }) => trpcClient.form.byId.query({ id: params.id }),
  pendingComponent: () => (
    <p className="text-sm text-muted-foreground">Loading form…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="text-sm text-muted-foreground">{error.message}</p>
  ),
  component: EditRoute,
});

function EditRoute() {
  const { id } = Route.useParams();
  const form = Route.useLoaderData();
  const navigate = useNavigate();
  const update = trpc.form.update.useMutation({
    onSuccess: () => {
      void navigate({ to: "/" });
    },
  });

  return (
    <FormLiveViewer
      Component={CommonForm}
      defaultData={{ title: form.title, inputs: form.inputs }}
      onSave={(data) => update.mutate({ id, data })}
    />
  );
}
