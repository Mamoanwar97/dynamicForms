import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FormLiveViewer } from "@/pages/form-life-viewer";
import { CommonForm } from "@/pages/common-form";
import { requireAuth } from "@/lib/auth";
import { trpc } from "@/trpc";

export const Route = createFileRoute("/create")({
  beforeLoad: requireAuth,
  component: CreateRoute,
});

function CreateRoute() {
  const navigate = useNavigate();
  const create = trpc.form.create.useMutation({
    onSuccess: () => {
      void navigate({ to: "/" });
    },
  });

  return (
    <FormLiveViewer
      Component={CommonForm}
      onSave={(data) => create.mutate(data)}
    />
  );
}
